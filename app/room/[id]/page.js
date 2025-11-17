"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ensureAnonAuth, db, serverTimestamp, auth } from "@/lib/firebase";
import { collection, doc, onSnapshot, orderBy, query, addDoc, getDoc } from "firebase/firestore";
import Message from "@/components/Message";
import ChatInput from "@/components/ChatInput";
import "./chatRoom.css";

export default function RoomPage() {
  const params = useParams();
  const id = useMemo(() => decodeURIComponent(params?.id || ""), [params?.id]);
  const [user, setUser] = useState(null);
  const [handle, setHandle] = useState("anon");
  const [messages, setMessages] = useState([]);
  const [roomMeta, setRoomMeta] = useState(null);
  const handleCacheRef = useRef({});
  const [handleMap, setHandleMap] = useState({});
  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [generalQuestion, setGeneralQuestion] = useState("");
  const [generalAnswer, setGeneralAnswer] = useState("");
  const [generalLoading, setGeneralLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const bottomRef = useRef(null);

  const cleanResponse = (text = "") => text.replace(/\*\*/g, "").trim();

  useEffect(() => {
    (async () => {
      const u = await ensureAnonAuth();
      setUser(u);
      const userSnap = await getDoc(doc(db, "users", u.uid));
      setHandle(userSnap.exists() ? userSnap.data().handle : "anon");

      const roomSnap = await getDoc(doc(db, "rooms", id));
      setRoomMeta(roomSnap.exists() ? roomSnap.data() : { title: id });
      const q = query(collection(db, "rooms", id, "messages"), orderBy("createdAt", "asc"));
      const unsub = onSnapshot(q, (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMessages(docs);
        hydrateHandles(docs);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      });
      return () => unsub();
    })();
  }, [id]);

  async function send(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const u = auth.currentUser;
    const askMatch = trimmed.match(/^\\(ask|mr\.?\s*monopoly)\s*(.*)$/i);
    const isAsk = Boolean(askMatch);
    const question = askMatch ? askMatch[2].trim() : "";

    const outgoingText = isAsk ? (question || trimmed) : trimmed;
    if (isAsk && !question.length) {
      setAiStatus("Add a question after \\ask to query Mr. Monopoly.");
      return;
    }

    await addDoc(collection(db, "rooms", id, "messages"), {
      uid: u.uid,
      handle,
      text: outgoingText,
      createdAt: serverTimestamp(),
      type: "user"
    });

    if (isAsk) {
      await handleAsk(question);
    }
  }

  async function hydrateHandles(msgs) {
    const missing = [
      ...new Set(
        msgs
          .map((m) => m.uid)
          .filter((uid) => uid && !handleCacheRef.current[uid])
      )
    ];
    if (!missing.length) return;
    const updates = {};
    await Promise.all(
      missing.map(async (uid) => {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data?.handle) updates[uid] = data.handle;
        }
      })
    );
    if (Object.keys(updates).length) {
      handleCacheRef.current = { ...handleCacheRef.current, ...updates };
      setHandleMap({ ...handleCacheRef.current });
    }
  }

  async function summarizeRoom() {
    try {
      setSummarizing(true);
      setSummary("");
      const res = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: id, mode: "summary" })
      });
      if (!res.ok) {
        let errMsg = "Failed to summarize";
        try {
          const errBody = await res.json();
          errMsg = errBody.details || errBody.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      setSummary(cleanResponse(data.text));
    } catch (err) {
      setSummary(err.message);
    } finally {
      setSummarizing(false);
    }
  }

  async function handleAsk(question) {
    try {
      setAsking(true);
      setAiStatus("Mr. Monopoly is thinking…");
      const res = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: id, mode: "qa", question })
      });
      if (!res.ok) {
        let errMsg = "Gemini request failed";
        try {
          const err = await res.json();
          errMsg = err.details || err.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      const answer = cleanResponse(data.text || "No response.");
      await addDoc(collection(db, "rooms", id, "messages"), {
        uid: "mr-monopoly",
        handle: "Mr. Monopoly",
        text: answer,
        type: "assistant",
        createdAt: serverTimestamp()
      });
      setAiStatus("");
    } catch (err) {
      setAiStatus(err.message);
    } finally {
      setAsking(false);
    }
  }

  async function askGeneral(question) {
    try {
      setGeneralError("");
      setGeneralLoading(true);
      setGeneralAnswer("");
      const res = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "general", question })
      });
      if (!res.ok) {
        let errMsg = "Failed to get an answer.";
        try {
          const errBody = await res.json();
          errMsg = errBody.details || errBody.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      setGeneralAnswer(cleanResponse(data.text || "I'm not sure yet."));
    } catch (err) {
      setGeneralError(err.message);
    } finally {
      setGeneralLoading(false);
    }
  }

  return (
    <main className="room-root">
      <header className="room-header">
        <div>
          <p className="room-title">{roomMeta?.title || `Room ${id}`}</p>
          <p className="room-code">Code: {id}</p>
        </div>
      </header>

      <section className="room-layout">
        <div className="chat-panel">
          <div className="text-chat-box">
            {messages.map((m) => (
              <Message
                key={m.id}
                m={m}
                self={user}
                displayHandle={handleMap[m.uid] || m.handle}
              />
            ))}
            <div ref={bottomRef} />
          </div>
          <ChatInput
            onSend={send}
            extraAction={
              <button
                type="button"
                className="form-button secondary"
                onClick={summarizeRoom}
                disabled={summarizing}
              >
                {summarizing ? "Summarizing..." : "Summarize Mr. Monopoly"}
              </button>
            }
          />
          {aiStatus && <div className="ai-status">{aiStatus}</div>}
        </div>

        <aside className="ai-card" aria-live="polite">
          <p className="ai-summary-header">Mr. Monopoly</p>

          <div className="ai-section">
            <p className="ai-section-title">Chat Summary</p>
            {summarizing && <p className="ai-data">Hold on let me summarize…</p>}
            {!summarizing && summary && <p className="ai-data">{summary}</p>}
            {!summarizing && !summary && (
              <p className="ai-data muted">Trigger a summary to see it here.</p>
            )}
          </div>

          <div className="ai-section">
            <p className="ai-section-title">Chat-aware Q&A</p>
            <form
              className="ai-ask-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const trimmed = aiQuestion.trim();
                if (!trimmed) return;
                await send(`\\ask ${trimmed}`);
                setAiQuestion("");
              }}
            >
              <input
                type="text"
                className="ai-ask-input"
                placeholder="Ask about this room..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                disabled={asking}
              />
              <button type="submit" className="ai-ask-button" disabled={asking}>
                {asking ? "Thinking..." : "Ask room"}
              </button>
            </form>
          </div>

          <div className="ai-section">
            <p className="ai-section-title">Ask Anything</p>
            <form
              className="ai-ask-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const trimmed = generalQuestion.trim();
                if (!trimmed) return;
                await askGeneral(trimmed);
                setGeneralQuestion("");
              }}
            >
              <input
                type="text"
                className="ai-ask-input"
                placeholder="What's on your mind?"
                value={generalQuestion}
                onChange={(e) => setGeneralQuestion(e.target.value)}
                disabled={generalLoading}
              />
              <button type="submit" className="ai-ask-button dark" disabled={generalLoading}>
                {generalLoading ? "Thinking..." : "Ask anything"}
              </button>
            </form>
            {generalLoading && <p className="ai-data">Consulting the archives…</p>}
            {!generalLoading && generalAnswer && <p className="ai-data">{generalAnswer}</p>}
            {generalError && <p className="ai-data error">{generalError}</p>}
          </div>
        </aside>
      </section>
    </main>
  );
}

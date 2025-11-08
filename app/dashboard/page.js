"use client";
import { useEffect, useState } from "react";
import { ensureAnonAuth, db, serverTimestamp } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";

export default function Dashboard() {
  const [title, setTitle] = useState("Aisle 7 – Monitors");
  const [roomId, setRoomId] = useState("demo-aisle7");
  const [durationMins, setDur] = useState(120);
  const [status, setStatus] = useState("");

  useEffect(()=>{ ensureAnonAuth(); },[]);

  async function createRoom() {
    setStatus("Creating...");
    const expiresAt = new Date(Date.now()+durationMins*60*1000);
    await setDoc(doc(db, "rooms", roomId), {
      title, expiresAt, createdAt: serverTimestamp()
    });
    setStatus("Created!");
  }

  async function broadcast() {
    setStatus("Broadcasting...");
    await addDoc(collection(db, "rooms", roomId, "messages"), {
      uid: "staff",
      handle: "Store",
      type: "broadcast",
      pinned: true,
      text: '⚡ Today only: $10 off any 27" monitor at checkout.',
      createdAt: serverTimestamp()
    });
    setStatus("Broadcast sent.");
  }

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">Store Dashboard</h1>
      <div className="card p-4 space-y-3">
        <label className="block text-sm">Room ID</label>
        <input className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" value={roomId} onChange={e=>setRoomId(e.target.value)} />

        <label className="block text-sm mt-2">Title</label>
        <input className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)} />

        <label className="block text-sm mt-2">Duration (mins)</label>
        <input type="number" className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" value={durationMins} onChange={e=>setDur(Number(e.target.value)||60)} />

        <div className="flex gap-2 mt-3">
          <button onClick={createRoom} className="px-4 py-2 rounded bg-green-600">Create/Update Room</button>
          <button onClick={broadcast} className="px-4 py-2 rounded bg-indigo-600">Send Broadcast</button>
        </div>
        <div className="text-sm text-gray-400">{status}</div>
      </div>
      <div className="card p-4">
        <p className="text-sm">Generate QR after creating the room:</p>
        <pre className="text-xs bg-black/30 p-2 rounded mt-2 overflow-auto">$ npm run qr -- --room {roomId}</pre>
      </div>
    </main>
  );
}

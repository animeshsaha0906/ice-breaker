//Client component for useState, useEffect
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./landingPage.css";

import React from "react";

export default function Home() {
  const router = useRouter();
  const [makeRoomName, setMakeRoomName] = useState("");
  const [makeError, setMakeError] = useState(false);
  const [joinRoomName, setJoinRoomName] = useState("");
  const [joinError, setJoinError] = useState(false);

  function handleMakeRoom(e) {
    e.preventDefault();
    if (!makeRoomName.trim()) {
      setMakeError(true);
      setTimeout(() => setMakeError(false), 600);
      return;
    }
    router.push(`/join?room=${encodeURIComponent(makeRoomName)}&create=true`);
  }

  function handleJoinRoom(e) {
    e.preventDefault();
    if (!joinRoomName.trim()) {
      setJoinError(true);
      setTimeout(() => setJoinError(false), 600);
      return;
    }
    router.push(`/join?room=${encodeURIComponent(joinRoomName)}&create=false`);
  }

  return (
    <main className="landing-root">
      <div className="iceBreakers-Logo" aria-label="Ice Breakers logo">
        <div className="iceBreakers-Box">
          <h1 className="iceBreakers-text">Ice-Breakers</h1>
        </div>
      </div>

      <section className="landingPageButtons">
        <article className="roomCard makeRoom">
          <div className="card-header makeRoom-Color">
            <h2>Create a room</h2>
            <p>Share a code and invite the crowd in seconds.</p>
          </div>

          <form className="card-form" onSubmit={handleMakeRoom}>
            <label htmlFor="makeRoomInput" className="room-label">
              Room name
            </label>
            <input
              type="text"
              id="makeRoomInput"
              value={makeRoomName}
              onChange={(e) => setMakeRoomName(e.target.value)}
              placeholder="e.g. keynote-circle"
              className={`room-input ${makeError ? "input-error shake" : ""}`}
              aria-invalid={makeError}
            />
            <button type="submit" className="room-button primary">
              Launch room
            </button>
          </form>
        </article>

        <article className="roomCard joinRoom">
          <div className="card-header joinRoom-Color">
            <h2>Join a room</h2>
            <p>Enter the code from the host to hop into chat.</p>
          </div>

          <form className="card-form" onSubmit={handleJoinRoom}>
            <label htmlFor="joinRoomInput" className="room-label">
              Room code
            </label>
            <input
              type="text"
              id="joinRoomInput"
              value={joinRoomName}
              onChange={(e) => setJoinRoomName(e.target.value)}
              placeholder="Room Code"
              className={`room-input ${joinError ? "input-error shake" : ""}`}
              aria-invalid={joinError}
            />
            <button type="submit" className="room-button secondary">
              Enter room
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}

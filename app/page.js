//Client component for useState, useEffect
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import './landingPage.css';

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
      setTimeout(() => setMakeError(false), 500); 
      return;
    }
    router.push(`/join?room=${encodeURIComponent(makeRoomName)}&create=true`);
  }

  function handleJoinRoom(e) {
  e.preventDefault();
  if (!joinRoomName.trim()) {
    setJoinError(true);
    setTimeout(() => setJoinError(false), 500); // remove shake after animation
    return;
  }
    router.push(`/join?room=${encodeURIComponent(joinRoomName)}&create=false`);
  }

  return (
    <main>
      <div className="iceBreakers-Logo">
        <div className="iceBreakers-Box">
          <h1 className="iceBreakers-text">Ice-Breakers</h1>
        </div>
      </div>

      <div className="landingPageButtons">
        <div className="makeRoom">
          <div className="makeRoom-Color"></div>
          <form onSubmit={handleMakeRoom}>
            <label htmlFor="makeRoomInput" className="makeRoom-Label">Make a Room</label>
            <input
              type="text"
              id="makeRoomInput"
              value={makeRoomName}
              onChange={(e) => setMakeRoomName(e.target.value)}
              placeholder="Room Name"
              className={`makeRoom-Textbox ${makeError ? 'border-red-500 shake' : ''}`}
            />
            <input type="submit" className="makeRoom-Button" value="Enter" />
          </form>
        </div>

        <div className="joinRoom">
          <div className="joinRoom-Color"></div>
          <form onSubmit={handleJoinRoom}>
            <label htmlFor="joinRoomInput" className="joinRoom-Label">Join a Room</label>
            <input
              type="text"
              id="joinRoomInput"
              value={joinRoomName}
              onChange={(e) => setJoinRoomName(e.target.value)}
              placeholder="Room Code"
              className={`joinRoom-Textbox ${joinError ? 'border-red-500 shake' : ''}`}
            />
            <input type="submit" className="joinRoom-Button" value="Enter" />
          </form>
        </div>
      </div>
    </main>
  );
}

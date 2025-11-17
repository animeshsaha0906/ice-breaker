"use client";
import { useState } from "react";
import "./chatBox.css";

export default function ChatInput({ onSend, disabled, extraAction }) {
  const [text, set] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim().length) return;
    onSend(text.trim());
    set("");
  }

  return (
    <form onSubmit={handleSubmit} className="form-whole">
      <input
        value={text}
        onChange={(e) => set(e.target.value)}
        placeholder="Ask or share..."
        maxLength={500}
        disabled={disabled}
        className="form-input"
      />
      <div className="form-buttons">
        <button type="submit" disabled={disabled} className="form-button primary">
          Send
        </button>
        {extraAction}
      </div>
    </form>
  );
}

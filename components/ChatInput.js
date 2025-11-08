"use client";
import { useState } from "react";
export default function ChatInput({ onSend, disabled }) {
  const [text, set] = useState("");
  return (
    <form
      onSubmit={(e)=>{e.preventDefault(); if(text.trim().length){ onSend(text.trim()); set(""); }}}
      className="flex gap-2 mt-2"
    >
      <input
        value={text}
        onChange={(e)=>set(e.target.value)}
        className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-600 outline-none"
        placeholder="Ask or share..."
        maxLength={500}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled}
        className="px-4 py-2 rounded bg-blue-600 disabled:opacity-50"
      >Send</button>
    </form>
  );
}

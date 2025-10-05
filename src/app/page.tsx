"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!message.trim()) return;
    setLoading(true);
    setReply("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setReply(data.reply);
    } catch (err) {
      setReply("⚠️ Error reaching the stars. Try again!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-indigo-950 to-black text-white">
      <h1 className="text-3xl font-bold mb-4">✨ Ask Kuvexi ✨</h1>
      <textarea
        className="w-full max-w-md p-3 text-black rounded-lg"
        rows={3}
        placeholder="Ask anything about life, love, or the universe..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        onClick={handleAsk}
        disabled={loading}
        className="mt-3 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? "Consulting the stars..." : "Ask"}
      </button>

      {reply && (
        <p className="mt-6 max-w-md text-lg text-center whitespace-pre-line">
          {reply}
        </p>
      )}
    </main>
  );
}

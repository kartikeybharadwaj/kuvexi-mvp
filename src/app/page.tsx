"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toastSuccess } from "@/lib/toast";

type Vibe = { phase: string; emoji: string; mood: string };

export default function Home() {
  // Auth + UI state
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  // Daily vibe card
  const [vibe, setVibe] = useState<Vibe | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    fetch("/api/daily")
      .then((r) => r.json())
      .then((d: Vibe) => setVibe(d))
      .catch(() => setVibe(null));
  }, []);

  async function handleAsk() {
    if (!user) {
      toastSuccess("⚠️ Please sign in to ask questions.");
      return;
    }
    if (!message.trim()) return;

    setLoading(true);
    setReply("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data: { reply?: string } = await res.json();
      const text = data.reply || "✨ Cosmic silence ✨";
      setReply(text);

      await addDoc(collection(db, "users", user.uid, "messages"), {
        question: message,
        answer: text,
        createdAt: serverTimestamp(),
      });
    } catch {
      setReply("⚠️ Error reaching the stars. Try again!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-white text-black">
      {/* Header */}
      <div className="absolute top-4 right-4 flex items-center gap-2 text-sm">
        {user ? (
          <>
            <span className="opacity-80 hidden sm:inline">Hi, {user.email}</span>
            <Link
              href="/profile"
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
            >
              Profile
            </Link>
            <button
              onClick={() => signOut(auth)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-500"
          >
            Login / Sign up
          </Link>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-4 text-indigo-700">✨ Ask Kuvexi ✨</h1>

      {/* Daily Vibe card */}
      {vibe && (
        <div className="w-full max-w-md mb-6 p-4 border border-gray-300 rounded-lg text-center bg-gray-50">
          <div className="text-3xl">{vibe.emoji}</div>
          <p className="text-lg font-semibold">{vibe.phase}</p>
          <p className="text-sm text-gray-600">{vibe.mood}</p>
        </div>
      )}

      {/* Ask input */}
      <textarea
        className="w-full max-w-md p-3 border border-gray-300 rounded-lg"
        rows={3}
        placeholder="Ask anything about life, love, or the universe..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={handleAsk}
        disabled={loading}
        className={`mt-3 px-4 py-2 rounded-lg text-white ${
          user ? "bg-indigo-600 hover:bg-indigo-500" : "bg-gray-400 cursor-not-allowed"
        } disabled:opacity-50`}
      >
        {loading ? "Consulting the stars..." : user ? "Ask" : "Sign in to Ask"}
      </button>

      {reply && (
        <p className="mt-6 max-w-md text-lg text-center whitespace-pre-line text-gray-800">
          {reply}
        </p>
      )}
    </main>
  );
}

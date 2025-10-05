"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

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
      const text = data.reply || "✨ Cosmic silence ✨";
      setReply(text);

      if (user?.uid) {
        await addDoc(collection(db, "users", user.uid, "messages"), {
          question: message,
          answer: text,
          createdAt: serverTimestamp(),
        });
      }
    } catch {
      setReply("⚠️ Error reaching the stars. Try again!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-white text-black">
      <div className="absolute top-4 right-4 flex items-center gap-2 text-sm">
  {user ? (
    <>
      <span className="opacity-80 hidden sm:inline">Hi, {user.email}</span>
      <a
        href="/profile"
        className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
      >
        Profile
      </a>
      <button
        onClick={() => signOut(auth)}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
      >
        Logout
      </button>
    </>
  ) : (
    <a
      href="/login"
      className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-500"
    >
      Login / Sign up
    </a>
  )}
</div>


      <h1 className="text-3xl font-bold mb-4 text-indigo-700">✨ Ask Kuvexi ✨</h1>
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
        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? "Consulting the stars..." : "Ask"}
      </button>

      {reply && (
        <p className="mt-6 max-w-md text-lg text-center whitespace-pre-line text-gray-800">
          {reply}
        </p>
      )}
    </main>
  );
}

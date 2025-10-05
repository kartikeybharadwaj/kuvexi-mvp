"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getZodiacSign } from "@/lib/zodiac";
import Link from "next/link";
import { toastSuccess } from "@/lib/toast";

type ProfileDoc = { dob?: string; zodiac?: string; vibeBio?: string };

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [dob, setDob] = useState("");
  const [zodiac, setZodiac] = useState("");
  const [vibeBio, setVibeBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as ProfileDoc;
          setDob(data.dob ?? "");
          setZodiac(data.zodiac ?? "");
          setVibeBio(data.vibeBio ?? "");
        }
      }
    });
    return () => unsub();
  }, []);

  async function handleSave() {
    if (!user) return;
    if (!dob) {
      setMsg("⚠️ Please select your date of birth");
      return;
    }
    const d = new Date(dob);
    const z = getZodiacSign(d.getMonth() + 1, d.getDate());
    setZodiac(z);
    await setDoc(doc(db, "users", user.uid), { dob, zodiac: z, vibeBio }, { merge: true });
    toastSuccess("Profile saved!");
    setMsg("✅ Profile saved");
  }

  async function handleGenerateVibe() {
    if (!dob) {
      setMsg("⚠️ Set your DOB first");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Write a short, fun one-line bio for someone whose zodiac sign is ${zodiac}.`,
        }),
      });
      const data: { reply?: string } = await res.json();
      const bio = data.reply || "✨ Radiating cosmic energy ✨";
      setVibeBio(bio);
      if (user) await setDoc(doc(db, "users", user.uid), { vibeBio: bio }, { merge: true });
      toastSuccess("🌟 Vibe bio generated!");
    } catch {
      setMsg("⚠️ Couldn't reach AI service");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="w-full flex items-center justify-between p-4 border-b bg-white sticky top-0">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Ask
        </Link>

        {user ? (
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <span>
              Signed in as <b>{user.email}</b>
            </span>
            <button
              onClick={() => signOut(auth)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-500"
          >
            Login
          </Link>
        )}
      </header>

      <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-black bg-white">
        <h1 className="text-3xl font-bold">🌞 Your Cosmic Profile</h1>

        {user ? (
          <>
            <label className="text-lg">Date of Birth:</label>
            <input
              type="date"
              className="border border-gray-400 rounded p-2"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />

            <button
              onClick={handleSave}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
            >
              Save
            </button>

            {zodiac && (
              <p>
                Your Zodiac Sign: <b>{zodiac}</b>
              </p>
            )}

            <button
              onClick={handleGenerateVibe}
              disabled={loading}
              className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-500 disabled:opacity-50"
            >
              {loading ? "Consulting the stars..." : "Generate Vibe Bio ✨"}
            </button>

            {vibeBio && (
              <p className="mt-4 max-w-md text-center text-lg italic">
                {vibeBio}
              </p>
            )}
          </>
        ) : (
          <p className="text-lg text-gray-600">
            Please{" "}
            <Link href="/login" className="text-blue-600 underline">
              sign in
            </Link>{" "}
            to access your profile.
          </p>
        )}

        {msg && <p className="mt-2">{msg}</p>}
      </main>
    </>
  );
}

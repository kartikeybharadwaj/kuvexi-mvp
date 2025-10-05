"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { toastSuccess } from "@/lib/toast";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");

  async function handleAuth() {
    setMsg("");
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, pass);
        toastSuccess("Account created! Redirecting...");
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
        toastSuccess("Signed in! Redirecting...");
      }
      setTimeout(() => router.push("/"), 1000);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Auth error";
      setMsg("⚠️ " + message);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-white bg-gradient-to-b from-indigo-950 to-black">
      <h1 className="text-3xl font-bold">
        🔐 {mode === "signup" ? "Create account" : "Sign in"}
      </h1>
      <input
        className="w-full max-w-sm p-3 rounded text-black"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full max-w-sm p-3 rounded text-black"
        placeholder="Password"
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
      />
      <button
        onClick={handleAuth}
        className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
      >
        {mode === "signup" ? "Sign up & Continue" : "Sign in"}
      </button>

      <button
        onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
        className="underline"
      >
        {mode === "signup"
          ? "Already have an account? Sign in"
          : "New here? Create an account"}
      </button>

      {msg && <p className="mt-2">{msg}</p>}
      <Link href="/" className="mt-6 underline">
        ← Back to Ask
      </Link>
    </main>
  );
}

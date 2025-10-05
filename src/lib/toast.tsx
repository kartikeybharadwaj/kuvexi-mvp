"use client";
import { useEffect, useState } from "react";

export function toastSuccess(message: string) {
  const event = new CustomEvent("toast-success", { detail: message });
  window.dispatchEvent(event);
}

export function ToastContainer() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handler = (e: any) => {
      setMessage(e.detail);
      setTimeout(() => setMessage(""), 2000);
    };
    window.addEventListener("toast-success", handler);
    return () => window.removeEventListener("toast-success", handler);
  }, []);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300">
      {message}
    </div>
  );
}

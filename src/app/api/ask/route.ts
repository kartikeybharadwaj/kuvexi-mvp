import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Kuvexi, a witty cosmic best friend who answers questions in a fun astrology-inspired tone.",
          },
          { role: "user", content: message },
        ],
        temperature: 0.8,
      }),
    });

    // log status & raw output for debugging
    console.log("🪐 OpenAI status:", response.status);
    const data = await response.json();
    console.log("🪐 OpenAI raw:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return NextResponse.json(
        { error: `OpenAI error ${response.status}` },
        { status: response.status }
      );
    }

    const reply = data.choices?.[0]?.message?.content ?? "✨ Cosmic silence ✨";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("❌ Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

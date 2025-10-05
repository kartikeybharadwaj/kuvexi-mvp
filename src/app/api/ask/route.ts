import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // safety guard
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // call OpenAI
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
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

    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content || "✨ Cosmic silence ✨";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

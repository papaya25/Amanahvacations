import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildChatSystemPrompt } from "@/lib/chatContext";

/* AI travel assistant endpoint. The browser sends the visible conversation;
   the server builds the knowledge prompt from live site content and asks
   Claude for the next reply. Guardrails: capped conversation size and message
   length, small max_tokens, and prompt caching on the (stable) system prompt. */

const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 2000;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "assistant not configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { messages?: ChatMessage[] } | null;
  const raw = body?.messages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return NextResponse.json({ error: "no messages" }, { status: 400 });
  }

  // Sanitize: only role/content pairs, bounded length, bounded history.
  const messages = raw
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "invalid conversation" }, { status: 400 });
  }

  try {
    const system = await buildChatSystemPrompt();
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 700,
      system: [
        {
          type: "text",
          text: system,
          // Stable prefix → cached across the conversation's turns.
          cache_control: { type: "ephemeral" },
        },
      ],
      messages,
    });

    const reply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (response.stop_reason === "refusal" || !reply) {
      return NextResponse.json({
        reply:
          "I'd rather hand this one to our human team — message us on WhatsApp at +52 984 452 1184 and we'll help you right away! 🌴",
      });
    }
    return NextResponse.json({ reply });
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      console.error("chat route:", e.status, e.message);
    } else {
      console.error("chat route:", e instanceof Error ? e.message : e);
    }
    return NextResponse.json(
      { error: "The assistant is taking a break — please try again in a moment, or message us on WhatsApp." },
      { status: 502 }
    );
  }
}

"use client";

/* Floating AI travel assistant. Brand-styled chat panel; conversation lives in
   sessionStorage so it survives page changes but resets when the tab closes. */

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "amanah_chat_v1";
const GREETING =
  "¡Hola! 🌴 I'm the Amanah travel assistant. Ask me anything about our private tours, packages and prices — in English, français, español or العربية.";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      /* ignore */
    }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json().catch(() => null)) as { reply?: string; error?: string } | null;
      if (res.ok && data?.reply) {
        setMessages((m) => [...m, { role: "assistant", content: data.reply! }]);
      } else {
        setError(data?.error ?? "Something went wrong — please try again.");
      }
    } catch {
      setError("Connection problem — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close travel assistant chat" : "Chat with our travel assistant"}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-terracotta to-gold text-white shadow-[0_10px_30px_rgba(200,105,58,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(200,105,58,0.55)]"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-[84px] right-4 z-[60] flex h-[min(560px,calc(100dvh-110px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-[20px] border border-sand bg-white shadow-[0_24px_70px_rgba(28,43,30,0.28)]">
          {/* Header */}
          <div className="flex items-center gap-3 bg-night px-4 py-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-[18px]">🌴</div>
            <div className="min-w-0">
              <div className="font-serif text-[15px] font-semibold leading-tight text-white">
                Amanah Travel Assistant
              </div>
              <div className="text-[10.5px] text-white/55">
                AI assistant · EN · FR · ES · العربية
              </div>
            </div>
            <a
              href="https://wa.me/529844521184"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto shrink-0 rounded-full bg-[#25D366] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:brightness-110"
            >
              Human 👋
            </a>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-cream px-3.5 py-4">
            <div className="max-w-[85%] rounded-[14px] rounded-tl-[4px] border border-sand bg-white px-3.5 py-2.5 text-[13px] leading-[1.6] text-ink">
              {GREETING}
            </div>
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="ml-auto max-w-[85%] rounded-[14px] rounded-tr-[4px] bg-forest px-3.5 py-2.5 text-[13px] leading-[1.6] text-white">
                  {m.content}
                </div>
              ) : (
                <div key={i} className="max-w-[85%] whitespace-pre-wrap rounded-[14px] rounded-tl-[4px] border border-sand bg-white px-3.5 py-2.5 text-[13px] leading-[1.6] text-ink">
                  {m.content}
                </div>
              )
            )}
            {busy && (
              <div className="flex w-fit items-center gap-1.5 rounded-[14px] rounded-tl-[4px] border border-sand bg-white px-4 py-3">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-sage"
                    style={{ animationDelay: `${d * 0.15}s` }}
                  />
                ))}
              </div>
            )}
            {error && (
              <div className="max-w-[85%] rounded-[14px] border border-terracotta/40 bg-terracotta/5 px-3.5 py-2.5 text-[12.5px] leading-[1.6] text-terracotta">
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 border-t border-sand bg-white p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Ask about tours, prices, dates…"
              className="max-h-24 flex-1 resize-none rounded-xl border-[1.5px] border-sand bg-cream/50 px-3.5 py-2.5 text-[13px] text-ink outline-none transition focus:border-forest"
            />
            <button
              onClick={send}
              disabled={busy || !input.trim()}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-terracotta to-gold text-white transition enabled:hover:-translate-y-0.5 disabled:opacity-40"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

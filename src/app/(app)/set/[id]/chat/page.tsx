"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Mic, Send, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocalSet } from "@/lib/data";
import { getAiHeaders } from "@/lib/byok";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface SpeechRecognitionEventLike {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface SpeechRecognitionInstance {
  lang: string;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

export default function TutorChatPage() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  function startVoiceInput() {
    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) return alert("Browser/perangkat ini belum mendukung input suara.");
    const rec = new SpeechRec();
    rec.lang = "id-ID";
    rec.onresult = (e) => setInput(e.results[0][0].transcript);
    rec.start();
  }

  function speakText(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "id-ID";
    window.speechSynthesis.speak(utter);
  }

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setLoading(true);
    try {
      const set = getLocalSet(id);
      const res = await fetch(`/api/tutor/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAiHeaders() },
        body: JSON.stringify({ content: trimmed, context: set?.summary_markdown ?? "" }),
      });

      const raw = await res.text();
      let data: { reply?: string; error?: string } = {};
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`HTTP ${res.status}: respon server bukan JSON`);
      }

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply ?? data.error ?? `Gagal menjawab (HTTP ${res.status}).`,
        },
      ]);
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Koneksi bermasalah.";
      setMessages((m) => [...m, { role: "assistant", content: `Error: ${detail}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-120px)] max-w-[720px] flex-col p-4">
      <div role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <div className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-muted">
            Ada bagian yang masih bingung? Tanyakan lewat ketikan atau tombol mikrofon di bawah.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] whitespace-pre-wrap rounded-lg p-3 text-sm ${
              m.role === "user"
                ? "ml-auto bg-accent text-on-accent"
                : "mr-auto border border-border bg-surface text-text"
            }`}
          >
            {m.content}
            {m.role === "assistant" && (
              <button
                type="button"
                onClick={() => speakText(m.content)}
                aria-label="Bacakan jawaban"
                className="mt-2 flex items-center gap-1 text-xs text-accent"
              >
                <Volume2 className="h-3.5 w-3.5" /> Dengarkan
              </button>
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex gap-2 border-t border-border pt-3"
      >
        <Button type="button" variant="secondary" onClick={startVoiceInput} aria-label="Tanya lewat suara">
          <Mic className="h-4 w-4" />
        </Button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanyakan apa saja dari materi ini..."
          className="h-10 flex-1 rounded-md border border-border-input bg-surface px-3 text-sm"
        />
        <Button type="submit" loading={loading} disabled={!input.trim()} aria-label="Kirim">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

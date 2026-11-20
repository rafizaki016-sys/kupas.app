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

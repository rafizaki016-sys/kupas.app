"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  FileText,
  HelpCircle,
  History,
  Home,
  Layers,
  MessageSquare,
  Mic,
  PlayCircle,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  DEFAULT_NOTES,
  readStoredNotes,
  type StudyNote,
} from "@/lib/kupas-store";

type HubTab = "beranda" | "catatan" | "kartu" | "kuis" | "tanya";

export default function DashboardHubPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<StudyNote[]>(DEFAULT_NOTES);
  const [activeTab, setActiveTab] = useState<HubTab>("beranda");
  const [prompt, setPrompt] = useState<string>("");

  // Flashcard quick practice state
  const [cardIdx, setCardIdx] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);

  // Quiz quick practice state
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [chosenOpt, setChosenOpt] = useState<number | null>(null);

  // Ask / Tanya state
  const [askInput, setAskInput] = useState<string>("");
  const [chatLog, setChatLog] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "Halo! Pilih catatanmu atau tanya topik apa saja yang sedang kamu pelajari di Kupas.",
    },
  ]);

  useEffect(() => {
    setNotes(readStoredNotes());
  }, []);

  const latestNote = notes[0] ?? DEFAULT_NOTES[0];

  const allFlashcards = useMemo(() => {
    const list = notes.flatMap((n) => n.flashcards);
    return list.length > 0 ? list : DEFAULT_NOTES[0].flashcards;
  }, [notes]);

  const allQuizzes = useMemo(() => {
    const list = notes.flatMap((n) => n.quiz);
    return list.length > 0 ? list : DEFAULT_NOTES[0].quiz;
  }, [notes]);

  const activeCard = allFlashcards[cardIdx % allFlashcards.length];
  const activeQuiz = allQuizzes[quizIdx % allQuizzes.length];

  function handleStartFromPrompt(e: FormEvent) {
    e.preventDefault();
    const q = prompt.trim();
    if (!q) return;
    router.push(`/lessons/new?source=upload&q=${encodeURIComponent(q)}`);
  }

  function handleSourceQuickAction(source: "record" | "upload" | "link") {
    const q = prompt.trim();
    if (q) {
      router.push(`/lessons/new?source=${source}&q=${encodeURIComponent(q)}`);
    } else {
      router.push(`/lessons/new?source=${source}`);
    }
  }

  function handleAskSubmit(e: FormEvent) {
    e.preventDefault();
    const q = askInput.trim();
    if (!q) return;
    setChatLog((prev) => [
      ...prev,
      { role: "user", text: q },
      {
        role: "assistant",
        text: `Untuk topik "${q}", kamu bisa mulai dari materi "${latestNote.title}" lalu menguji pemahaman lewat Kartu atau Kuis.`,
      },
    ]);
    setAskInput("");
  }

  const sidebarItems: { key: HubTab; label: string; icon: typeof Home }[] = [
    { key: "beranda", label: "Beranda", icon: Home },
    { key: "catatan", label: "Catatan", icon: FileText },
    { key: "kartu", label: "Kartu", icon: Layers },
    { key: "kuis", label: "Kuis", icon: HelpCircle },
    { key: "tanya", label: "Tanya", icon: MessageSquare },
  ];

  return (
    <div
      className="min-h-screen text-[#1d2433]"
      style={{
        backgroundColor: "#faf6ee",
        backgroundImage: "radial-gradient(#d8d0c0 1.25px, transparent 1.25px)",
        backgroundSize: "18px 18px",
      }}
    >
      {/* Top Bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b-[1.5px] border-[#1d2433] bg-[#fffdf8] px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("beranda")}
            className="inline-flex items-center gap-2 font-extrabold tracking-tight text-[#1d2433]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg border-[1.5px] border-[#1d2433] bg-[#faf6ee]">
              <BookOpen className="h-4 w-4 text-[#1d2433]" aria-hidden="true" />
            </span>
            <span className="text-base">Kupas</span>
          </button>

          <button
            type="button"
            aria-label="Riwayat belajar"
            onClick={() => setActiveTab("catatan")}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#d8d0c0] bg-white text-[#5d6578] transition hover:border-[#1d2433] hover:text-[#1d2433]"
          >
            <History className="h-4 w-4" aria-hidden="true" />
          </button>

          <span className="hidden text-xs font-semibold text-[#1d2433] sm:inline">
            Beranda
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#1d2433] bg-white px-3 py-1 text-xs font-bold text-[#1d2433]">
            <Sparkles className="h-3.5 w-3.5 text-[#1e4fd8]" aria-hidden="true" />
            <span>5 hari</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#1d2433] bg-white px-3 py-1 text-xs font-bold text-[#1d2433]">
            <Sparkles className="h-3.5 w-3.5 text-[#1e4fd8]" aria-hidden="true" />
            <span>240 XP</span>
          </span>
          <span className="grid h-8 w-8 place-items-center rounded-full border-[1.5px] border-[#1d2433] bg-[#1e4fd8] text-xs font-extrabold text-white">
            K
          </span>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1320px]">
        {/* Left Sidebar */}
        <aside
          aria-label="Navigasi utama"
          className="hidden w-[84px] shrink-0 flex-col items-center gap-1.5 border-r-[1.5px] border-[#e6dece] bg-[#fffdf8]/80 py-5 md:flex"
        >
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`flex w-16 flex-col items-center justify-center gap-1 rounded-xl py-2.5 text-[11px] font-bold transition ${
                  active
                    ? "border-[1.5px] border-[#1d2433] bg-[#1a2234] text-white shadow-[2px_2px_0_#1d2433]"
                    : "text-[#5d6578] hover:bg-[#dfe8ff]/60 hover:text-[#1d2433]"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Center Main Content */}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12">
          {activeTab === "beranda" && (
            <div className="mx-auto max-w-[780px] space-y-6">
              <h1 className="text-center text-2xl font-extrabold tracking-tight text-[#1d2433] sm:text-[34px]">
                Mau belajar apa hari ini?
              </h1>

              <form
                onSubmit={handleStartFromPrompt}
                className="flex min-h-[168px] flex-col justify-between rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-4 shadow-[5px_5px_0_#1d2433] sm:p-5"
              >
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (prompt.trim()) {
                        router.push(`/lessons/new?source=upload&q=${encodeURIComponent(prompt.trim())}`);
                      }
                    }
                  }}
                  placeholder="Buat pelajaran dari materi kalkulus"
                  className="w-full resize-none bg-transparent text-sm text-[#1d2433] placeholder:text-[#7c8494] focus:outline-none sm:text-[15px]"
                />

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSourceQuickAction("record")}
                      className="inline-flex items-center gap-1.5 rounded-xl border-[1.5px] border-[#1d2433] bg-white px-3 py-1.5 text-xs font-bold text-[#1d2433] transition hover:bg-[#dfe8ff]"
                    >
                      <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Rekam</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSourceQuickAction("upload")}
                      className="inline-flex items-center gap-1.5 rounded-xl border-[1.5px] border-[#1d2433] bg-white px-3 py-1.5 text-xs font-bold text-[#1d2433] transition hover:bg-[#dfe8ff]"
                    >
                      <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Unggah</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSourceQuickAction("link")}
                      className="inline-flex items-center gap-1.5 rounded-xl border-[1.5px] border-[#1d2433] bg-white px-3 py-1.5 text-xs font-bold text-[#1d2433] transition hover:bg-[#dfe8ff]"
                    >
                      <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>YouTube</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!prompt.trim()}
                    aria-label="Buat pelajaran"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] text-white shadow-[2px_2px_0_#1d2433] transition hover:-translate-x-[1px] hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </form>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] px-5 py-4 shadow-[5px_5px_0_#1d2433]">
                <div className="flex min-w-0 items-center gap-3.5">
                  <span className="h-7 w-7 shrink-0 rounded-full border-[3px] border-[#1e4fd8] border-t-[#dfe8ff]" />
                  <span className="truncate text-sm font-extrabold text-[#1d2433] sm:text-base">
                    {latestNote.title}
                  </span>
                </div>

                <Link
                  href={`/lessons/${latestNote.id}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-4 py-2 text-xs font-bold text-white shadow-[2px_2px_0_#1d2433] transition hover:-translate-x-[1px] hover:-translate-y-[1px]"
                >
                  <span>Lanjut belajar</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <section aria-labelledby="catatan-heading" className="space-y-3.5 pt-1">
                <h2 id="catatan-heading" className="text-base font-extrabold text-[#1d2433]">
                  Catatan
                </h2>

                <div className="grid gap-4 sm:grid-cols-3">
                  {notes.slice(0, 3).map((item, idx) => {
                    const total = Math.max(item.chapterCount || 0, item.chapters.length, 1);
                    const pct = Math.min(100, Math.round((item.chaptersDone / total) * 100));
                    const statusLabel =
                      item.chaptersDone === 0
                        ? "belum dimulai"
                        : idx === 0
                          ? "dibuka 3 hari lalu"
                          : idx === 1
                            ? "dibuka kemarin"
                            : `${item.chaptersDone}/${total} bab selesai`;

                    return (
                      <Link
                        key={item.id}
                        href={`/lessons/${item.id}`}
                        className="flex flex-col justify-between rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-4 shadow-[4px_4px_0_#1d2433] transition hover:-translate-x-[1px] hover:-translate-y-[1px]"
                      >
                        <div>
                          <h3 className="text-sm font-extrabold leading-snug text-[#1d2433]">
                            {item.title}
                          </h3>
                          <p className="mt-1.5 text-[11px] text-[#6e7687]">
                            {total} bab · {statusLabel}
                          </p>
                        </div>

                        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-[#e9e2d5]">
                          <div
                            className="h-full rounded-full bg-[#1e4fd8]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {activeTab === "catatan" && (
            <div className="mx-auto max-w-[820px] space-y-4">
              <h1 className="text-2xl font-extrabold text-[#1d2433]">Semua Catatan</h1>
              <div className="grid gap-4 sm:grid-cols-2">
                {notes.map((item) => {
                  const total = Math.max(item.chapterCount || 0, item.chapters.length, 1);
                  const pct = Math.min(100, Math.round((item.chaptersDone / total) * 100));
                  return (
                    <Link
                      key={item.id}
                      href={`/lessons/${item.id}`}
                      className="rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-4 shadow-[4px_4px_0_#1d2433] transition hover:-translate-x-[1px] hover:-translate-y-[1px]"
                    >
                      <h2 className="text-sm font-extrabold text-[#1d2433]">{item.title}</h2>
                      <p className="mt-1 text-xs text-[#6e7687]">{item.snippet}</p>
                      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#e9e2d5]">
                        <div className="h-full rounded-full bg-[#1e4fd8]" style={{ width: `${pct}%` }} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "kartu" && activeCard && (
            <div className="mx-auto max-w-[680px] space-y-4 rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-6 shadow-[5px_5px_0_#1d2433]">
              <h1 className="text-xl font-extrabold text-[#1d2433]">Kartu Hafalan</h1>
              <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                className="flex min-h-[180px] w-full flex-col items-center justify-center rounded-2xl border-[1.5px] border-[#1d2433] bg-[#faf6ee] p-6 text-center"
              >
                <span className="text-[11px] font-bold uppercase text-[#1e4fd8]">
                  {flipped ? "Jawaban" : "Pertanyaan"}
                </span>
                <p className="mt-3 text-base font-bold text-[#1d2433]">
                  {flipped ? activeCard.back : activeCard.front}
                </p>
              </button>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setFlipped(false);
                    setCardIdx((i) => i + 1);
                  }}
                  className="rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-4 py-2 text-xs font-bold text-white shadow-[3px_3px_0_#1d2433]"
                >
                  Kartu Berikutnya →
                </button>
              </div>
            </div>
          )}

          {activeTab === "kuis" && activeQuiz && (
            <div className="mx-auto max-w-[680px] space-y-4 rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-6 shadow-[5px_5px_0_#1d2433]">
              <h1 className="text-xl font-extrabold text-[#1d2433]">{activeQuiz.question}</h1>
              <div className="space-y-2">
                {activeQuiz.options.map((opt, idx) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setChosenOpt(idx)}
                    className={`w-full rounded-xl border-[1.5px] px-4 py-2.5 text-left text-xs font-bold ${
                      chosenOpt === idx
                        ? idx === activeQuiz.correctIndex
                          ? "border-emerald-700 bg-emerald-50 text-emerald-950"
                          : "border-rose-700 bg-rose-50 text-rose-950"
                        : "border-[#1d2433] bg-white text-[#1d2433] hover:bg-[#dfe8ff]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {chosenOpt !== null && (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-[#faf6ee] p-3 text-xs">
                  <span className="text-[#5d6578]">{activeQuiz.explanation}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setChosenOpt(null);
                      setQuizIdx((i) => i + 1);
                    }}
                    className="shrink-0 rounded-lg border border-[#1d2433] bg-[#1e4fd8] px-3 py-1.5 font-bold text-white"
                  >
                    Lanjut
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "tanya" && (
            <div className="mx-auto max-w-[680px] space-y-4 rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-6 shadow-[5px_5px_0_#1d2433]">
              <h1 className="text-xl font-extrabold text-[#1d2433]">Tanya Kupas</h1>
              <div className="space-y-2.5 text-xs">
                {chatLog.map((m, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3 ${
                      m.role === "user"
                        ? "ml-8 border-[#1d2433] bg-[#dfe8ff]"
                        : "mr-8 border-[#e6dece] bg-[#faf6ee]"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
              </div>
              <form onSubmit={handleAskSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={askInput}
                  onChange={(e) => setAskInput(e.target.value)}
                  placeholder="Tanya materi pelajaran..."
                  className="min-w-0 flex-1 rounded-xl border-[1.5px] border-[#1d2433] bg-white px-3.5 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-4 py-2 text-xs font-bold text-white"
                >
                  Kirim
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

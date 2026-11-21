"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Layers,
  MessageSquare,
  Network,
  Send,
} from "lucide-react";
import {
  DEFAULT_NOTES,
  readStoredNotes,
  upsertStudyNote,
  type StudyNote,
} from "@/lib/kupas-store";

type WorkspaceTab = "belajar" | "catatan" | "mindmap" | "kuis" | "flashcard";

type ChatMsg = {
  role: "user" | "assistant";
  text: string;
};

export default function LessonDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "n1";

  const [note, setNote] = useState<StudyNote>(() => DEFAULT_NOTES[0]);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("belajar");
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(0);

  const [cardIdx, setCardIdx] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);

  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [chosenOption, setChosenOption] = useState<number | null>(null);

  const [question, setQuestion] = useState<string>("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      text: "Ada bagian dari materi ini yang ingin kamu diskusikan atau tanyakan contohnya?",
    },
  ]);

  useEffect(() => {
    const all = readStoredNotes();
    const found = all.find((item) => item.id === id) ?? all[0] ?? DEFAULT_NOTES[0];
    setNote(found);
    setSelectedChapterIdx(0);
    setCardIdx(0);
    setFlipped(false);
    setQuizIdx(0);
    setChosenOption(null);
  }, [id]);

  const currentChapter = note.chapters[selectedChapterIdx] ?? note.chapters[0];
  const currentCard = note.flashcards[cardIdx] ?? note.flashcards[0];
  const currentQuiz = note.quiz[quizIdx] ?? note.quiz[0];

  const progressPct = useMemo(() => {
    if (!note.chapterCount) return 0;
    return Math.min(100, Math.round((note.chaptersDone / note.chapterCount) * 100));
  }, [note.chapterCount, note.chaptersDone]);

  function handleMarkChapterDone() {
    const nextDone = Math.min(note.chapterCount, Math.max(note.chaptersDone, selectedChapterIdx + 1));
    const updated: StudyNote = {
      ...note,
      chaptersDone: nextDone,
    };
    setNote(updated);
    upsertStudyNote(updated);
    if (selectedChapterIdx < note.chapters.length - 1) {
      setSelectedChapterIdx((idx) => idx + 1);
    }
  }

  function handleAskSubmit(e: FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;

    const reply = `Berdasarkan materi "${note.title}" (${currentChapter?.title || "Ringkasan"}): ${
      currentChapter?.summary || note.snippet
    } Untuk pertanyaan "${q}", fokuskan pada poin utama bab ini lalu uji dengan flashcard atau kuis.`;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: q },
      { role: "assistant", text: reply },
    ]);
    setQuestion("");
  }

  const tabs: { key: WorkspaceTab; label: string; icon: typeof BookOpen }[] = [
    { key: "belajar", label: "Belajar", icon: BookOpen },
    { key: "catatan", label: "Catatan", icon: FileText },
    { key: "mindmap", label: "Mindmap", icon: Network },
    { key: "kuis", label: "Kuis", icon: CheckCircle2 },
    { key: "flashcard", label: "Flashcard", icon: Layers },
  ];

  return (
    <main className="mx-auto max-w-[1140px] space-y-5 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e4fd8] hover:underline"
        >
          <span>← Kembali ke Beranda</span>
        </Link>

        <div className="flex items-center gap-3 text-xs font-bold text-[#1d2433]">
          <span>
            Progres: {note.chaptersDone}/{note.chapterCount} bab ({progressPct}%)
          </span>
          <div className="h-2 w-24 overflow-hidden rounded-full border border-[#1d2433] bg-[#e6dece]">
            <div className="h-full bg-[#1e4fd8]" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-5 shadow-[5px_5px_0_#1d2433]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border-[1.5px] border-[#1d2433] bg-[#dfe8ff] px-3 py-0.5 text-[11px] font-bold uppercase text-[#1d2433]">
            {note.kind}
          </span>
          <span className="text-xs text-[#5d6578]">{note.chapterCount} bab tersedia</span>
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#1d2433] sm:text-3xl">
          {note.title}
        </h1>
        <p className="mt-1.5 text-sm text-[#5d6578]">{note.snippet}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr_320px]">
        <aside
          aria-label="Mode belajar"
          className="flex gap-2 overflow-x-auto rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-3 shadow-[5px_5px_0_#1d2433] lg:flex-col lg:self-start"
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold transition ${
                  active
                    ? "border-[1.5px] border-[#1d2433] bg-[#1e4fd8] text-white shadow-[2px_2px_0_#1d2433]"
                    : "text-[#1d2433] hover:bg-[#dfe8ff]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </aside>

        <section
          aria-label="Isi materi"
          className="min-w-0 rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-5 shadow-[5px_5px_0_#1d2433] sm:p-6"
        >
          {activeTab === "belajar" && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {note.chapters.map((ch, idx) => (
                  <button
                    key={ch.title}
                    type="button"
                    onClick={() => setSelectedChapterIdx(idx)}
                    className={`rounded-full border-[1.5px] border-[#1d2433] px-3 py-1 text-xs font-bold ${
                      selectedChapterIdx === idx
                        ? "bg-[#1d2433] text-[#faf6ee]"
                        : "bg-white text-[#1d2433] hover:bg-[#dfe8ff]"
                    }`}
                  >
                    Bab {idx + 1}
                  </button>
                ))}
              </div>

              {currentChapter && (
                <div className="space-y-4">
                  <h2 className="text-xl font-extrabold text-[#1d2433]">{currentChapter.title}</h2>
                  <p className="text-sm leading-relaxed text-[#1d2433]">{currentChapter.summary}</p>
                  <ul className="space-y-2 rounded-xl border border-[#e6dece] bg-[#faf6ee] p-4 text-sm text-[#1d2433]">
                    {currentChapter.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1e4fd8]" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={handleMarkChapterDone}
                    className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-4 py-2 text-xs font-bold text-white shadow-[3px_3px_0_#1d2433]"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    <span>Tandai Bab Selesai &amp; Lanjut</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "catatan" && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-[#1d2433]">Ringkasan Catatan Lengkap</h2>
              {note.chapters.map((ch) => (
                <div
                  key={ch.title}
                  className="space-y-2 rounded-xl border border-[#e6dece] bg-[#faf6ee] p-4"
                >
                  <h3 className="text-sm font-bold text-[#1d2433]">{ch.title}</h3>
                  <p className="text-xs leading-relaxed text-[#5d6578]">{ch.summary}</p>
                  <ul className="list-disc space-y-1 pl-5 text-xs text-[#1d2433]">
                    {ch.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === "mindmap" && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-[#1d2433]">Peta Konsep (Mindmap)</h2>
              <div className="rounded-xl border-[1.5px] border-[#1d2433] bg-[#dfe8ff] p-4">
                <p className="text-xs font-bold uppercase text-[#1e4fd8]">Topik Pusat</p>
                <p className="mt-1 text-base font-extrabold text-[#1d2433]">
                  {note.mindmapRoot.label}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {note.mindmapRoot.branches.map((br) => (
                  <div
                    key={br.title}
                    className="rounded-xl border-[1.5px] border-[#1d2433] bg-[#faf6ee] p-4"
                  >
                    <h3 className="text-sm font-bold text-[#1d2433]">{br.title}</h3>
                    <p className="mt-1 text-xs text-[#5d6578]">{br.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "kuis" && currentQuiz && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#5d6578]">
                <span>Kuis Latihan</span>
                <span>
                  Soal {quizIdx + 1} dari {note.quiz.length}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-[#1d2433]">{currentQuiz.question}</h2>
              <div className="space-y-2.5">
                {currentQuiz.options.map((opt, idx) => {
                  const picked = chosenOption === idx;
                  const isCorrect = idx === currentQuiz.correctIndex;
                  let styleClass =
                    "border-[#1d2433] bg-white text-[#1d2433] hover:bg-[#dfe8ff]";
                  if (chosenOption !== null) {
                    if (isCorrect) {
                      styleClass = "border-emerald-700 bg-emerald-50 text-emerald-950";
                    } else if (picked) {
                      styleClass = "border-rose-700 bg-rose-50 text-rose-950";
                    }
                  }
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setChosenOption(idx)}
                      className={`w-full rounded-xl border-[1.5px] px-4 py-3 text-left text-sm font-semibold transition ${styleClass}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {chosenOption !== null && (
                <div className="rounded-xl border border-[#e6dece] bg-[#faf6ee] p-4 text-xs text-[#1d2433]">
                  <p className="font-bold">
                    {chosenOption === currentQuiz.correctIndex ? "Jawaban tepat!" : "Coba perhatikan lagi:"}
                  </p>
                  <p className="mt-1 text-[#5d6578]">{currentQuiz.explanation}</p>
                  {note.quiz.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setChosenOption(null);
                        setQuizIdx((i) => (i + 1) % note.quiz.length);
                      }}
                      className="mt-3 rounded-lg border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-3.5 py-1.5 text-xs font-bold text-white"
                    >
                      Soal Berikutnya
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "flashcard" && currentCard && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#5d6578]">
                <span>Kartu Hafalan Berjarak</span>
                <span>
                  Kartu {cardIdx + 1} dari {note.flashcards.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                className="flex min-h-[190px] w-full flex-col items-center justify-center rounded-2xl border-[1.5px] border-[#1d2433] bg-[#faf6ee] p-6 text-center shadow-[4px_4px_0_#1d2433] transition hover:bg-[#dfe8ff]/50"
              >
                <span className="rounded-full border border-[#1d2433] bg-white px-3 py-0.5 text-[11px] font-bold uppercase text-[#1e4fd8]">
                  {flipped ? "Jawaban (Klik untuk lihat soal)" : "Pertanyaan (Klik untuk balik)"}
                </span>
                <p className="mt-4 max-w-md text-base font-bold text-[#1d2433]">
                  {flipped ? currentCard.back : currentCard.front}
                </p>
              </button>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setFlipped((f) => !f)}
                  className="rounded-xl border-[1.5px] border-[#1d2433] bg-white px-4 py-2 text-xs font-bold text-[#1d2433]"
                >
                  {flipped ? "Tampilkan Soal" : "Tampilkan Jawaban"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFlipped(false);
                    setCardIdx((i) => (i + 1) % note.flashcards.length);
                  }}
                  className="rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-4 py-2 text-xs font-bold text-white shadow-[3px_3px_0_#1d2433]"
                >
                  Kartu Berikutnya →
                </button>
              </div>
            </div>
          )}
        </section>

        <aside
          aria-label="Tanya materi"
          className="flex flex-col rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-4 shadow-[5px_5px_0_#1d2433] lg:self-start"
        >
          <div className="flex items-center gap-2 border-b border-[#e6dece] pb-3">
            <MessageSquare className="h-4 w-4 text-[#1e4fd8]" aria-hidden="true" />
            <h2 className="text-sm font-extrabold text-[#1d2433]">Tanya Materi</h2>
          </div>

          <div className="mt-3 max-h-[280px] space-y-2.5 overflow-y-auto pr-1 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-3 leading-relaxed ${
                  m.role === "user"
                    ? "ml-4 border-[#1d2433] bg-[#dfe8ff] font-medium text-[#1d2433]"
                    : "mr-2 border-[#e6dece] bg-[#faf6ee] text-[#1d2433]"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleAskSubmit} className="mt-3 flex gap-2 border-t border-[#e6dece] pt-3">
            <label htmlFor="ask-input" className="sr-only">
              Tanyakan tentang materi ini
            </label>
            <input
              id="ask-input"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Tanya soal atau konsep..."
              className="min-w-0 flex-1 rounded-xl border-[1.5px] border-[#1d2433] bg-white px-3 py-2 text-xs text-[#1d2433] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!question.trim()}
              aria-label="Kirim pertanyaan"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] text-white disabled:opacity-45"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  FileText,
  FolderOpen,
  HelpCircle,
  History,
  Layers,
  MessageSquare,
  Plus,
  RotateCcw,
  Send,
  Share2,
  Sparkles,
} from "lucide-react";
import {
  DEFAULT_NOTES,
  readStoredNotes,
  upsertStudyNote,
  type StudyNote,
} from "@/lib/kupas-store";

type WorkspaceTab = "belajar" | "catatan" | "peta" | "kuis" | "kartu" | "sumber" | "tanya";

type ChatMsg = {
  role: "user" | "assistant";
  text: string;
};

type StepCard =
  | {
      kind: "intro";
      chapterNum: number;
      title: string;
      summary: string;
      totalPoints: number;
    }
  | {
      kind: "explain";
      heading: string;
      body: string;
      bullets?: string[];
    }
  | {
      kind: "check";
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    };

export default function LessonDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "n1";

  const [note, setNote] = useState<StudyNote>(() => DEFAULT_NOTES[0]);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("belajar");
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(0);
  const [inChapterRunner, setInChapterRunner] = useState<boolean>(false);

  // Step-by-step learning inside a chapter
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [stepSelectedOpt, setStepSelectedOpt] = useState<number | null>(null);
  const [stepChecked, setStepChecked] = useState<boolean>(false);
  const [chapterFinished, setChapterFinished] = useState<boolean>(false);
  const [sessionXp, setSessionXp] = useState<number>(240);

  // Flashcard state
  const [cardIdx, setCardIdx] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);

  // Quiz tab state
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [chosenOption, setChosenOption] = useState<number | null>(null);

  // Ask / Tanya materi state
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
    setSelectedChapterIdx(Math.min(found.chaptersDone, Math.max(0, found.chapters.length - 1)));
    setInChapterRunner(false);
    setStepIdx(0);
    setStepSelectedOpt(null);
    setStepChecked(false);
    setChapterFinished(false);
    setCardIdx(0);
    setFlipped(false);
    setQuizIdx(0);
    setChosenOption(null);
  }, [id]);

  useEffect(() => {
    setStepIdx(0);
    setStepSelectedOpt(null);
    setStepChecked(false);
    setChapterFinished(false);
  }, [selectedChapterIdx]);

  const totalChapters = Math.max(note.chapterCount || 0, note.chapters.length);
  const currentChapter = note.chapters[selectedChapterIdx] ?? note.chapters[0];
  const nextChapter =
    note.chapters[Math.min(note.chaptersDone, note.chapters.length - 1)] ?? currentChapter;
  const currentCard = note.flashcards[cardIdx] ?? note.flashcards[0];
  const currentQuiz = note.quiz[quizIdx] ?? note.quiz[0];

  const chapterSteps: StepCard[] = useMemo(() => {
    if (!currentChapter) return [];
    const steps: StepCard[] = [
      {
        kind: "intro",
        chapterNum: selectedChapterIdx + 1,
        title: currentChapter.title,
        summary: currentChapter.summary,
        totalPoints: currentChapter.points.length,
      },
      {
        kind: "explain",
        heading: `Inti Materi · ${currentChapter.title}`,
        body: currentChapter.summary,
        bullets: currentChapter.points.slice(0, 2),
      },
    ];

    if (currentChapter.points.length > 2) {
      steps.push({
        kind: "explain",
        heading: "Poin Pendalaman & Contoh",
        body: "Perhatikan poin lanjutan berikut sebelum masuk ke cek pemahaman:",
        bullets: currentChapter.points.slice(2),
      });
    }

    const relatedQuiz =
      note.quiz[selectedChapterIdx % Math.max(1, note.quiz.length)] ?? note.quiz[0];
    if (relatedQuiz) {
      steps.push({
        kind: "check",
        question: relatedQuiz.question,
        options: relatedQuiz.options,
        correctIndex: relatedQuiz.correctIndex,
        explanation: relatedQuiz.explanation,
      });
    }

    return steps;
  }, [currentChapter, note.quiz, selectedChapterIdx]);

  const activeStep = chapterSteps[stepIdx] ?? chapterSteps[0];

  const progressPct = useMemo(() => {
    if (!totalChapters) return 0;
    return Math.min(100, Math.round((note.chaptersDone / totalChapters) * 100));
  }, [totalChapters, note.chaptersDone]);

  function openChapter(idx: number) {
    setSelectedChapterIdx(idx);
    setInChapterRunner(true);
    setStepIdx(0);
    setStepSelectedOpt(null);
    setStepChecked(false);
    setChapterFinished(false);
  }

  function completeChapterProgress() {
    const nextDone = Math.min(
      totalChapters,
      Math.max(note.chaptersDone, selectedChapterIdx + 1),
    );
    const updated: StudyNote = {
      ...note,
      chaptersDone: nextDone,
    };
    setNote(updated);
    upsertStudyNote(updated);
    setSessionXp((xp) => xp + 15);
    setChapterFinished(true);
  }

  function handleNextStep() {
    if (stepIdx < chapterSteps.length - 1) {
      setStepIdx((i) => i + 1);
      setStepSelectedOpt(null);
      setStepChecked(false);
    } else {
      completeChapterProgress();
    }
  }

  function handleCheckAnswer() {
    if (stepSelectedOpt === null) return;
    setStepChecked(true);
    if (activeStep?.kind === "check" && stepSelectedOpt === activeStep.correctIndex) {
      setSessionXp((xp) => xp + 5);
    }
  }

  function handleGoNextChapter() {
    if (selectedChapterIdx < note.chapters.length - 1) {
      openChapter(selectedChapterIdx + 1);
    } else {
      setInChapterRunner(false);
      setChapterFinished(false);
    }
  }

  function handleAskSubmit(e: FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;

    const reply = `Berdasarkan "${note.title}" (${currentChapter?.title || "Ringkasan"}): ${
      currentChapter?.summary || note.snippet
    } Untuk pertanyaan "${q}", fokuskan pada poin inti bab lalu uji dengan kuis atau kartu hafalan.`;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: q },
      { role: "assistant", text: reply },
    ]);
    setQuestion("");
  }

  const navItems: { key: WorkspaceTab; label: string; icon: typeof BookOpen }[] = [
    { key: "belajar", label: "Belajar", icon: BookOpen },
    { key: "catatan", label: "Catatan", icon: FileText },
    { key: "peta", label: "Peta", icon: Share2 },
    { key: "kuis", label: "Kuis", icon: HelpCircle },
    { key: "kartu", label: "Kartu", icon: Layers },
    { key: "sumber", label: "Sumber", icon: FolderOpen },
    { key: "tanya", label: "Tanya", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#faf6ee] text-[#1d2433] pb-24 md:pb-12">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b-[1.5px] border-[#1d2433] bg-[#fffdf8] px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 font-extrabold tracking-tight text-[#1d2433]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg border-[1.5px] border-[#1d2433] bg-[#faf6ee]">
              <BookOpen className="h-4 w-4 text-[#1d2433]" aria-hidden="true" />
            </span>
            <span className="text-base">Kupas</span>
          </Link>

          <Link
            href="/dashboard"
            aria-label="Riwayat dan Beranda"
            className="hidden h-8 w-8 place-items-center rounded-lg border border-[#d8d0c0] bg-white text-[#5d6578] transition hover:border-[#1d2433] hover:text-[#1d2433] sm:grid"
          >
            <History className="h-4 w-4" aria-hidden="true" />
          </Link>

          <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-xs sm:flex">
            <Link href="/dashboard" className="text-[#5d6578] hover:text-[#1d2433]">
              Beranda
            </Link>
            <span className="text-[#8d95a5]">›</span>
            <span className="max-w-[240px] truncate font-semibold text-[#1d2433]">
              {note.title}
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#1d2433] bg-white px-3 py-1 text-xs font-bold text-[#1d2433]">
            <Sparkles className="h-3.5 w-3.5 text-[#1e4fd8]" aria-hidden="true" />
            <span>5 hari</span>
          </span>
          <span className="hidden items-center gap-1.5 rounded-full border-[1.5px] border-[#1d2433] bg-white px-3 py-1 text-xs font-bold text-[#1d2433] sm:inline-flex">
            <Sparkles className="h-3.5 w-3.5 text-[#1e4fd8]" aria-hidden="true" />
            <span>{sessionXp} XP</span>
          </span>
          <span className="grid h-8 w-8 place-items-center rounded-full border-[1.5px] border-[#1d2433] bg-[#1e4fd8] text-xs font-extrabold text-white">
            K
          </span>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1320px]">
        {/* Left Vertical Icon Rail (Desktop) */}
        <aside
          aria-label="Navigasi workspace"
          className="hidden w-[84px] shrink-0 flex-col items-center gap-1.5 border-r-[1.5px] border-[#e6dece] bg-[#fffdf8]/70 py-5 md:flex"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setActiveTab(item.key);
                  if (item.key === "belajar") setInChapterRunner(false);
                }}
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

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 px-4 py-7 sm:px-8 lg:px-10">
          {activeTab === "belajar" && !inChapterRunner && (
            <div className="mx-auto max-w-[820px] space-y-6">
              {/* Lesson Title + Progress Bar */}
              <div className="space-y-3">
                <h1 className="text-2xl font-extrabold tracking-tight text-[#1d2433] sm:text-[32px]">
                  {note.title}
                </h1>

                <div className="flex items-center gap-4">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full border border-[#d5cdc0] bg-[#e9e2d5]">
                    <div
                      className="h-full rounded-full bg-[#1e4fd8] transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-xs font-extrabold text-[#1d2433]">
                    {progressPct}%
                  </span>
                </div>

                {/* Primary CTA + Next Up Preview */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      openChapter(Math.min(note.chaptersDone, Math.max(0, note.chapters.length - 1)))
                    }
                    className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-5 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0_#1d2433] transition hover:-translate-x-[1px] hover:-translate-y-[1px]"
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    <span>{note.chaptersDone > 0 ? "Lanjutkan belajar" : "Mulai belajar"}</span>
                  </button>

                  {nextChapter && (
                    <div className="min-w-0">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#6e7687]">
                        SELANJUTNYA
                      </span>
                      <span className="block truncate text-xs font-bold text-[#1d2433]">
                        {nextChapter.title}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-[#e5ddd0]" />

              {/* Chapter Path Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#1d2433]">Daftar bab</h2>
                <span className="text-xs font-semibold text-[#5d6578]">
                  {note.chaptersDone} dari {totalChapters} selesai
                </span>
              </div>

              {/* Zig-Zag Chapter Trail */}
              <div className="relative space-y-6 py-2">
                {note.chapters.map((ch, idx) => {
                  const isDone = idx < note.chaptersDone;
                  const isCurrent = !isDone && idx === note.chaptersDone;
                  const alignRight = idx % 2 === 1;
                  const estMinutes = Math.max(4, ch.points.length * 2 + 2);
                  const cardCount = Math.max(2, ch.points.length + 1);

                  return (
                    <div
                      key={ch.title}
                      className={`relative flex items-center gap-4 ${
                        alignRight ? "sm:flex-row-reverse" : "sm:flex-row"
                      }`}
                    >
                      {/* Chapter Card */}
                      <button
                        type="button"
                        onClick={() => openChapter(idx)}
                        className={`w-full rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-4 text-left shadow-[4px_4px_0_#1d2433] transition hover:-translate-x-[1px] hover:-translate-y-[1px] hover:bg-white sm:w-[340px] ${
                          isCurrent ? "ring-2 ring-[#1e4fd8]/25" : ""
                        }`}
                      >
                        <h3 className="text-sm font-extrabold text-[#1d2433]">{ch.title}</h3>
                        <p className="mt-1 text-xs text-[#6e7687]">
                          {estMinutes} menit · {cardCount} kartu
                        </p>

                        <div className="mt-3">
                          {isDone ? (
                            <span className="inline-block rounded-md border border-emerald-700/30 bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">
                              SELESAI
                            </span>
                          ) : isCurrent ? (
                            <span className="inline-block rounded-md border border-[#1e4fd8]/30 bg-[#dfe8ff] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#1e4fd8]">
                              SEDANG DIPELAJARI
                            </span>
                          ) : (
                            <span className="inline-block rounded-md border border-[#d5cdc0] bg-[#faf6ee] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6e7687]">
                              BAB {idx + 1}
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Trail Node Marker */}
                      <div className="relative z-10 flex shrink-0 items-center justify-center sm:mx-auto">
                        {idx < note.chapters.length - 1 && (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute top-10 h-16 w-[2px] border-l-2 border-dashed border-[#c9c0b1]"
                          />
                        )}
                        <span
                          className={`grid h-9 w-9 place-items-center rounded-full text-xs font-extrabold ${
                            isDone
                              ? "bg-[#1e4fd8] text-white"
                              : isCurrent
                                ? "border-[2px] border-[#1e4fd8] bg-white text-[#1d2433]"
                                : "border-[1.5px] border-[#9aa2b2] bg-white text-[#5d6578]"
                          }`}
                        >
                          {isDone ? (
                            <Check className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            idx + 1
                          )}
                        </span>
                      </div>

                      <div className="hidden sm:block sm:w-[340px]" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "belajar" && inChapterRunner && (
            <div className="mx-auto max-w-[760px] space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5ddd0] pb-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setInChapterRunner(false);
                    setChapterFinished(false);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e4fd8] hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Kembali ke Daftar Bab</span>
                </button>

                <div className="flex flex-wrap items-center gap-1.5">
                  {note.chapters.map((ch, idx) => (
                    <button
                      key={ch.title}
                      type="button"
                      onClick={() => openChapter(idx)}
                      className={`rounded-full border-[1.5px] border-[#1d2433] px-3 py-1 text-xs font-bold ${
                        selectedChapterIdx === idx
                          ? "bg-[#1d2433] text-white"
                          : "bg-white text-[#1d2433] hover:bg-[#dfe8ff]"
                      }`}
                    >
                      Bab {idx + 1}
                    </button>
                  ))}
                </div>

                {!chapterFinished && chapterSteps.length > 0 && (
                  <span className="text-xs font-bold text-[#5d6578]">
                    Langkah {Math.min(stepIdx + 1, chapterSteps.length)} / {chapterSteps.length}
                  </span>
                )}
              </div>

              <div className="rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-6 shadow-[5px_5px_0_#1d2433]">
                {chapterFinished ? (
                  <div className="space-y-4 py-4 text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border-[1.5px] border-[#1d2433] bg-[#dfe8ff] text-[#1e4fd8]">
                      <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h2 className="text-xl font-extrabold text-[#1d2433]">Bab selesai!</h2>
                    <p className="text-sm text-[#5d6578]">
                      Kamu menyelesaikan{" "}
                      <strong className="text-[#1d2433]">{currentChapter?.title}</strong> dan
                      mendapatkan <strong className="text-[#1e4fd8]">+15 XP</strong>.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setChapterFinished(false);
                          setStepIdx(0);
                          setStepSelectedOpt(null);
                          setStepChecked(false);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border-[1.5px] border-[#1d2433] bg-white px-4 py-2 text-xs font-bold text-[#1d2433]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Ulang Bab</span>
                      </button>
                      {selectedChapterIdx < note.chapters.length - 1 ? (
                        <button
                          type="button"
                          onClick={handleGoNextChapter}
                          className="inline-flex items-center gap-1.5 rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-4 py-2 text-xs font-bold text-white shadow-[3px_3px_0_#1d2433]"
                        >
                          <span>Bab Berikutnya</span>
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setInChapterRunner(false)}
                          className="inline-flex items-center gap-1.5 rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-4 py-2 text-xs font-bold text-white shadow-[3px_3px_0_#1d2433]"
                        >
                          <span>Selesai &amp; Kembali</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : activeStep?.kind === "intro" ? (
                  <div className="space-y-4">
                    <span className="inline-block rounded-full border border-[#1d2433] bg-[#dfe8ff] px-3 py-0.5 text-xs font-bold text-[#1e4fd8]">
                      Bab {activeStep.chapterNum} dari {note.chapters.length}
                    </span>
                    <h2 className="text-2xl font-extrabold text-[#1d2433]">{activeStep.title}</h2>
                    <p className="text-sm leading-relaxed text-[#5d6578]">{activeStep.summary}</p>
                    <p className="text-xs font-bold text-[#1d2433]">
                      {activeStep.totalPoints} poin inti + 1 cek pemahaman
                    </p>
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-5 py-2.5 text-xs font-bold text-white shadow-[3px_3px_0_#1d2433]"
                      >
                        <span>Lanjut</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ) : activeStep?.kind === "explain" ? (
                  <div className="space-y-4">
                    <h2 className="text-xl font-extrabold text-[#1d2433]">{activeStep.heading}</h2>
                    <p className="text-sm leading-relaxed text-[#1d2433]">{activeStep.body}</p>
                    {activeStep.bullets && activeStep.bullets.length > 0 && (
                      <ul className="space-y-2 rounded-xl border border-[#e6dece] bg-[#faf6ee] p-4 text-sm text-[#1d2433]">
                        {activeStep.bullets.map((pt) => (
                          <li key={pt} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1e4fd8]" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-5 py-2.5 text-xs font-bold text-white shadow-[3px_3px_0_#1d2433]"
                      >
                        <span>Lanjut</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ) : activeStep?.kind === "check" ? (
                  <div className="space-y-4">
                    <span className="inline-block rounded-full border border-[#1d2433] bg-[#dfe8ff] px-3 py-0.5 text-[11px] font-bold uppercase text-[#1e4fd8]">
                      Cek Pemahaman
                    </span>
                    <h2 className="text-lg font-extrabold text-[#1d2433]">{activeStep.question}</h2>
                    <div className="space-y-2.5">
                      {activeStep.options.map((opt, idx) => {
                        const picked = stepSelectedOpt === idx;
                        const isCorrect = idx === activeStep.correctIndex;
                        let boxClass =
                          "border-[#1d2433] bg-white text-[#1d2433] hover:bg-[#dfe8ff]";
                        if (stepChecked) {
                          if (isCorrect) boxClass = "border-emerald-700 bg-emerald-50 text-emerald-950";
                          else if (picked) boxClass = "border-rose-700 bg-rose-50 text-rose-950";
                        } else if (picked) {
                          boxClass = "border-[#1d2433] bg-[#dfe8ff] text-[#1d2433]";
                        }
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              if (stepChecked && stepSelectedOpt === activeStep.correctIndex) return;
                              setStepSelectedOpt(idx);
                              setStepChecked(false);
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left text-sm font-semibold transition ${boxClass}`}
                          >
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#1d2433] bg-[#faf6ee] text-xs font-bold text-[#1d2433]">
                              {idx + 1}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {stepChecked && (
                      <div className="rounded-xl border border-[#e6dece] bg-[#faf6ee] p-4 text-xs text-[#1d2433]">
                        <p className="font-bold">
                          {stepSelectedOpt === activeStep.correctIndex
                            ? "Jawaban tepat! (+5 XP)"
                            : "Belum tepat — coba pilih opsi lain lalu periksa."}
                        </p>
                        <p className="mt-1 text-[#5d6578]">{activeStep.explanation}</p>
                      </div>
                    )}

                    <div className="flex justify-end gap-2.5 pt-2">
                      {stepChecked && stepSelectedOpt === activeStep.correctIndex ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-5 py-2.5 text-xs font-bold text-white shadow-[3px_3px_0_#1d2433]"
                        >
                          <span>Lanjut</span>
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={stepSelectedOpt === null}
                          onClick={handleCheckAnswer}
                          className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-5 py-2.5 text-xs font-bold text-white shadow-[3px_3px_0_#1d2433] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
                        >
                          <span>Periksa</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {activeTab === "catatan" && (
            <div className="mx-auto max-w-[820px] space-y-4 rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-6 shadow-[5px_5px_0_#1d2433]">
              <h1 className="text-2xl font-extrabold text-[#1d2433]">Catatan · {note.title}</h1>
              {note.chapters.map((ch) => (
                <div key={ch.title} className="space-y-2 rounded-xl border border-[#e6dece] bg-[#faf6ee] p-4">
                  <h2 className="text-sm font-extrabold text-[#1d2433]">{ch.title}</h2>
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

          {activeTab === "peta" && (
            <div className="mx-auto max-w-[820px] space-y-4 rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-6 shadow-[5px_5px_0_#1d2433]">
              <h1 className="text-2xl font-extrabold text-[#1d2433]">Peta Konsep</h1>
              <div className="rounded-xl border-[1.5px] border-[#1d2433] bg-[#dfe8ff] p-4">
                <span className="text-[11px] font-extrabold uppercase text-[#1e4fd8]">Topik Utama</span>
                <p className="mt-1 text-base font-extrabold text-[#1d2433]">{note.mindmapRoot.label}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {note.mindmapRoot.branches.map((br) => (
                  <div
                    key={br.title}
                    className="rounded-xl border-[1.5px] border-[#1d2433] bg-[#faf6ee] p-4"
                  >
                    <h2 className="text-sm font-extrabold text-[#1d2433]">{br.title}</h2>
                    <p className="mt-1 text-xs text-[#5d6578]">{br.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "kuis" && currentQuiz && (
            <div className="mx-auto max-w-[820px] space-y-4 rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-6 shadow-[5px_5px_0_#1d2433]">
              <div className="flex items-center justify-between text-xs font-bold text-[#5d6578]">
                <span>Kuis</span>
                <span>
                  Soal {quizIdx + 1} / {note.quiz.length}
                </span>
              </div>
              <h1 className="text-lg font-extrabold text-[#1d2433]">{currentQuiz.question}</h1>
              <div className="space-y-2.5">
                {currentQuiz.options.map((opt, idx) => {
                  const picked = chosenOption === idx;
                  const isCorrect = idx === currentQuiz.correctIndex;
                  let styleClass = "border-[#1d2433] bg-white text-[#1d2433] hover:bg-[#dfe8ff]";
                  if (chosenOption !== null) {
                    if (isCorrect) styleClass = "border-emerald-700 bg-emerald-50 text-emerald-950";
                    else if (picked) styleClass = "border-rose-700 bg-rose-50 text-rose-950";
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
                <div className="rounded-xl border border-[#e6dece] bg-[#faf6ee] p-4 text-xs">
                  <p className="font-bold text-[#1d2433]">
                    {chosenOption === currentQuiz.correctIndex ? "Jawaban tepat!" : "Perhatikan penjelasan berikut:"}
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

          {activeTab === "kartu" && currentCard && (
            <div className="mx-auto max-w-[820px] space-y-4 rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-6 shadow-[5px_5px_0_#1d2433]">
              <div className="flex items-center justify-between text-xs font-bold text-[#5d6578]">
                <span>Kartu Hafalan</span>
                <span>
                  Kartu {cardIdx + 1} / {note.flashcards.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                className="flex min-h-[190px] w-full flex-col items-center justify-center rounded-2xl border-[1.5px] border-[#1d2433] bg-[#faf6ee] p-6 text-center shadow-[4px_4px_0_#1d2433]"
              >
                <span className="rounded-full border border-[#1d2433] bg-white px-3 py-0.5 text-[11px] font-bold uppercase text-[#1e4fd8]">
                  {flipped ? "Jawaban" : "Pertanyaan"}
                </span>
                <p className="mt-4 max-w-md text-base font-bold text-[#1d2433]">
                  {flipped ? currentCard.back : currentCard.front}
                </p>
              </button>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setFlipped((f) => !f)}
                  className="rounded-xl border-[1.5px] border-[#1d2433] bg-white px-4 py-2 text-xs font-bold text-[#1d2433]"
                >
                  {flipped ? "Balik ke Soal" : "Lihat Jawaban"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFlipped(false);
                    setCardIdx((i) => (i + 1) % note.flashcards.length);
                  }}
                  className="rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-4 py-2 text-xs font-bold text-white shadow-[3px_3px_0_#1d2433]"
                >
                  Berikutnya →
                </button>
              </div>
            </div>
          )}

          {activeTab === "sumber" && (
            <div className="mx-auto max-w-[820px] space-y-4 rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-6 shadow-[5px_5px_0_#1d2433]">
              <h1 className="text-2xl font-extrabold text-[#1d2433]">Sumber Materi</h1>
              <div className="rounded-xl border border-[#e6dece] bg-[#faf6ee] p-4 text-xs">
                <span className="font-extrabold uppercase text-[#1e4fd8]">{note.kind}</span>
                <p className="mt-2 break-all font-medium text-[#1d2433]">{note.sourceInput}</p>
              </div>
            </div>
          )}

          {activeTab === "tanya" && (
            <div className="mx-auto max-w-[820px] space-y-4 rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-6 shadow-[5px_5px_0_#1d2433]">
              <h1 className="text-2xl font-extrabold text-[#1d2433]">Tanya Materi</h1>
              <div className="max-h-[320px] space-y-2.5 overflow-y-auto text-xs">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3.5 leading-relaxed ${
                      m.role === "user"
                        ? "ml-8 border-[#1d2433] bg-[#dfe8ff] font-medium text-[#1d2433]"
                        : "mr-8 border-[#e6dece] bg-[#faf6ee] text-[#1d2433]"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
              </div>
              <form onSubmit={handleAskSubmit} className="flex gap-2 border-t border-[#e6dece] pt-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Tanya soal atau konsep dari materi ini..."
                  className="min-w-0 flex-1 rounded-xl border-[1.5px] border-[#1d2433] bg-white px-3.5 py-2 text-xs text-[#1d2433] focus:outline-none"
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
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button (+) */}
      <Link
        href="/lessons/new"
        aria-label="Buat materi baru"
        className="fixed bottom-20 right-5 z-30 grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-[#1d2433] bg-[#1e4fd8] text-white shadow-[4px_4px_0_#1d2433] transition hover:-translate-x-[1px] hover:-translate-y-[1px] md:bottom-6 md:right-6"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </Link>

      {/* Mobile Bottom Nav */}
      <nav
        aria-label="Navigasi bawah"
        className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t-[1.5px] border-[#1d2433] bg-[#fffdf8] py-1.5 md:hidden"
      >
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setActiveTab(item.key);
                if (item.key === "belajar") setInChapterRunner(false);
              }}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                active ? "bg-[#1a2234] text-white" : "text-[#5d6578]"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

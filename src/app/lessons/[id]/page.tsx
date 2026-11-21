"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  FolderOpen,
  HelpCircle,
  History,
  Layers,
  MessageSquare,
  Plus,
  Send,
  Share2,
  Sparkles,
} from "lucide-react";
import ChapterRunner from "@/components/lessons/ChapterRunner";
import RadialMindmap from "@/components/lessons/RadialMindmap";
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

export default function LessonDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "n1";

  const [note, setNote] = useState<StudyNote>(() => DEFAULT_NOTES[0]);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("belajar");
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(0);
  const [inChapterRunner, setInChapterRunner] = useState<boolean>(false);
  const [sessionXp, setSessionXp] = useState<number>(240);

  // Flashcard state
  const [cardIdx, setCardIdx] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);

  // Quiz tab state
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [chosenOption, setChosenOption] = useState<number | null>(null);

  // Notes two-column editor & chat state
  const [noteHeadingStyle, setNoteHeadingStyle] = useState<"h1" | "h2">("h1");
  const [noteAlign, setNoteAlign] = useState<"left" | "center">("left");
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [isStrike, setIsStrike] = useState<boolean>(false);
  const [showFormulaBox, setShowFormulaBox] = useState<boolean>(true);
  const [customFormula, setCustomFormula] = useState<string>("∑F = m · a");
  const [exportStatus, setExportStatus] = useState<string>("");
  const [editableChapters, setEditableChapters] = useState(note.chapters);

  // Ask / Tanya materi state
  const [question, setQuestion] = useState<string>("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      text: "Halo, tanya apa saja — aku bisa bantu kamu memahami catatan ini dan menjawab pertanyaan apa pun.",
    },
  ]);

  useEffect(() => {
    const all = readStoredNotes();
    const found = all.find((item) => item.id === id) ?? all[0] ?? DEFAULT_NOTES[0];
    setNote(found);
    setEditableChapters(found.chapters);
    setSelectedChapterIdx(Math.min(found.chaptersDone, Math.max(0, found.chapters.length - 1)));
    setInChapterRunner(false);
    setCardIdx(0);
    setFlipped(false);
    setQuizIdx(0);
    setChosenOption(null);
  }, [id]);

  const totalChapters = Math.max(note.chapterCount || 0, note.chapters.length);
  const currentChapter = note.chapters[selectedChapterIdx] ?? note.chapters[0];
  const nextChapter =
    note.chapters[Math.min(note.chaptersDone, note.chapters.length - 1)] ?? currentChapter;
  const currentCard = note.flashcards[cardIdx] ?? note.flashcards[0];
  const currentQuiz = note.quiz[quizIdx] ?? note.quiz[0];

  const radialBranches = useMemo(() => {
    const baseBranches = note.mindmapRoot.branches || [];
    const chapterBranches = note.chapters.map((ch) => ({
      title: ch.title.replace(/^Bab\s*\d+\s*·\s*/i, ""),
      detail: ch.summary,
    }));

    const combined = [...baseBranches, ...chapterBranches];
    const unique: { title: string; detail: string }[] = [];
    const seen = new Set<string>();

    for (const b of combined) {
      const key = b.title.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      unique.push(b);
      if (unique.length >= 8) break;
    }

    return unique.length > 0 ? unique : [{ title: "Konsep Utama", detail: note.snippet }];
  }, [note.mindmapRoot.branches, note.chapters, note.snippet]);

  const progressPct = useMemo(() => {
    if (!totalChapters) return 0;
    return Math.min(100, Math.round((note.chaptersDone / totalChapters) * 100));
  }, [totalChapters, note.chaptersDone]);

  function openChapter(idx: number) {
    setSelectedChapterIdx(idx);
    setInChapterRunner(true);
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
  }

  function handleUpdateChapterSummary(idx: number, nextSummary: string) {
    const updatedChapters = editableChapters.map((ch, i) =>
      i === idx ? { ...ch, summary: nextSummary } : ch,
    );
    setEditableChapters(updatedChapters);
    const updatedNote: StudyNote = {
      ...note,
      chapters: updatedChapters,
    };
    setNote(updatedNote);
    upsertStudyNote(updatedNote);
  }

  function handleAddChapterSection() {
    const nextIdx = editableChapters.length + 1;
    const newSec = {
      title: `Bab ${nextIdx} · Catatan Tambahan`,
      summary: "Tulis ringkasan atau contoh penerapan baru di sini.",
      points: ["Poin penting baru dari materi ini."],
    };
    const updatedChapters = [...editableChapters, newSec];
    setEditableChapters(updatedChapters);
    const updatedNote: StudyNote = {
      ...note,
      chapters: updatedChapters,
      chapterCount: updatedChapters.length,
    };
    setNote(updatedNote);
    upsertStudyNote(updatedNote);
  }

  function handleExportMarkdown() {
    const lines = [
      `# Catatan: ${note.title}`,
      "",
      note.snippet,
      "",
      ...(showFormulaBox && customFormula.trim()
        ? [`> Rumus / Sorotan: ${customFormula.trim()}`, ""]
        : []),
      ...editableChapters.flatMap((ch) => [
        `## ${ch.title}`,
        "",
        ch.summary,
        "",
        ...ch.points.map((pt) => `- ${pt}`),
        "",
      ]),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.id}-catatan.md`;
    a.click();
    URL.revokeObjectURL(url);
    setExportStatus("Terekspor (.md)");
    setTimeout(() => setExportStatus(""), 2500);
  }

  function handleQuickNotePrompt(promptText: string) {
    const reply =
      promptText === "Ringkas catatan ini"
        ? `Ringkasan "${note.title}": ${editableChapters
            .map((c) => c.title)
            .join(", ")}. Fokus utamanya adalah memahami konsep dasar, aturan/rumus inti, lalu menguji lewat latihan.`
        : `Contoh soal singkat untuk "${note.title}": Perhatikan penerapan ${
            editableChapters[0]?.title || note.title
          } — identifikasi data yang diketahui, pilih aturan/rumus yang sesuai, lalu cek satuan dan logika hasilnya.`;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: promptText },
      { role: "assistant", text: reply },
    ]);
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

  if (activeTab === "belajar" && inChapterRunner && currentChapter) {
    const relatedQuiz =
      note.quiz[selectedChapterIdx % Math.max(1, note.quiz.length)] ?? note.quiz[0];

    return (
      <ChapterRunner
        key={`${selectedChapterIdx}-${currentChapter.title}`}
        chapter={currentChapter}
        chapterIndex={selectedChapterIdx}
        totalChapters={totalChapters}
        hasNextChapter={selectedChapterIdx < note.chapters.length - 1}
        relatedQuiz={relatedQuiz}
        onExit={() => setInChapterRunner(false)}
        onCompleteChapter={completeChapterProgress}
        onNextChapter={() =>
          setSelectedChapterIdx((idx) => Math.min(note.chapters.length - 1, idx + 1))
        }
        onAwardQuizXp={() => setSessionXp((xp) => xp + 5)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#faf6ee] pb-24 text-[#1d2433] md:pb-12">
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
            {activeTab === "catatan" && (
              <>
                <span className="text-[#8d95a5]">›</span>
                <span className="font-semibold text-[#1d2433]">Catatan</span>
              </>
            )}
            {activeTab === "peta" && (
              <>
                <span className="text-[#8d95a5]">›</span>
                <span className="font-semibold text-[#1d2433]">Peta</span>
              </>
            )}
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
        <main
          className={`min-w-0 flex-1 ${
            activeTab === "peta" ? "p-0" : "px-4 py-7 sm:px-8 lg:px-10"
          }`}
        >
          {activeTab === "belajar" && !inChapterRunner && (
            <div className="mx-auto max-w-[820px] space-y-6">
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

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#1d2433]">Daftar bab</h2>
                <span className="text-xs font-semibold text-[#5d6578]">
                  {note.chaptersDone} dari {totalChapters} selesai
                </span>
              </div>

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

          {activeTab === "catatan" && (
            <div className="mx-auto max-w-[1040px] overflow-hidden rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] shadow-[5px_5px_0_#1d2433]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-[#1d2433] bg-[#faf6ee] px-3.5 py-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNoteHeadingStyle((h) => (h === "h1" ? "h2" : "h1"))}
                    className="rounded-lg border border-[#1d2433] bg-white px-2.5 py-1 font-bold text-[#1d2433] hover:bg-[#dfe8ff]"
                  >
                    {noteHeadingStyle === "h1" ? "H1 Judul 1 ▾" : "H2 Judul 2 ▾"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteAlign((a) => (a === "left" ? "center" : "left"))}
                    className="rounded-lg border border-[#1d2433] bg-white px-2.5 py-1 font-semibold text-[#1d2433] hover:bg-[#dfe8ff]"
                  >
                    Format ▾
                  </button>

                  <span className="mx-1 h-4 w-[1px] bg-[#d5cdc0]" />

                  <button
                    type="button"
                    aria-pressed={isBold}
                    onClick={() => setIsBold((v) => !v)}
                    className={`grid h-7 w-7 place-items-center rounded-md border font-extrabold ${
                      isBold
                        ? "border-[#1d2433] bg-[#1d2433] text-white"
                        : "border-transparent text-[#1d2433] hover:bg-[#e9e2d5]"
                    }`}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    aria-pressed={isItalic}
                    onClick={() => setIsItalic((v) => !v)}
                    className={`grid h-7 w-7 place-items-center rounded-md border font-serif italic ${
                      isItalic
                        ? "border-[#1d2433] bg-[#1d2433] text-white"
                        : "border-transparent text-[#1d2433] hover:bg-[#e9e2d5]"
                    }`}
                  >
                    I
                  </button>
                  <button
                    type="button"
                    aria-pressed={isUnderline}
                    onClick={() => setIsUnderline((v) => !v)}
                    className={`grid h-7 w-7 place-items-center rounded-md border underline ${
                      isUnderline
                        ? "border-[#1d2433] bg-[#1d2433] text-white"
                        : "border-transparent text-[#1d2433] hover:bg-[#e9e2d5]"
                    }`}
                  >
                    U
                  </button>
                  <button
                    type="button"
                    aria-pressed={isStrike}
                    onClick={() => setIsStrike((v) => !v)}
                    className={`grid h-7 w-7 place-items-center rounded-md border line-through ${
                      isStrike
                        ? "border-[#1d2433] bg-[#1d2433] text-white"
                        : "border-transparent text-[#1d2433] hover:bg-[#e9e2d5]"
                    }`}
                  >
                    S
                  </button>

                  <span className="mx-1 h-4 w-[1px] bg-[#d5cdc0]" />

                  <button
                    type="button"
                    aria-pressed={showFormulaBox}
                    onClick={() => setShowFormulaBox((v) => !v)}
                    className={`rounded-md border px-2.5 py-1 font-mono text-xs font-bold ${
                      showFormulaBox
                        ? "border-[#1d2433] bg-[#dfe8ff] text-[#1e4fd8]"
                        : "border-transparent text-[#1d2433] hover:bg-[#e9e2d5]"
                    }`}
                  >
                    fx
                  </button>
                  <button
                    type="button"
                    onClick={handleAddChapterSection}
                    className="inline-flex items-center gap-1 rounded-md border border-[#1d2433] bg-white px-2.5 py-1 font-bold text-[#1d2433] hover:bg-[#dfe8ff]"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Bagian</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleExportMarkdown}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#1d2433] bg-white px-3 py-1 font-bold text-[#1d2433] hover:bg-[#dfe8ff]"
                >
                  <span>{exportStatus || "↓ Ekspor"}</span>
                </button>
              </div>

              <div className="grid lg:grid-cols-[1fr_340px]">
                <div
                  className={`space-y-5 border-b-[1.5px] border-[#1d2433] p-6 sm:p-8 lg:border-b-0 lg:border-r-[1.5px] ${
                    noteAlign === "center" ? "text-center" : "text-left"
                  }`}
                >
                  <div className="space-y-2">
                    <h1
                      className={`font-extrabold tracking-tight text-[#1d2433] ${
                        noteHeadingStyle === "h1"
                          ? "text-2xl sm:text-[28px]"
                          : "text-xl sm:text-2xl"
                      }`}
                    >
                      Catatan: {note.title}
                    </h1>
                    <p className="text-sm leading-relaxed text-[#5d6578]">{note.snippet}</p>
                  </div>

                  {editableChapters.map((ch, idx) => (
                    <div key={`${ch.title}-${idx}`} className="space-y-2.5 pt-1">
                      <h2 className="text-base font-extrabold text-[#1d2433]">{ch.title}</h2>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleUpdateChapterSummary(idx, e.currentTarget.textContent || ch.summary)
                        }
                        className={`rounded-lg px-1.5 py-1 text-sm leading-relaxed text-[#1d2433] focus:bg-[#faf6ee] focus:outline-none focus:ring-1 focus:ring-[#1e4fd8] ${
                          isBold ? "font-bold" : ""
                        } ${isItalic ? "italic" : ""} ${isUnderline ? "underline" : ""} ${
                          isStrike ? "line-through" : ""
                        }`}
                      >
                        {ch.summary}
                      </p>

                      {idx === 0 && showFormulaBox && (
                        <div className="my-3 space-y-2.5">
                          <div className="rounded-xl border border-[#e5ddd0] bg-[#faf6ee] px-4 py-3 text-center font-mono text-sm font-bold text-[#1d2433]">
                            <input
                              type="text"
                              aria-label="Rumus atau sorotan utama"
                              value={customFormula}
                              onChange={(e) => setCustomFormula(e.target.value)}
                              className="w-full bg-transparent text-center font-mono text-sm font-bold text-[#1d2433] focus:outline-none"
                            />
                          </div>

                          <div className="rounded-xl border-l-[3px] border-[#1e4fd8] bg-[#faf6ee] px-4 py-3 text-left">
                            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1e4fd8]">
                              CONTOH SINGKAT
                            </span>
                            <p className="mt-1 text-xs leading-relaxed text-[#1d2433]">
                              {ch.points[0] ||
                                "Terapkan konsep inti pada satu kasus nyata lalu periksa langkah penyelesaiannya."}
                            </p>
                          </div>
                        </div>
                      )}

                      {ch.points.length > 0 && (
                        <ul
                          className={`space-y-1.5 text-xs leading-relaxed text-[#1d2433] ${
                            noteAlign === "center" ? "list-none" : "list-disc pl-5"
                          }`}
                        >
                          {ch.points.map((pt) => (
                            <li key={pt}>{pt}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex min-h-[420px] flex-col justify-between bg-[#fffdf8]">
                  <div className="flex items-center justify-between border-b border-[#e5ddd0] px-4 py-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        setMessages([
                          {
                            role: "assistant",
                            text: "Halo, tanya apa saja — aku bisa bantu kamu memahami catatan ini dan menjawab pertanyaan apa pun.",
                          },
                        ])
                      }
                      className="font-bold text-[#1d2433] hover:text-[#1e4fd8]"
                    >
                      Percakapan baru ▾
                    </button>
                    <button
                      type="button"
                      aria-label="Mulai percakapan baru"
                      onClick={() =>
                        setMessages([
                          {
                            role: "assistant",
                            text: "Halo, tanya apa saja — aku bisa bantu kamu memahami catatan ini dan menjawab pertanyaan apa pun.",
                          },
                        ])
                      }
                      className="grid h-6 w-6 place-items-center rounded-md text-[#1d2433] hover:bg-[#faf6ee]"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  {messages.length <= 1 ? (
                    <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
                      <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#e5ddd0] bg-[#faf6ee] text-[#1e4fd8]">
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <h3 className="mt-3 text-sm font-extrabold text-[#1d2433]">
                        Halo, tanya apa saja
                      </h3>
                      <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-[#6e7687]">
                        Aku bisa bantu kamu memahami catatan ini dan menjawab pertanyaan apa pun.
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickNotePrompt("Ringkas catatan ini")}
                          className="rounded-full border border-[#d5cdc0] bg-white px-3 py-1 text-[11px] font-bold text-[#1d2433] hover:border-[#1d2433] hover:bg-[#dfe8ff]"
                        >
                          Ringkas catatan ini
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickNotePrompt("Beri contoh soal")}
                          className="rounded-full border border-[#d5cdc0] bg-white px-3 py-1 text-[11px] font-bold text-[#1d2433] hover:border-[#1d2433] hover:bg-[#dfe8ff]"
                        >
                          Beri contoh soal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-2.5 overflow-y-auto p-4 text-xs">
                      {messages.map((m, idx) => (
                        <div
                          key={idx}
                          className={`rounded-xl border p-3 leading-relaxed ${
                            m.role === "user"
                              ? "ml-6 border-[#1d2433] bg-[#dfe8ff] font-medium text-[#1d2433]"
                              : "mr-4 border-[#e5ddd0] bg-[#faf6ee] text-[#1d2433]"
                          }`}
                        >
                          {m.text}
                        </div>
                      ))}
                    </div>
                  )}

                  <form
                    onSubmit={handleAskSubmit}
                    className="flex items-center gap-2 border-t border-[#e5ddd0] p-3"
                  >
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Tanya apa saja tentang materi ini"
                      className="min-w-0 flex-1 rounded-xl border border-[#d5cdc0] bg-white px-3 py-2 text-xs text-[#1d2433] focus:border-[#1d2433] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!question.trim()}
                      aria-label="Kirim pertanyaan catatan"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#1d2433] bg-[#1e4fd8] text-white disabled:opacity-45"
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === "peta" && (
            <RadialMindmap rootLabel={note.title} branches={radialBranches} />
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
                  let styleClass =
                    "border-[#1d2433] bg-white text-[#1d2433] hover:bg-[#dfe8ff]";
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
                    {chosenOption === currentQuiz.correctIndex
                      ? "Jawaban tepat!"
                      : "Perhatikan penjelasan berikut:"}
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

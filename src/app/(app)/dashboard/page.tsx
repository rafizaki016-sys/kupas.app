"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Flame,
  Folder,
  Headphones,
  Layers,
  Link2,
  Menu,
  Mic,
  Presentation,
  Sparkles,
  Upload,
  Video,
  X,
} from "lucide-react";
import { getLocalSet, saveLocalSet, StudySet } from "@/lib/data";
import { getAiHeaders } from "@/lib/byok";

type SourceFilter = "all" | "doc" | "slide" | "audio" | "youtube";

function readAllLocalSets(): StudySet[] {
  if (typeof window === "undefined") return [];
  const found: StudySet[] = [];
  const seenIds = new Set<string>();

  const tryPush = (val: unknown) => {
    if (!val) return;
    if (Array.isArray(val)) {
      val.forEach((item) => tryPush(item));
      return;
    }
    if (typeof val === "object") {
      const rec = val as Record<string, unknown>;
      if (typeof rec.id === "string" && typeof rec.title === "string") {
        if (!seenIds.has(rec.id)) {
          seenIds.add(rec.id);
          found.push(val as StudySet);
        }
      } else if (Array.isArray(rec.sets)) {
        rec.sets.forEach((item) => tryPush(item));
      } else if (Array.isArray(rec.items)) {
        rec.items.forEach((item) => tryPush(item));
      }
    }
  };

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    const lower = key.toLowerCase();
    if (
      lower.includes("kupas") ||
      lower.includes("study") ||
      lower.includes("set") ||
      lower.includes("lesson")
    ) {
      const raw = window.localStorage.getItem(key);
      if (!raw || (!raw.trim().startsWith("{") && !raw.trim().startsWith("["))) continue;
      try {
        tryPush(JSON.parse(raw));
      } catch {
        // abaikan nilai non-JSON
      }
    }
  }

  return found;
}

function detectSourceKind(sourceType?: string): SourceFilter {
  const s = (sourceType || "").toLowerCase();
  if (s.includes("yt") || s.includes("youtube") || s.includes("link") || s.includes("url")) {
    return "youtube";
  }
  if (s.includes("audio") || s.includes("voice") || s.includes("rekam") || s.includes("mp3")) {
    return "audio";
  }
  if (s.includes("slide") || s.includes("ppt") || s.includes("video")) {
    return "slide";
  }
  return "doc";
}

function sourceBadgeLabel(sourceType?: string): string {
  const kind = detectSourceKind(sourceType);
  if (kind === "youtube") return "YouTube";
  if (kind === "audio") return "Audio";
  if (kind === "slide") return "Slide";
  const raw = (sourceType || "").trim();
  if (raw.toLowerCase().includes("pdf")) return "PDF";
  return raw ? raw.toUpperCase() : "Teks";
}

function formatShortDate(raw?: string): string {
  if (!raw) return "Baru saja";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "Baru saja";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function countChapters(markdown?: string): number {
  if (!markdown) return 3;
  const headings = markdown
    .replace(/\\n/g, "\n")
    .split("\n")
    .filter((line) => line.trim().startsWith("## ") || line.trim().startsWith("# "));
  return Math.max(1, headings.length || 3);
}

function extractExcerpt(markdown?: string): string {
  if (!markdown) {
    return "Ringkasan konsep utama, poin penting, dan catatan siap dibaca ulang kapan saja.";
  }
  const clean = markdown
    .replace(/\\n/g, " ")
    .replace(/^#{1,4}\s+/gm, "")
    .replace(/[*_`>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) {
    return "Ringkasan konsep utama, poin penting, dan catatan siap dibaca ulang kapan saja.";
  }
  return clean.length > 135 ? `${clean.slice(0, 132).trim()}...` : clean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [sets, setSets] = useState<StudySet[]>([]);
  const [promptInput, setPromptInput] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [activeFilter, setActiveFilter] = useState<SourceFilter>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    const loaded = readAllLocalSets();
    if (loaded.length > 0) {
      setSets(loaded);
    } else {
      const single = getLocalSet("latest") || getLocalSet("current");
      setSets(single ? [single] : []);
    }
  }, []);

  const totalFlashcards = useMemo(
    () => sets.reduce((sum, item) => sum + (item.flashcards?.length ?? 0), 0),
    [sets]
  );

  const reviewCount = useMemo(
    () => Math.min(12, Math.max(totalFlashcards, sets.length * 4)),
    [totalFlashcards, sets.length]
  );

  const latestSet = sets[0] ?? null;

  const folders = useMemo(() => {
    const map = new Map<string, string>();
    sets.forEach((s) => {
      const rec = s as unknown as Record<string, unknown>;
      const f = typeof rec.folder === "string" && rec.folder.trim() ? rec.folder.trim() : "";
      if (f) map.set(f.toLowerCase(), f);
    });
    return Array.from(map.entries());
  }, [sets]);

  const filteredSets = useMemo(() => {
    return sets.filter((s) => {
      const kind = detectSourceKind(s.source_type);
      const matchType = activeFilter === "all" || kind === activeFilter;
      const rec = s as unknown as Record<string, unknown>;
      const f = typeof rec.folder === "string" ? rec.folder.trim().toLowerCase() : "";
      const matchFolder = selectedFolder === "all" || f === selectedFolder;
      return matchType && matchFolder;
    });
  }, [sets, activeFilter, selectedFolder]);

  const xpTotal = useMemo(() => {
    const quizTotal = sets.reduce((sum, item) => sum + (item.quiz?.length ?? 0), 0);
    return Math.max(240, sets.length * 45 + totalFlashcards * 6 + quizTotal * 10);
  }, [sets, totalFlashcards]);

  const streakDays = useMemo(
    () => Math.max(5, sets.length > 0 ? Math.min(30, sets.length + 4) : 5),
    [sets.length]
  );

  async function handleQuickGenerate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = promptInput.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/study-sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAiHeaders(),
        },
        body: JSON.stringify({
          title: trimmed.length > 72 ? `${trimmed.slice(0, 69).trim()}...` : trimmed,
          content: trimmed,
          source_type: trimmed.startsWith("http") ? "youtube" : "text",
        }),
      });

      if (res.ok) {
        const created = (await res.json()) as StudySet & { id?: string };
        if (created && created.id) {
          saveLocalSet(created);
          setSets(readAllLocalSets());
          setPromptInput("");
          router.push(`/set/${created.id}/summary`);
          return;
        }
      }

      const fallbackId = `set-${Date.now()}`;
      const fallbackSet: StudySet = {
        id: fallbackId,
        title: trimmed.length > 72 ? `${trimmed.slice(0, 69).trim()}...` : trimmed,
        source_type: (trimmed.startsWith("http") ? "youtube" : "text") as StudySet["source_type"],
                created_at: new Date().toISOString(),
        summary_markdown: `## Ringkasan Materi\n- Topik utama: ${trimmed}\n- Catatan ini siap dikembangkan menjadi flashcard dan kuis.`,
        flashcards: [
          {
            id: "fc-1",
            
        flashcards: [
          {
            id: "fc-1",
            front: `Apa inti utama dari "${trimmed.slice(0, 48)}"?`,
            back: "Poin konsep kunci yang dirangkum langsung dari materi yang kamu masukkan.",
          },
        ],     
        ],
        quiz: [
          {
            question: `Fokus utama pembahasan "${trimmed.slice(0, 48)}" adalah?`,
            options: [
              "Memahami konsep inti dan penerapannya",
              "Menghafal tanpa memahami alur",
              "Mengabaikan contoh kasus",
              "Melewatkan ringkasan bab",
            ],
            correct_index: 0,
            explanation: "Memahami konsep inti membantu menjawab variasi soal dengan lebih tepat.",
          },
        ],
        mindmap: {
          label: trimmed.slice(0, 48),
          children: [{ label: "Konsep Utama" }, { label: "Contoh & Latihan" }],
        },
      };
      saveLocalSet(fallbackSet);
      setSets(readAllLocalSets());
      setPromptInput("");
      router.push(`/set/${fallbackId}/summary`);
    } catch {
      setStatusMsg("Gagal memproses materi. Periksa koneksi atau API Key di Pengaturan.");
    } finally {
      setSubmitting(false);
    }
  }

  const filterChips: { key: SourceFilter; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "doc", label: "Dokumen" },
    { key: "slide", label: "Slide" },
    { key: "audio", label: "Audio" },
    { key: "youtube", label: "YouTube" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#14181F] antialiased">
      <header className="sticky top-0 z-30 border-b border-[#E5DEC9] bg-[#FAF7F2]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1040px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
          <button
              type="button"
              onClick={() => setDrawerOpen((v) => !v)}
              aria-label="Buka menu navigasi"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCD4C0] bg-white text-[#14181F] transition hover:bg-[#F3EFE4]"
          >
              {drawerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            
            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-bold text-[#14181F]">
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[#14181F] bg-white text-[#14181F]">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>Beranda</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#DCD4C0] bg-white px-3 py-1 text-xs font-semibold text-[#14181F]">
              <Flame className="h-3.5 w-3.5 text-[#D97706]" aria-hidden="true" />
              <span>{streakDays} hari</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#DCD4C0] bg-white px-3 py-1 text-xs font-semibold text-[#14181F]">
              <Sparkles className="h-3.5 w-3.5 text-[#1D4ED8]" aria-hidden="true" />
              <span>{xpTotal} XP</span>
            </div>

            <Link
              href="/settings"
              aria-label="Pengaturan dan API Key"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white transition hover:bg-[#1D4ED8]"
            >
              K
            </Link>
          </div>
        </div>

        {drawerOpen && (
          <div className="border-t border-[#E5DEC9] bg-white px-4 py-3 sm:px-6">
            <nav aria-label="Navigasi Kupas" className="mx-auto flex max-w-[1040px] flex-wrap items-center gap-2 text-xs font-semibold">
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg px-3 py-2 text-[#4B5563] hover:bg-[#F5F1E6] hover:text-[#14181F]"
              >
                Halaman Utama
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg bg-[#EEF4FF] px-3 py-2 text-[#1D4ED8]"
              >
                Beranda
              </Link>
              <Link
                href="/snap"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg px-3 py-2 text-[#4B5563] hover:bg-[#F5F1E6] hover:text-[#14181F]"
              >
                Foto &amp; Bahas Soal
              </Link>
              <Link
                href="/settings"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg px-3 py-2 text-[#4B5563] hover:bg-[#F5F1E6] hover:text-[#14181F]"
              >
                Pengaturan (API Key)
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1040px] space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <section aria-labelledby="prompt-heading" className="space-y-4">
          <h1
            id="prompt-heading"
            className="text-3xl font-extrabold tracking-tight text-[#14181F] sm:text-4xl"
          >
            Apa yang ingin kamu pelajari?
          </h1>

          <form
            onSubmit={handleQuickGenerate}
            className="rounded-2xl border-2 border-[#14181F] bg-white p-4 shadow-[4px_4px_0px_#14181F] sm:p-5"
          >
            <label htmlFor="study-prompt" className="sr-only">
              Tempel materi atau ketik topik
            </label>
            <textarea
              id="study-prompt"
              rows={2}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Tempel materi atau ketik topik, misalnya hukum Newton"
              className="w-full resize-none border-0 bg-transparent text-sm text-[#14181F] placeholder-[#8A92A0] focus:outline-none sm:text-base"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/snap"
                                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#DCD4C0] bg-[#FAF7F2] px-3 text-xs font-semibold text-[#374151] transition hover:border-[#14181F]"
                >
                  <Mic className="h-3.5 w-3.5 text-[#4B5563]" aria-hidden="true" />
                  <span>Rekam</span>
                </Link>

                <Link
                  href="/new"
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#DCD4C0] bg-[#FAF7F2] px-3 text-xs font-semibold text-[#374151] transition hover:border-[#14181F]"
                >
                  <Upload className="h-3.5 w-3.5 text-[#4B5563]" aria-hidden="true" />
                  <span>Unggah</span>
                </Link>

                <Link
                  href="/new?mode=link"
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#DCD4C0] bg-[#FAF7F2] px-3 text-xs font-semibold text-[#374151] transition hover:border-[#14181F]"
                >
                  <Link2 className="h-3.5 w-3.5 text-[#4B5563]" aria-hidden="true" />
                  <span>Tautan</span>
                </Link>
              </div>

              <button
                type="submit"
                disabled={!promptInput.trim() || submitting}
                aria-label="Proses materi"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </form>

          {statusMsg && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-medium text-red-700">
              {statusMsg}
            </p>
          )}
        </section>

        <section aria-label="Pintasan belajar" className="grid gap-4 md:grid-cols-2">
          <Link
            href={latestSet ? `/set/${latestSet.id}/flashcards` : "/new"}
            className="flex items-center justify-between gap-4 rounded-xl border border-[#DCD4C0] bg-white p-4 transition hover:border-[#14181F]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E5DEC9] bg-[#FAF7F2] text-[#4B5563]">
                <Layers className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#14181F]">
                  {reviewCount} kartu perlu diulang
                </p>
                <p className="text-xs text-[#6B7280]">Sekitar 6 menit</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB]">
              <span>Mulai</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </Link>

          <Link
            href={latestSet ? `/set/${latestSet.id}/summary` : "/new"}
            className="flex items-center justify-between gap-4 rounded-xl border border-[#DCD4C0] bg-white p-4 transition hover:border-[#14181F]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E5DEC9] bg-[#FAF7F2] text-[#4B5563]">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#14181F]">
                  {latestSet ? `Lanjutkan: ${latestSet.title}` : "Mulai buat catatan pertama"}
                </p>
                <p className="text-xs text-[#6B7280]">
                  {latestSet ? `Bab 2 dari ${countChapters(latestSet.summary_markdown)}` : "Unggah PDF, slide, atau teks"}
                </p>
              </div>
              
            </div>

            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#2563EB]">
              <span>Buka</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </Link>
        </section>

        <section aria-labelledby="catatan-heading" className="space-y-4 pt-1">
          <h2 id="catatan-heading" className="text-lg font-bold text-[#14181F]">
            Catatan
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#DCD4C0] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151]">
              <Folder className="h-3.5 w-3.5 text-[#6B7280]" aria-hidden="true" />
              <select
                aria-label="Filter folder"
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#374151] focus:outline-none"
              >
                <option value="all">Semua folder</option>
                {folders.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {filterChips.map((chip) => {
              const active = activeFilter === chip.key;
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setActiveFilter(chip.key)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-[#14181F] text-white"
                      : "border border-[#DCD4C0] bg-white text-[#4B5563] hover:border-[#14181F] hover:text-[#14181F]"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {filteredSets.length === 0 ? (
            <div className="rounded-xl border border-[#DCD4C0] bg-white p-8 text-center">
              <p className="text-sm font-semibold text-[#14181F]">
                Belum ada catatan yang cocok dengan filter ini.
              </p>
              <p className="mt-1 text-xs text-[#6B7280]">
                Ketik topik di kotak atas atau buat materi baru untuk mulai belajar.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("all");
                    setSelectedFolder("all");
                  }}
                  className="rounded-lg border border-[#DCD4C0] bg-[#FAF7F2] px-3.5 py-2 text-xs font-semibold text-[#14181F]"
                >
                  Reset Filter
                </button>
                <Link
                  href="/new"
                  className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                >
                  + Buat Materi
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {filteredSets.map((item) => {
                const kind = detectSourceKind(item.source_type);
                const badgeText = sourceBadgeLabel(item.source_type);
                const chapters = countChapters(item.summary_markdown);
                const excerpt = extractExcerpt(item.summary_markdown);

                return (
                  <Link
                    key={item.id}
                    href={`/set/${item.id}/summary`}
                    className="group flex flex-col justify-between rounded-xl border border-[#DCD4C0] border-b-[4px] border-b-[#2563EB] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#14181F] hover:border-b-[#1D4ED8]"
                  >
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-[#E5DEC9] bg-[#FAF7F2] px-2.5 py-1 text-[11px] font-semibold text-[#4B5563]">
                        {kind === "youtube" ? (
                          <Video className="h-3 w-3 text-[#2563EB]" aria-hidden="true" />
                        ) : kind === "audio" ? (
                          <Headphones className="h-3 w-3 text-[#2563EB]" aria-hidden="true" />
                        ) : kind === "slide" ? (
                          <Presentation className="h-3 w-3 text-[#2563EB]" aria-hidden="true" />
                        ) : (
                          <FileText className="h-3 w-3 text-[#2563EB]" aria-hidden="true" />
                        )}
                        <span>{badgeText}</span>
                      </span>

                      <h3 className="mt-3.5 line-clamp-1 text-base font-bold text-[#14181F] group-hover:text-[#1D4ED8]">
                        {item.title}
                      </h3>

                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#6B7280]">
                        {excerpt}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-[#F1ECE1] pt-3.5">
                      <p className="line-clamp-1 text-xs font-bold text-[#14181F]">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#8A92A0]">
                        Dibuat {formatShortDate(item.created_at)} · {chapters} bab
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
                  
  

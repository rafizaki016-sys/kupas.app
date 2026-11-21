"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  FileText,
  Folder,
  History,
  LayoutGrid,
  List,
  Mic,
  MoreHorizontal,
  PlayCircle,
  Presentation,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  DEFAULT_NOTES,
  readStoredNotes,
  type NoteKind,
  type StudyNote,
} from "@/lib/kupas-store";

type NoteFilter = "all" | "dokumen" | "slide" | "audio" | "youtube";
type ViewMode = "galeri" | "daftar";

function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

function getKindBadgeLabel(kind: NoteKind): string {
  switch (kind) {
    case "pdf":
      return "Dokumen";
    case "slide":
      return "Slide";
    case "audio":
      return "Audio";
    case "youtube":
      return "YouTube";
    default:
      return "Teks";
  }
}

function matchesFilter(kind: NoteKind, filter: NoteFilter): boolean {
  if (filter === "all") return true;
  if (filter === "dokumen") return kind === "pdf" || kind === "text";
  if (filter === "slide") return kind === "slide";
  if (filter === "audio") return kind === "audio";
  return kind === "youtube";
}

export default function DashboardPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<StudyNote[]>(DEFAULT_NOTES);
  const [prompt, setPrompt] = useState<string>("");

  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [noteFilter, setNoteFilter] = useState<NoteFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("galeri");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    setNotes(readStoredNotes());
  }, []);

  const latestNote = notes[0] ?? DEFAULT_NOTES[0];

  const folderOptions = useMemo(() => {
    const groups = new Set<string>();
    notes.forEach((n) => {
      if (n.kind === "pdf" || n.kind === "text") groups.add("Sains & Materi Teks");
      else if (n.kind === "slide") groups.add("Presentasi Kuliah");
      else if (n.kind === "audio") groups.add("Rekaman Kelas");
      else groups.add("Tautan & Video");
    });
    return Array.from(groups);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const kindOk = matchesFilter(n.kind, noteFilter);
      if (!kindOk) return false;
      if (selectedFolder === "all") return true;
      if (selectedFolder === "Sains & Materi Teks") return n.kind === "pdf" || n.kind === "text";
      if (selectedFolder === "Presentasi Kuliah") return n.kind === "slide";
      if (selectedFolder === "Rekaman Kelas") return n.kind === "audio";
      return n.kind === "youtube";
    });
  }, [notes, noteFilter, selectedFolder]);

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

  const filterButtons: { key: NoteFilter; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "dokumen", label: "Dokumen" },
    { key: "slide", label: "Slide" },
    { key: "audio", label: "Audio" },
    { key: "youtube", label: "YouTube" },
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
            aria-label="Riwayat belajar"
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#d8d0c0] bg-white text-[#5d6578] transition hover:border-[#1d2433] hover:text-[#1d2433]"
          >
            <History className="h-4 w-4" aria-hidden="true" />
          </Link>

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

      {/* Main Content */}
      <main className="mx-auto max-w-[820px] space-y-6 px-4 py-8 sm:px-6">
        {/* Hero Heading */}
        <h1 className="text-center text-2xl font-extrabold tracking-tight text-[#1d2433] sm:text-[34px]">
          Mau belajar apa hari ini?
        </h1>

        {/* Composer Box */}
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

        {/* Continue Banner Card */}
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

        {/* Catatan Section */}
        <section aria-labelledby="catatan-heading" className="space-y-4 pt-2">
          <h2 id="catatan-heading" className="text-base font-extrabold text-[#1d2433]">
            Catatan
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative inline-flex items-center">
                <Folder
                  className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-[#5d6578]"
                  aria-hidden="true"
                />
                <select
                  aria-label="Pilih folder catatan"
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="appearance-none rounded-full border-[1.5px] border-[#1d2433] bg-white py-1.5 pl-8 pr-7 text-xs font-bold text-[#1d2433] focus:outline-none"
                >
                  <option value="all">Semua folder ▾</option>
                  {folderOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {filterButtons.map((btn) => {
                const active = noteFilter === btn.key;
                return (
                  <button
                    key={btn.key}
                    type="button"
                    onClick={() => setNoteFilter(btn.key)}
                    className={`rounded-full border-[1.5px] border-[#1d2433] px-3.5 py-1.5 text-xs font-bold transition ${
                      active
                        ? "bg-[#1e4fd8] text-white"
                        : "bg-white text-[#1d2433] hover:bg-[#dfe8ff]"
                    }`}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setViewMode("galeri")}
              className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#1d2433] px-3.5 py-1.5 text-xs font-bold transition ${
                viewMode === "galeri"
                  ? "bg-[#1e4fd8] text-white"
                  : "bg-white text-[#1d2433] hover:bg-[#dfe8ff]"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Galeri</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("daftar")}
              className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#1d2433] px-3.5 py-1 text-xs font-bold transition ${
                viewMode === "daftar"
                  ? "bg-[#1a2234] text-white"
                  : "bg-white text-[#1d2433] hover:bg-[#dfe8ff]"
              }`}
            >
              <List className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Daftar</span>
            </button>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-6 text-center text-xs font-semibold text-[#5d6578] shadow-[4px_4px_0_#1d2433]">
              Belum ada catatan yang cocok dengan filter ini.
            </div>
          ) : viewMode === "galeri" ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {filteredNotes.map((item) => {
                const badgeText = getKindBadgeLabel(item.kind);
                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col justify-between rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-4 shadow-[4px_4px_0_#1d2433] transition hover:-translate-x-[1px] hover:-translate-y-[1px]"
                  >
                    <Link href={`/lessons/${item.id}`} className="block space-y-3">
                      <div className="rounded-xl border border-[#e5ddd0] bg-[#faf6ee] p-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#1d2433] bg-white px-2 py-0.5 text-[10px] font-bold text-[#1d2433]">
                          {item.kind === "slide" ? (
                            <Presentation className="h-3 w-3 text-[#1e4fd8]" aria-hidden="true" />
                          ) : item.kind === "youtube" ? (
                            <PlayCircle className="h-3 w-3 text-[#1e4fd8]" aria-hidden="true" />
                          ) : (
                            <FileText className="h-3 w-3 text-[#1e4fd8]" aria-hidden="true" />
                          )}
                          <span>{badgeText}</span>
                        </span>

                        <div className="mt-2.5 space-y-1.5 rounded-lg border border-[#ece5d8] bg-white p-2.5 text-left">
                          <p className="line-clamp-3 text-[11px] font-extrabold leading-snug text-[#1d2433]">
                            Catatan: {item.title}
                          </p>
                          <div className="h-1.5 w-4/5 rounded bg-[#ece6da]" />
                          <div className="h-1.5 w-3/5 rounded bg-[#ece6da]" />
                          <p className="line-clamp-1 pt-1 text-[10px] font-bold text-[#5d6578]">
                            {item.chapters[0]?.title || item.snippet}
                          </p>
                        </div>
                      </div>

                      <div className="pr-6">
                        <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-[#1d2433]">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-[11px] text-[#6e7687]">
                          Dibuat {formatShortDate(item.createdAt)}
                        </p>
                      </div>
                    </Link>

                    <div className="absolute bottom-4 right-3.5">
                      <button
                        type="button"
                        aria-label={`Opsi untuk ${item.title}`}
                        onClick={() =>
                          setOpenMenuId((prev) => (prev === item.id ? null : item.id))
                        }
                        className="grid h-7 w-7 place-items-center rounded-lg text-[#5d6578] hover:bg-[#faf6ee] hover:text-[#1d2433]"
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      </button>

                      {openMenuId === item.id && (
                        <div className="absolute bottom-8 right-0 z-20 w-36 rounded-xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-1.5 text-xs shadow-[3px_3px_0_#1d2433]">
                          <Link
                            href={`/lessons/${item.id}`}
                            onClick={() => setOpenMenuId(null)}
                            className="block rounded-lg px-2.5 py-1.5 font-bold text-[#1d2433] hover:bg-[#dfe8ff]"
                          >
                            Buka Pelajaran
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredNotes.map((item) => (
                <Link
                  key={item.id}
                  href={`/lessons/${item.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] px-4 py-3.5 shadow-[3px_3px_0_#1d2433] transition hover:-translate-x-[1px] hover:-translate-y-[1px]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-[#1d2433] bg-[#dfe8ff] px-2 py-0.5 text-[10px] font-bold text-[#1d2433]">
                        {getKindBadgeLabel(item.kind)}
                      </span>
                      <h3 className="truncate text-sm font-extrabold text-[#1d2433]">
                        {item.title}
                      </h3>
                    </div>
                    <p className="mt-1 truncate text-xs text-[#6e7687]">{item.snippet}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold text-[#6e7687]">
                    Dibuat {formatShortDate(item.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

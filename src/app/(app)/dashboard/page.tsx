"use client";

import { useId, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileText,
  Headphones,
  Layers,
  Link2,
  Mic,
  Presentation,
  Upload,
  Video,
} from "lucide-react";

type NoteKind = "text" | "pdf" | "slide" | "audio" | "youtube";

type Note = {
  id: string;
  title: string;
  kind: NoteKind;
  snippet: string;
  createdAt: string;
  chapterCount: number;
  chaptersDone: number;
};

const INITIAL_NOTES: Note[] = [
  {
    id: "n1",
    title: "Hukum Newton dan penerapannya",
    kind: "text",
    snippet:
      "Hukum pertama menyatakan benda tetap diam atau bergerak lurus beraturan selama resultan gaya nol. Kita mulai dari contoh sehari-hari, lalu ke rumusnya.",
    createdAt: "2026-11-20T03:00:00Z",
    chapterCount: 4,
    chaptersDone: 2,
  },
  {
    id: "n2",
    title: "Sel dan organel",
    kind: "pdf",
    snippet:
      "Sel adalah satuan terkecil makhluk hidup. Organel seperti mitokondria dan kloroplas punya tugas masing-masing di dalam sel.",
    createdAt: "2026-11-19T03:00:00Z",
    chapterCount: 5,
    chaptersDone: 5,
  },
  {
    id: "n3",
    title: "Rekaman kelas sejarah",
    kind: "audio",
    snippet:
      "Latar belakang pergerakan nasional, tokoh-tokohnya, dan urutan peristiwa penting dari awal abad ke-20.",
    createdAt: "2026-11-17T03:00:00Z",
    chapterCount: 6,
    chaptersDone: 1,
  },
];

const KIND_LABEL: Record<NoteKind, string> = {
  text: "Teks",
  pdf: "PDF",
  slide: "Slide",
  audio: "Audio",
  youtube: "YouTube",
};

const FILTERS: { value: "all" | NoteKind; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pdf", label: "Dokumen" },
  { value: "slide", label: "Slide" },
  { value: "audio", label: "Audio" },
  { value: "youtube", label: "YouTube" },
  { value: "text", label: "Teks" },
];

function KindIcon({ kind }: { kind: NoteKind }) {
  switch (kind) {
    case "pdf":
      return <FileText className="h-3.5 w-3.5 text-[#1e4fd8]" aria-hidden="true" />;
    case "slide":
      return <Presentation className="h-3.5 w-3.5 text-[#1e4fd8]" aria-hidden="true" />;
    case "audio":
      return <Headphones className="h-3.5 w-3.5 text-[#1e4fd8]" aria-hidden="true" />;
    case "youtube":
      return <Video className="h-3.5 w-3.5 text-[#1e4fd8]" aria-hidden="true" />;
    default:
      return <FileText className="h-3.5 w-3.5 text-[#1e4fd8]" aria-hidden="true" />;
  }
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

export default function DashboardPage() {
  const router = useRouter();
  const promptId = useId();
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<"all" | NoteKind>("all");

  const dueCards = 12;
  const continueNote = INITIAL_NOTES[0];

  const shownNotes = useMemo(
    () => (filter === "all" ? INITIAL_NOTES : INITIAL_NOTES.filter((n) => n.kind === filter)),
    [filter]
  );

  function go(params: Record<string, string>) {
    const qs = new URLSearchParams(params).toString();
    router.push(qs ? `/lessons/new?${qs}` : "/lessons/new");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    go({ source: "text", q: value.slice(0, 2000) });
  }

  return (
    <div className="min-h-screen bg-[#faf6ee] text-[#1d2433]">
      <main className="mx-auto max-w-[1100px] px-4 pb-16 pt-2 sm:px-9">
        <h1 className="mb-4 mt-6 text-3xl font-extrabold leading-tight tracking-tight sm:mt-8 sm:text-[40px]">
          Apa yang ingin kamu pelajari?
        </h1>

        <form
          onSubmit={onSubmit}
          className="rounded-xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-4 shadow-[5px_5px_0_#1d2433] focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-[3px] focus-within:outline-[#1e4fd8]"
        >
          <label htmlFor={promptId} className="sr-only">
            Tempel materi atau ketik topik
          </label>
          <textarea
            id={promptId}
            rows={2}
            maxLength={2000}
            value={text}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
            placeholder="Tempel materi atau ketik topik, misalnya hukum Newton"
            className="block min-h-[56px] w-full resize-y border-0 bg-transparent p-0 text-[17px] text-[#1d2433] placeholder-[#5d6578] focus:outline-none"
          />
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => go({ source: "record" })}
              className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#1d2433] bg-white px-3.5 py-2 text-sm font-semibold text-[#1d2433] transition hover:bg-[#dfe8ff]"
            >
              <Mic className="h-4 w-4" aria-hidden="true" />
              <span>Rekam</span>
            </button>
            <button
              type="button"
              onClick={() => go({ source: "upload" })}
              className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#1d2433] bg-white px-3.5 py-2 text-sm font-semibold text-[#1d2433] transition hover:bg-[#dfe8ff]"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span>Unggah</span>
            </button>
            <button
              type="button"
              onClick={() => go({ source: "link" })}
              className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#1d2433] bg-white px-3.5 py-2 text-sm font-semibold text-[#1d2433] transition hover:bg-[#dfe8ff]"
            >
              <Link2 className="h-4 w-4" aria-hidden="true" />
              <span>Tautan</span>
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              aria-label="Buat catatan dari teks ini"
              className="ml-auto grid h-[46px] w-[46px] place-items-center rounded-[14px] border-[1.5px] border-[#1d2433] bg-[#1e4fd8] text-white shadow-[3px_3px_0_#1d2433] transition disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
            >
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </form>

        <section aria-label="Hari ini" className="mt-4 grid gap-3 md:grid-cols-2">
          <Link
            href="/cards"
            className="flex items-center gap-3.5 rounded-xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-4 shadow-[5px_5px_0_#1d2433] transition hover:-translate-x-[1px] hover:-translate-y-[1px] hover:bg-white hover:shadow-[6px_6px_0_#1d2433]"
          >
            <span className="grid h-[46px] w-[46px] flex-none place-items-center rounded-[13px] bg-[#dfe8ff] text-[#1e4fd8]">
              <Layers className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <b className="block text-sm font-bold text-[#1d2433]">
                {dueCards} kartu perlu diulang
              </b>
              <small className="text-sm text-[#5d6578]">
                Sekitar {Math.max(1, Math.round(dueCards / 2))} menit
              </small>
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-bold text-[#1e4fd8]">
              <span>Mulai</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>

          <Link
            href={`/lessons/${continueNote.id}`}
            className="flex items-center gap-3.5 rounded-xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-4 shadow-[5px_5px_0_#1d2433] transition hover:-translate-x-[1px] hover:-translate-y-[1px] hover:bg-white hover:shadow-[6px_6px_0_#1d2433]"
          >
            <span className="grid h-[46px] w-[46px] flex-none place-items-center rounded-[13px] bg-[#dfe8ff] text-[#1e4fd8]">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <b className="block truncate text-sm font-bold text-[#1d2433]">
                Lanjutkan: {continueNote.title}
              </b>
              <small className="text-sm text-[#5d6578]">
                Bab {continueNote.chaptersDone} dari {continueNote.chapterCount}
              </small>
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-bold text-[#1e4fd8]">
              <span>Buka</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
        </section>

        <section aria-labelledby="notes-heading">
          <h2
            id="notes-heading"
            className="mb-3.5 mt-9 text-2xl font-extrabold tracking-tight text-[#1d2433]"
          >
            Catatan
          </h2>

          <div role="group" aria-label="Filter jenis catatan" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(f.value)}
                  className={`rounded-full border-[1.5px] border-[#1d2433] px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-[#1d2433] text-[#faf6ee]"
                      : "bg-[#fffdf8] text-[#5d6578] hover:text-[#1d2433]"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {shownNotes.length === 0 ? (
            <p
              role="status"
              className="mt-4 rounded-xl border-[1.5px] border-dashed border-[#1d2433] bg-[#fffdf8] p-5 text-sm text-[#5d6578]"
            >
              Tidak ada catatan dengan jenis ini.
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {shownNotes.map((n) => {
                const pct = n.chapterCount
                  ? Math.round((n.chaptersDone / n.chapterCount) * 100)
                  : 0;
                return (
                  <li key={n.id} className="min-w-0">
                    <Link
                      href={`/lessons/${n.id}`}
                      className="block h-full overflow-hidden rounded-xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] shadow-[5px_5px_0_#1d2433] transition hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[6px_6px_0_#1d2433]"
                    >
                      <div className="relative h-[150px] overflow-hidden bg-[#dfe8ff] px-4 pt-11">
                        <span className="absolute left-3.5 top-3 inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#1d2433] bg-[#fffdf8] px-2.5 py-0.5 text-xs font-bold text-[#1d2433]">
                          <KindIcon kind={n.kind} />
                          <span>{KIND_LABEL[n.kind]}</span>
                        </span>
                        <p className="m-0 text-[13px] leading-relaxed text-[#5d6578]">
                          {n.snippet}
                        </p>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#dfe8ff] to-transparent" />
                      </div>

                      <div className="p-4">
                        <h3 className="m-0 break-words text-[17px] font-bold leading-snug tracking-tight text-[#1d2433]">
                          {n.title}
                        </h3>
                        <p className="mt-1.5 text-sm text-[#5d6578]">
                          Dibuat {formatDate(n.createdAt)} · {n.chapterCount} bab
                        </p>
                        <div
                          role="progressbar"
                          aria-label={`Kemajuan ${n.title}`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={pct}
                          className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#e6dece]"
                        >
                          <div
                            className="h-full bg-[#1e4fd8]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

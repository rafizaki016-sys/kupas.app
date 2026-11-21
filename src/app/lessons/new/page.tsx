"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, BookOpen, FileText, Headphones, Link2, Sparkles } from "lucide-react";
import {
  generateStudyNoteFromInput,
  upsertStudyNote,
  type NoteKind,
  type StudyNote,
} from "@/lib/kupas-store";

function NewLessonContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSource = searchParams.get("source") || "text";
  const initialQuery = searchParams.get("q") || "";

  const [source, setSource] = useState<string>(initialSource);
  const [title, setTitle] = useState<string>(initialQuery);
  const [content, setContent] = useState<string>(initialQuery);
  const [creating, setCreating] = useState<boolean>(false);

  const triggeredQueryRef = useRef<string | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  useEffect(() => {
    setSource(initialSource);
    if (initialQuery) {
      setTitle(initialQuery);
      setContent(initialQuery);
    }
  }, [initialSource, initialQuery]);

  async function handleCreate(rawQuery: string, rawSource: string, customTitle?: string) {
    if (isSubmittingRef.current) return;
    const textValue = rawQuery.trim() || content.trim() || title.trim();
    if (!textValue) return;

    isSubmittingRef.current = true;
    setCreating(true);

    try {
      const res = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: (customTitle ?? title).trim() || textValue,
          content: textValue,
          source: rawSource,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { note?: StudyNote };
        if (data.note) {
          upsertStudyNote(data.note);
          router.push(`/lessons/${data.note.id}`);
          return;
        }
      }
    } catch {
      // fallback lokal jika endpoint tidak tersedia
    }

    const fallbackNote = generateStudyNoteFromInput({
      source: rawSource,
      query: textValue,
    });
    upsertStudyNote(fallbackNote);
    router.push(`/lessons/${fallbackNote.id}`);
  }

  useEffect(() => {
    const cleanQuery = initialQuery.trim();
    if (!cleanQuery) return;

    const triggerKey = `${initialSource}::${cleanQuery}`;
    if (triggeredQueryRef.current === triggerKey) return;
    triggeredQueryRef.current = triggerKey;

    setCreating(true);
    const timer = setTimeout(() => {
      void handleCreate(cleanQuery, initialSource, cleanQuery);
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, initialSource]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const combined = content.trim() || title.trim();
    if (!combined) return;
    void handleCreate(combined, source, title.trim() || combined);
  }

  const kindBadge: Record<NoteKind, { label: string; hint: string }> = {
    text: {
      label: "Teks / Topik",
      hint: "Ketik topik atau tempel ringkasan materi pelajaran.",
    },
    pdf: {
      label: "Dokumen / Unggah",
      hint: "Masukkan judul atau isi ringkasan dokumen yang ingin dipelajari.",
    },
    slide: {
      label: "Slide Presentasi",
      hint: "Masukkan poin slide kuliah atau presentasi.",
    },
    audio: {
      label: "Rekam / Audio",
      hint: "Masukkan topik atau transkrip singkat rekaman kelas.",
    },
    youtube: {
      label: "Tautan / YouTube",
      hint: "Tempel tautan video/artikel atau topik video yang ingin dipelajari.",
    },
  };

  const activeKind: NoteKind =
    source === "record"
      ? "audio"
      : source === "upload"
        ? "pdf"
        : source === "link"
          ? "youtube"
          : "text";

  return (
    <main className="mx-auto max-w-[820px] space-y-6 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e4fd8] hover:underline"
        >
          <span>← Kembali ke Beranda</span>
        </Link>
        <span className="rounded-full border-[1.5px] border-[#1d2433] bg-[#dfe8ff] px-3 py-1 text-xs font-bold text-[#1d2433]">
          {kindBadge[activeKind].label}
        </span>
      </div>

      {creating ? (
        <div className="rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-8 text-center shadow-[5px_5px_0_#1d2433]">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border-[1.5px] border-[#1d2433] bg-[#dfe8ff] text-[#1e4fd8]">
            <Sparkles className="h-5 w-5 animate-pulse" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-[#1d2433]">
            Menyusun catatan, kartu hafalan, dan kuis...
          </h1>
          <p className="mt-1.5 text-sm text-[#5d6578]">
            Topik: <strong className="text-[#1d2433]">{initialQuery || title}</strong>
          </p>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-6 shadow-[5px_5px_0_#1d2433]"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#1e4fd8]">
              Buat Materi Belajar Baru
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1d2433]">
              {kindBadge[activeKind].label}
            </h1>
            <p className="mt-1 text-sm text-[#5d6578]">{kindBadge[activeKind].hint}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "text", label: "Teks / Topik", icon: BookOpen },
              { id: "upload", label: "Unggah / Dokumen", icon: FileText },
              { id: "link", label: "Tautan", icon: Link2 },
              { id: "record", label: "Rekam / Audio", icon: Headphones },
            ].map((tab) => {
              const Icon = tab.icon;
              const selected = source === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSource(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#1d2433] px-3.5 py-1.5 text-xs font-bold transition ${
                    selected
                      ? "bg-[#1d2433] text-[#faf6ee]"
                      : "bg-white text-[#1d2433] hover:bg-[#dfe8ff]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div>
            <label htmlFor="lesson-title" className="block text-xs font-bold uppercase text-[#1d2433]">
              Judul atau Topik
            </label>
            <input
              id="lesson-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Logika Matematika — proposisi dan tabel kebenaran"
              className="mt-1.5 w-full rounded-xl border-[1.5px] border-[#1d2433] bg-white px-4 py-2.5 text-sm text-[#1d2433] focus:outline-none focus:ring-2 focus:ring-[#1e4fd8]"
            />
          </div>

          <div>
            <label htmlFor="lesson-content" className="block text-xs font-bold uppercase text-[#1d2433]">
              Isi Materi / Tautan / Catatan Singkat
            </label>
            <textarea
              id="lesson-content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tempel catatan, ringkasan bab, atau tautan di sini..."
              className="mt-1.5 w-full rounded-xl border-[1.5px] border-[#1d2433] bg-white p-4 text-sm text-[#1d2433] focus:outline-none focus:ring-2 focus:ring-[#1e4fd8]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!content.trim() && !title.trim()}
              className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-5 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0_#1d2433] transition disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
            >
              <span>Buat &amp; Mulai Belajar</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

export default function NewLessonPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-[820px] px-4 py-10">
          <p className="text-sm font-semibold text-[#5d6578]">Memuat pembuat materi...</p>
        </main>
      }
    >
      <NewLessonContent />
    </Suspense>
  );
}

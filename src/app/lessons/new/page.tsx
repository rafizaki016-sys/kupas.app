"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Headphones,
  Link2,
  Sparkles,
} from "lucide-react";
import {
  buildComprehensiveNoteFromSource,
  cleanTopicFromInput,
  upsertStudyNote,
  type NoteKind,
  type StudyNote,
} from "@/lib/kupas-store";

type SourceMode = "upload" | "record" | "link";

function normalizeSourceMode(raw: string | null): SourceMode {
  if (raw === "record") return "record";
  if (raw === "link") return "link";
  return "upload";
}

function NewLessonContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSource = normalizeSourceMode(searchParams.get("source"));
  const initialQuery = searchParams.get("q") || "";
  const cleanedInitialQuery = cleanTopicFromInput(initialQuery);

  const [source, setSource] = useState<SourceMode>(initialSource);
  const [title, setTitle] = useState<string>(cleanedInitialQuery);
  const [content, setContent] = useState<string>(initialQuery);
  const [creating, setCreating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "info" | "warning" | "error";
    text: string;
  } | null>(null);

  const triggeredQueryRef = useRef<string | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  useEffect(() => {
    setSource(initialSource);
    if (initialQuery) {
      setTitle(cleanTopicFromInput(initialQuery));
      setContent(initialQuery);
    }
  }, [initialSource, initialQuery]);

  async function handleCreate(rawQuery: string, rawSource: SourceMode, customTitle?: string) {
    if (isSubmittingRef.current) return;
    const textValue = rawQuery.trim() || content.trim() || title.trim();
    if (!textValue) {
      setStatusMessage({
        type: "error",
        text: "Isi topik atau tempel catatan terlebih dahulu sebelum membuat materi.",
      });
      return;
    }

    const cleanTitle = cleanTopicFromInput((customTitle ?? title).trim() || textValue);

    isSubmittingRef.current = true;
    setCreating(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          content: textValue,
          source: rawSource,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { note?: StudyNote };
        if (data.note) {
          const finalNote: StudyNote = {
            ...data.note,
            title: cleanTitle || data.note.title,
          };
          upsertStudyNote(finalNote);
          router.push(`/lessons/${finalNote.id}`);
          return;
        }
      } else {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        setStatusMessage({
          type: "warning",
          text:
            errData.error ||
            "Layanan penyusun otomatis sedang tidak merespons — menggunakan penyusun materi lokal.",
        });
      }
    } catch {
      setStatusMessage({
        type: "warning",
        text: "Koneksi ke server terputus — materi disusun menggunakan penyusun lokal.",
      });
    }

    const fallbackNote = buildComprehensiveNoteFromSource({
      source: rawSource,
      query: textValue,
      title: cleanTitle || textValue,
    });
    upsertStudyNote({
      ...fallbackNote,
      title: cleanTitle || fallbackNote.title,
    });
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
      void handleCreate(cleanQuery, initialSource, cleanTopicFromInput(cleanQuery));
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, initialSource]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const combined = content.trim() || title.trim();
    if (!combined) {
      setStatusMessage({
        type: "error",
        text: "Isi judul topik atau tempel isi materi terlebih dahulu.",
      });
      return;
    }
    void handleCreate(combined, source, title.trim() || combined);
  }

  const kindMeta: Record<NoteKind, { label: string; hint: string; placeholder: string }> = {
    pdf: {
      label: "Teks & Berkas",
      hint: "Berkas .txt, .md, dan .csv dibaca isinya secara otomatis. Untuk PDF/Word/Slide, tempel ringkasan teksnya di kolom bawah agar diurai tuntas.",
      placeholder: "Contoh: Kalkulus — limit, turunan, dan integral",
    },
    audio: {
      label: "Transkrip / Rekaman",
      hint: "Tempel transkrip atau poin-poin penting dari rekaman kelas agar disusun menjadi bab, flashcard, dan kuis.",
      placeholder: "Contoh: Ringkasan rekaman kuliah struktur data",
    },
    youtube: {
      label: "Tautan / Topik Video",
      hint: "Tempel tautan YouTube/artikel atau tulis ringkasan poin video agar disusun menjadi pelajaran.",
      placeholder: "Tempel tautan YouTube atau artikel di sini...",
    },
    text: {
      label: "Teks & Berkas",
      hint: "Ketik topik atau tempel catatan pelajaran.",
      placeholder: "Ketik topik pelajaran...",
    },
    slide: {
      label: "Teks & Berkas",
      hint: "Tempel materi slide.",
      placeholder: "Ketik materi slide...",
    },
  };

  const activeKind: NoteKind =
    source === "record" ? "audio" : source === "link" ? "youtube" : "pdf";

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
          {kindMeta[activeKind].label}
        </span>
      </div>

      {creating ? (
        <div className="rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-8 text-center shadow-[5px_5px_0_#1d2433]">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border-[1.5px] border-[#1d2433] bg-[#dfe8ff] text-[#1e4fd8]">
            <Sparkles className="h-5 w-5 animate-pulse" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-[#1d2433]">
            Mengurai materi menjadi bab, catatan, kuis, dan flashcard...
          </h1>
          <p className="mt-1.5 text-sm text-[#5d6578]">
            Topik: <strong className="text-[#1d2433]">{cleanedInitialQuery || title}</strong>
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
              {kindMeta[activeKind].label}
            </h1>
            <p className="mt-1 text-sm text-[#5d6578]">{kindMeta[activeKind].hint}</p>
          </div>

          {statusMessage && (
            <div
              role="status"
              className={`flex items-start gap-2.5 rounded-xl border-[1.5px] p-3.5 text-xs font-semibold ${
                statusMessage.type === "error"
                  ? "border-rose-700 bg-rose-50 text-rose-950"
                  : statusMessage.type === "warning"
                    ? "border-amber-700 bg-amber-50 text-amber-950"
                    : "border-[#1e4fd8] bg-[#dfe8ff] text-[#1d2433]"
              }`}
            >
              {statusMessage.type === "info" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1e4fd8]" aria-hidden="true" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {[
              { id: "upload" as SourceMode, label: "Teks & Berkas", icon: FileText },
              { id: "record" as SourceMode, label: "Transkrip / Rekaman", icon: Headphones },
              { id: "link" as SourceMode, label: "Tautan / Video", icon: Link2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const selected = source === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSource(tab.id);
                    setStatusMessage(null);
                  }}
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

          {source === "upload" && (
            <div className="rounded-xl border-[1.5px] border-dashed border-[#1d2433] bg-[#faf6ee] p-4">
              <label htmlFor="file-upload" className="block text-xs font-bold text-[#1d2433]">
                Unggah berkas teks (.txt, .md, .csv, .json) untuk pembacaan otomatis
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".txt,.md,.markdown,.csv,.json,.pdf,.doc,.docx,.ppt,.pptx"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const cleanName = cleanTopicFromInput(file.name.replace(/\.[^/.]+$/, ""));
                  setTitle(cleanName);

                  const isTextLike =
                    /\.(txt|md|markdown|csv|json|log|ts|tsx|js|jsx|py|html|xml)$/i.test(file.name) ||
                    file.type.startsWith("text/");

                  if (isTextLike) {
                    try {
                      const textBody = await file.text();
                      if (textBody.trim()) {
                        setContent(textBody.slice(0, 8000));
                        setStatusMessage({
                          type: "info",
                          text: `Isi berkas "${file.name}" (${Math.min(
                            textBody.trim().length,
                            8000,
                          )} karakter) berhasil dimuat.`,
                        });
                        return;
                      }
                    } catch {
                      // lanjut ke pesan peringatan di bawah
                    }
                  }

                  setContent((prev) => prev || cleanName);
                  setStatusMessage({
                    type: "warning",
                    text: `Berkas "${file.name}" berformat biner sehingga isinya belum diekstraksi otomatis. Tempel teks atau ringkasan dari berkas tersebut ke kolom isi materi di bawah agar pembahasannya lengkap.`,
                  });
                }}
                className="mt-2 block w-full text-xs text-[#5d6578]"
              />
            </div>
          )}

          <div>
            <label htmlFor="lesson-title" className="block text-xs font-bold uppercase text-[#1d2433]">
              Judul atau Topik
            </label>
            <input
              id="lesson-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={kindMeta[activeKind].placeholder}
              className="mt-1.5 w-full rounded-xl border-[1.5px] border-[#1d2433] bg-white px-4 py-2.5 text-sm text-[#1d2433] focus:outline-none focus:ring-2 focus:ring-[#1e4fd8]"
            />
          </div>

          <div>
            <label htmlFor="lesson-content" className="block text-xs font-bold uppercase text-[#1d2433]">
              {source === "link"
                ? "Tautan YouTube / Artikel atau Poin Materi"
                : "Isi Materi / Catatan / Transkrip"}
            </label>
            <textarea
              id="lesson-content"
              rows={5}
              value={content}
              onChange={(e) => {
                const val = e.target.value;
                setContent(val);
                if (!title.trim() && val.trim()) {
                  setTitle(cleanTopicFromInput(val));
                }
              }}
              placeholder={
                source === "link"
                  ? "Tempel tautan YouTube/artikel atau salin ringkasan poin utamanya di sini..."
                  : "Tempel catatan, paragraf materi, atau transkrip di sini..."
              }
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

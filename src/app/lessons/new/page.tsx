"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  FileSpreadsheet,
  FileText,
  Film,
  Headphones,
  Image as ImageIcon,
  Link2,
  Presentation,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import {
  buildComprehensiveNoteFromSource,
  cleanTopicFromInput,
  upsertStudyNote,
  type StudyNote,
} from "../../../lib/kupas-store";

type SourceMode = "upload" | "record" | "link";

function normalizeSourceMode(raw: string | null): SourceMode {
  if (raw === "record") return "record";
  if (raw === "link") return "link";
  return "upload";
}

const ACCEPTED_EXTENSIONS =
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.md,.json,.png,.jpg,.jpeg,.webp,.mp3,.wav,.m4a,.ogg,.mp4,.webm,.mov";

function NewLessonContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSource = normalizeSourceMode(searchParams.get("source"));
  const initialQuery = searchParams.get("q") || "";
  const cleanedInitialQuery = cleanTopicFromInput(initialQuery);

  const [source, setSource] = useState<SourceMode>(initialSource);
  const [title, setTitle] = useState<string>(cleanedInitialQuery);
  const [content, setContent] = useState<string>(initialQuery);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const triggeredQueryRef = useRef<string | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  useEffect(() => {
    setSource(initialSource);
    if (initialQuery) {
      setTitle(cleanTopicFromInput(initialQuery));
      setContent(initialQuery);
    }
  }, [initialSource, initialQuery]);

  function addIncomingFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setErrorMsg("");

    const incoming = Array.from(fileList);
    setSelectedFiles((prev) => {
      const merged = [...prev, ...incoming].slice(0, 5);
      if (!title.trim() && merged[0]) {
        const cleanName = cleanTopicFromInput(merged[0].name.replace(/\.[^/.]+$/, ""));
        setTitle(cleanName);
      }
      return merged;
    });
  }

  function removeFileAt(idx: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    addIncomingFiles(e.dataTransfer.files);
  }

  async function handleCreate(params: {
    rawQuery: string;
    rawSource: SourceMode;
    customTitle?: string;
    files?: File[];
  }) {
    if (isSubmittingRef.current) return;

    const filesToSend = params.files ?? selectedFiles;
    const textValue = params.rawQuery.trim() || content.trim() || title.trim();

    if (!textValue && filesToSend.length === 0) {
      setErrorMsg("Pilih minimal 1 file atau isi topik/catatan terlebih dahulu.");
      return;
    }

    const fallbackTitleFromFile = filesToSend[0]
      ? cleanTopicFromInput(filesToSend[0].name.replace(/\.[^/.]+$/, ""))
      : "";
    const cleanTitle =
      cleanTopicFromInput((params.customTitle ?? title).trim() || textValue) ||
      fallbackTitleFromFile ||
      "Materi Belajar";

    isSubmittingRef.current = true;
    setCreating(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("title", cleanTitle);
      formData.append("content", textValue);
      formData.append("source", params.rawSource);
      for (const f of filesToSend.slice(0, 5)) {
        formData.append("files", f);
      }

      const res = await fetch("/api/generate-lesson", {
        method: "POST",
        body: formData,
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
      }
    } catch {
      // lanjut ke fallback lokal jika jaringan bermasalah
    }

    const combinedQuery =
      textValue || filesToSend.map((f) => f.name.replace(/\.[^/.]+$/, "")).join(", ");
    const fallbackNote = buildComprehensiveNoteFromSource({
      source: params.rawSource,
      query: combinedQuery,
      title: cleanTitle,
    });
    upsertStudyNote({
      ...fallbackNote,
      title: cleanTitle,
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
      void handleCreate({
        rawQuery: cleanQuery,
        rawSource: initialSource,
        customTitle: cleanTopicFromInput(cleanQuery),
        files: [],
      });
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, initialSource]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void handleCreate({
      rawQuery: content.trim() || title.trim(),
      rawSource: source,
      customTitle: title.trim(),
      files: selectedFiles,
    });
  }

  const formatBadges = [
    { label: "PDF", icon: FileText, color: "text-rose-600" },
    { label: "Word", icon: FileText, color: "text-blue-600" },
    { label: "Slides", icon: Presentation, color: "text-orange-600" },
    { label: "Excel", icon: FileSpreadsheet, color: "text-emerald-600" },
    { label: "Teks", icon: FileText, color: "text-slate-600" },
    { label: "Gambar", icon: ImageIcon, color: "text-violet-600" },
    { label: "Audio", icon: Headphones, color: "text-amber-600" },
    { label: "Video", icon: Film, color: "text-sky-600" },
  ];

  return (
    <main className="mx-auto max-w-[860px] space-y-6 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e4fd8] hover:underline"
        >
          <span>← Kembali ke Beranda</span>
        </Link>
        <span className="rounded-full border-[1.5px] border-[#1d2433] bg-[#dfe8ff] px-3 py-1 text-xs font-bold text-[#1d2433]">
          Multi-Format Materi
        </span>
      </div>

      {creating ? (
        <div className="rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-8 text-center shadow-[5px_5px_0_#1d2433]">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border-[1.5px] border-[#1d2433] bg-[#dfe8ff] text-[#1e4fd8]">
            <Sparkles className="h-5 w-5 animate-pulse" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-[#1d2433]">
            Membaca &amp; mengurai materi menjadi bab, catatan, kuis, dan flashcard...
          </h1>
          <p className="mt-1.5 text-sm text-[#5d6578]">
            Sumber:{" "}
            <strong className="text-[#1d2433]">
              {selectedFiles.length > 0
                ? selectedFiles.map((f) => f.name).join(", ")
                : cleanedInitialQuery || title}
            </strong>
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
              Unggah File atau Masukkan Topik
            </h1>
            <p className="mt-1 text-sm text-[#5d6578]">
              Mendukung dokumen kuliah, slide presentasi, gambar catatan, rekaman audio, maupun video pembelajaran.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border-[1.5px] border-rose-700 bg-rose-50 p-3.5 text-xs font-semibold text-rose-950"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "upload" as SourceMode, label: "Unggah File", icon: Upload },
              { id: "record" as SourceMode, label: "Rekam / Audio", icon: Headphones },
              { id: "link" as SourceMode, label: "YouTube / Tautan", icon: Link2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const selected = source === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSource(tab.id);
                    setErrorMsg("");
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#1d2433] px-3.5 py-1.5 text-xs font-bold transition ${
                    selected
                      ? "bg-[#dfe8ff] text-[#1e4fd8]"
                      : "bg-white text-[#1d2433] hover:bg-[#faf6ee]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Drag & Drop Multi-Format Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition ${
              isDragging
                ? "border-[#1e4fd8] bg-[#dfe8ff]/60"
                : "border-[#9ebcf7] bg-[#fafcff] hover:border-[#1e4fd8]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_EXTENSIONS}
              onChange={(e) => addIncomingFiles(e.target.files)}
              className="hidden"
            />

            <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#e6f0ff] text-[#1e4fd8]">
              <Upload className="h-5 w-5" aria-hidden="true" />
            </div>

            <p className="mt-3 text-sm font-bold text-[#1d2433]">
              Lepas file di sini, atau{" "}
              <span className="text-[#1e4fd8] underline">klik untuk pilih</span>
            </p>
            <p className="mt-1 text-xs text-[#6e7687]">
              Maks 5 file · dokumen 100 MB · gambar 25 MB · audio/video 1 GB · maks 3 jam
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {formatBadges.map((b) => {
                const Icon = b.icon;
                return (
                  <span
                    key={b.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-white px-3 py-1 text-[11px] font-bold text-[#1d2433] shadow-2xs"
                  >
                    <Icon className={`h-3.5 w-3.5 ${b.color}`} aria-hidden="true" />
                    <span>{b.label}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 rounded-xl border border-[#d5cdc0] bg-[#faf6ee] p-3.5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#6e7687]">
                File Terpilih ({selectedFiles.length}/5)
              </p>
              <ul className="space-y-1.5">
                {selectedFiles.map((file, idx) => (
                  <li
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between rounded-lg border border-[#e5ddd0] bg-white px-3 py-2 text-xs"
                  >
                    <span className="truncate font-semibold text-[#1d2433]">
                      {file.name}{" "}
                      <span className="font-normal text-[#6e7687]">
                        ({Math.max(1, Math.round(file.size / 1024))} KB)
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Hapus ${file.name}`}
                      onClick={() => removeFileAt(idx)}
                      className="ml-2 rounded-md p-1 text-[#6e7687] hover:bg-rose-50 hover:text-rose-700"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
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
              placeholder="Otomatis terisi dari nama file, atau ketik topik pelajaran..."
              className="mt-1.5 w-full rounded-xl border-[1.5px] border-[#1d2433] bg-white px-4 py-2.5 text-sm text-[#1d2433] focus:outline-none focus:ring-2 focus:ring-[#1e4fd8]"
            />
          </div>

          <div>
            <label htmlFor="lesson-content" className="block text-xs font-bold uppercase text-[#1d2433]">
              Catatan Tambahan / Tautan (Opsional bila sudah unggah file)
            </label>
            <textarea
              id="lesson-content"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tempel tautan YouTube, catatan tambahan, atau fokus bab yang ingin dipelajari..."
              className="mt-1.5 w-full rounded-xl border-[1.5px] border-[#1d2433] bg-white p-3.5 text-sm text-[#1d2433] focus:outline-none focus:ring-2 focus:ring-[#1e4fd8]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!content.trim() && !title.trim() && selectedFiles.length === 0}
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
        <main className="mx-auto max-w-[860px] px-4 py-10">
          <p className="text-sm font-semibold text-[#5d6578]">Memuat pembuat materi...</p>
        </main>
      }
    >
      <NewLessonContent />
    </Suspense>
  );
}

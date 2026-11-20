"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Plus, Search, Upload, Youtube, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadLocalSets, saveLocalSet, StudySet } from "@/lib/data";
import { getAiHeaders } from "@/lib/byok";

export default function DashboardPage() {
  const router = useRouter();
  const [sets, setSets] = useState<StudySet[]>([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState<"text" | "youtube">("text");
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSets(loadLocalSets());
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/study-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAiHeaders() },
        body: JSON.stringify({
          title: title.trim() || "Materi Baru",
          source_type: tab === "youtube" ? "youtube" : "txt",
          content: tab === "youtube" ? `Ringkas materi dari tautan YouTube: ${ytUrl}` : rawText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses materi.");
      saveLocalSet(data);
      setModalOpen(false);
      router.push(`/set/${data.id}/summary`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = sets.filter((s) => s.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="mx-auto max-w-[1200px] p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">Perpustakaan Belajarmu</h1>
          <p className="text-sm text-muted">Semua rangkuman dan flashcard tersimpan lokal agar bisa dibuka offline.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah Materi
        </Button>
      </div>

      <div className="relative mt-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" />
        <input
          type="search"
          aria-label="Cari materi"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari catatan..."
          className="h-10 w-full rounded-md border border-border-input bg-surface pl-9 pr-3 text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-lg border border-border bg-surface p-8 text-center">
          <p className="font-semibold text-text">Belum ada materi tersimpan</p>
          <p className="mt-1 text-sm text-muted">Unggah catatan atau tempel tautan YouTube pertamamu.</p>
          <Button className="mt-4" onClick={() => setModalOpen(true)}>Tambah Materi</Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((set) => (
            <Link
              key={set.id}
              href={`/set/${set.id}/summary`}
              className="rounded-md border border-border bg-surface p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
                <span className="rounded-full bg-success-bg px-2 py-0.5 text-xs font-medium text-success-text">
                  Siap Offline
                </span>
              </div>
              <h2 className="mt-3 line-clamp-2 font-semibold text-text">{set.title}</h2>
              <p className="mt-2 text-xs text-muted">
                {set.flashcards.length} flashcard · {set.quiz.length} soal kuis
              </p>
            </Link>
          ))}
        </div>
      )}

      {modalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-text/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-surface p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tambah Materi Baru</h2>
              <button onClick={() => setModalOpen(false)} aria-label="Tutup" className="p-1 text-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <Button size="sm" variant={tab === "text" ? "primary" : "secondary"} onClick={() => setTab("text")}>
                <Upload className="h-3.5 w-3.5" /> Teks / Catatan
              </Button>
              <Button size="sm" variant={tab === "youtube" ? "primary" : "secondary"} onClick={() => setTab("youtube")}>
                <Youtube className="h-3.5 w-3.5" /> Tautan YouTube
              </Button>
            </div>

            <form onSubmit={handleGenerate} className="mt-4 space-y-3">
              <input
                type="text"
                required
                placeholder="Judul materi (misal: Biologi Sel Bab 2)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 w-full rounded-md border border-border-input bg-surface px-3 text-sm"
              />
              {tab === "text" ? (
                <textarea
                  required
                  rows={6}
                  placeholder="Tempel isi catatan kuliah, materi PDF, atau ringkasan bab di sini..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full rounded-md border border-border-input bg-surface p-3 text-sm"
                />
              ) : (
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  className="h-10 w-full rounded-md border border-border-input bg-surface px-3 text-sm"
                />
              )}
              {error && <p role="alert" className="rounded-md bg-danger-bg p-2 text-xs text-danger-text">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
                <Button type="submit" loading={loading}>Kupas Sekarang</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

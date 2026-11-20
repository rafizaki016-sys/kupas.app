"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAiHeaders } from "@/lib/byok";

export default function SnapSolvePage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [mime, setMime] = useState("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSelect(file: File | null) {
    setError(null);
    setAnswer(null);
    if (!file) return;
    setMime(file.type || "image/jpeg");
    setPreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => setBase64(String(reader.result).split(",")[1] ?? null);
    reader.readAsDataURL(file);
  }

  async function handleSolve() {
    if (!base64) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/snap-solve", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAiHeaders() },
        body: JSON.stringify({ image_base64: base64, mime_type: mime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Foto belum terbaca jelas.");
      setAnswer(data.solution);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Coba foto ulang di tempat yang lebih terang.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[720px] p-4 md:p-8">
      <h1 className="text-xl font-bold">Foto &amp; Bahas Soal</h1>
      <p className="mt-1 text-sm text-muted">Foto soal yang ingin dibahas, kami uraikan langkah demi langkah.</p>

      <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-input bg-surface p-8 text-center">
        <Camera className="h-7 w-7 text-accent" aria-hidden="true" />
        <span className="mt-2 text-sm font-medium">Ambil foto atau pilih gambar soal</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
        />
      </label>

      {preview && (
        <div className="mt-4 space-y-3">
          <img src={preview} alt="Foto soal terpilih" className="max-h-72 w-full rounded-md border border-border object-contain bg-surface-subtle" />
          <Button onClick={handleSolve} loading={loading} className="w-full">Bahas Langkah demi Langkah</Button>
        </div>
      )}

      {error && <p role="alert" className="mt-4 rounded-md bg-danger-bg p-3 text-sm text-danger-text">{error}</p>}

      {answer && (
        <div className="mt-6 whitespace-pre-wrap rounded-lg border border-border bg-surface p-5 text-sm leading-relaxed shadow-sm">
          {answer}
        </div>
      )}
    </div>
  );
}

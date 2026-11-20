"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RotateCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocalSet } from "@/lib/data";

export default function FlashcardsPage() {
  const { id } = useParams<{ id: string }>();
  const [cards, setCards] = useState<{ id: string; front: string; back: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const set = getLocalSet(id);
    setCards(set?.flashcards ?? []);
  }, [id]);

  const current = cards[index];

  if (cards.length === 0 || index >= cards.length) {
    return (
      <div className="mx-auto max-w-[720px] p-6 text-center">
        <div className="rounded-lg border border-border bg-surface p-8">
          <CheckCircle2 className="mx-auto h-8 w-8 text-success" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold">Mantap! Semua kartu selesai diulang.</h2>
          {cards.length > 0 && (
            <Button variant="secondary" className="mt-4" onClick={() => { setIndex(0); setFlipped(false); }}>
              Ulangi dari awal
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] p-6">
      <p className="text-xs text-muted">Kartu {index + 1} dari {cards.length} (tersimpan offline)</p>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="mt-4 flex min-h-[260px] w-full flex-col items-center justify-center rounded-lg border border-border bg-surface p-8 text-center shadow-md"
      >
        <span className="text-xs font-semibold uppercase text-muted">{flipped ? "Jawaban" : "Pertanyaan"}</span>
        <p className="mt-3 text-lg font-medium">{flipped ? current.back : current.front}</p>
        <span className="mt-6 inline-flex items-center gap-1 text-xs text-muted">
          <RotateCw className="h-3.5 w-3.5" /> Ketuk untuk membalik kartu
        </span>
      </button>

      {flipped && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {["Ulangi", "Sulit", "Paham", "Mudah"].map((label) => (
            <Button key={label} variant="secondary" onClick={() => { setFlipped(false); setIndex((i) => i + 1); }}>
              {label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

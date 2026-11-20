"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Layers,
  ListChecks,
  MessageSquare,
  RotateCcw,
  Shuffle,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocalSet, StudySet } from "@/lib/data";

type RawCard = StudySet["flashcards"][number];

interface NormalizedCard {
  id: string;
  front: string;
  back: string;
}

function normalizeCards(items: RawCard[]): NormalizedCard[] {
  return items.map((item, idx) => {
    const rec = item as unknown as Record<string, unknown>;
    const front =
      typeof rec.front === "string"
        ? rec.front
        : typeof rec.question === "string"
          ? rec.question
          : typeof rec.term === "string"
            ? rec.term
            : "";
    const back =
      typeof rec.back === "string"
        ? rec.back
        : typeof rec.answer === "string"
          ? rec.answer
          : typeof rec.definition === "string"
            ? rec.definition
            : "";
    return {
      id: typeof rec.id === "string" ? rec.id : `card-${idx}`,
      front,
      back,
    };
  });
}

export default function FlashcardsPage() {
  const { id } = useParams<{ id: string }>();
  const [set, setSet] = useState<StudySet | null>(null);
  const [deck, setDeck] = useState<NormalizedCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [status, setStatus] = useState<Record<string, "known" | "review">>({});
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const found = getLocalSet(id);
    setSet(found);
    if (found?.flashcards) {
      setDeck(normalizeCards(found.flashcards));
    }
  }, [id]);

  const total = deck.length;
  const current = deck[index];

  const goPrev = useCallback(() => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setFlipped(false);
    }
  }, [index]);

  const goNext = useCallback(() => {
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      setFlipped(false);
    } else if (total > 0) {
      setCompleted(true);
    }
  }, [index, total]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (completed || total === 0) return;
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.code === "ArrowRight") {
        goNext();
      } else if (e.code === "ArrowLeft") {
        goPrev();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [completed, total, goNext, goPrev]);

  function handleMark(result: "known" | "review") {
    if (!current) return;
    setStatus((prev) => ({ ...prev, [current.id]: result }));
    goNext();
  }

  function handleShuffle() {
    setDeck((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
    setIndex(0);
    setFlipped(false);
    setCompleted(false);
  }

  function handleRestartAll() {
    if (!set) return;
    setDeck(normalizeCards(set.flashcards ?? []));
    setStatus({});
    setIndex(0);
    setFlipped(false);
    setCompleted(false);
  }

  function handleReviewMissed() {
    const missed = deck.filter((c) => status[c.id] !== "known");
    if (missed.length === 0) {
      handleRestartAll();
      return;
    }
    setDeck(missed);
    setIndex(0);
    setFlipped(false);
    setCompleted(false);
  }

  if (!set) {
    return (
      <div className="mx-auto max-w-[760px] p-6">
        <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
          Materi tidak ditemukan.
        </div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="mx-auto max-w-[760px] p-6">
        <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
          Belum ada flashcard untuk materi ini.
        </div>
      </div>
    );
  }

  const knownCount = deck.filter((c) => status[c.id] === "known").length;
  const reviewCount = deck.filter((c) => status[c.id] === "review").length;

  // Halaman Selesai Sesi
  if (completed) {
    const masteryPercent = Math.round((knownCount / total) * 100);
    const hasUnmastered = knownCount < total;

    return (
      <div className="mx-auto max-w-[760px] p-4 md:p-8">
        <div className="rounded-lg border border-border bg-surface p-6 text-center shadow-sm md:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Sparkles className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-accent">
            Sesi Flashcard Selesai
          </p>
          <h1 className="mt-1 text-2xl font-bold text-text">
            {masteryPercent === 100 ? "Semua Kartu Sudah Hafal!" : "Bagus, Terus Latih!"}
          </h1>
          <p className="mt-1 text-sm text-muted">{set.title}</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-surface-subtle/60 p-3">
              <p className="text-xs text-muted">Penguasaan</p>
              <p className="mt-1 text-2xl font-bold text-accent">{masteryPercent}%</p>
            </div>
            <div className="rounded-lg border border-border bg-success-bg/60 p-3">
              <p className="text-xs text-success-text">Sudah Hafal</p>
              <p className="mt-1 text-2xl font-bold text-success-text">{knownCount}</p>
            </div>
            <div className="rounded-lg border border-border bg-warning-bg/60 p-3">
              <p className="text-xs text-warning-text">Perlu Diulang</p>
              <p className="mt-1 text-2xl font-bold text-warning-text">
                {total - knownCount}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {hasUnmastered && (
              <Button onClick={handleReviewMissed}>
                <RotateCcw className="h-4 w-4" />
                Ulangi yang Belum Hafal ({total - knownCount})
              </Button>
            )}
            <Button variant={hasUnmastered ? "secondary" : "primary"} onClick={handleRestartAll}>
              <RotateCcw className="h-4 w-4" />
              Ulangi Semua Kartu
            </Button>
            <Link
              href={`/set/${set.id}/quiz`}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium text-text hover:bg-surface-subtle"
            >
              <ListChecks className="h-4 w-4 text-accent" />
              Lanjut Kuis
            </Link>
            <Link
              href={`/set/${set.id}/chat`}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium text-text hover:bg-surface-subtle"
            >
              <MessageSquare className="h-4 w-4 text-accent" />
              Tanya Tutor AI
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((index + 1) / total) * 100);

  return (
    <div className="mx-auto max-w-[760px] p-4 md:p-8">
      {/* Header & Progress */}
      <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
              <Layers className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold text-accent">
                Kartu {index + 1} dari {total}
              </p>
              <p className="line-clamp-1 text-xs text-muted">{set.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text">
              Hafal: {knownCount}
            </span>
            <span className="rounded-full bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning-text">
              Ulang: {reviewCount}
            </span>
            <Button size="sm" variant="secondary" onClick={handleShuffle} aria-label="Acak kartu">
              <Shuffle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Acak</span>
            </Button>
          </div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Kartu Utama */}
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Tampilkan pertanyaan" : "Balik kartu untuk melihat jawaban"}
        className={`mt-5 flex min-h-[290px] w-full flex-col justify-between rounded-xl border-2 p-6 text-left shadow-sm transition-all duration-200 md:min-h-[320px] md:p-8 ${
          flipped
            ? "border-accent bg-accent/5"
            : "border-border bg-surface hover:border-accent/50"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              flipped
                ? "bg-accent text-on-accent"
                : "bg-surface-subtle text-accent"
            }`}
          >
            {flipped ? "Jawaban" : "Pertanyaan"}
          </span>
          <span className="text-xs text-muted">
            {flipped ? "Klik untuk kembali" : "Klik kartu atau tekan Spasi"}
          </span>
        </div>

        <div className="my-6 flex flex-1 items-center justify-center text-center">
          <p
            className={`whitespace-pre-wrap leading-relaxed ${
              flipped
                ? "text-base font-medium text-text md:text-lg"
                : "text-xl font-bold text-text md:text-2xl"
            }`}
          >
            {flipped ? current.back : current.front}
          </p>
        </div>

        <div className="flex items-center justify-center text-xs font-medium text-accent">
          {flipped ? "Tandai penguasaanmu di bawah" : "Ketuk untuk membuka jawaban"}
        </div>
      </button>

      {/* Tombol Penilaian Hafalan */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleMark("review")}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-danger/30 bg-danger-bg/60 px-4 text-sm font-semibold text-danger-text transition hover:bg-danger-bg"
        >
          <XCircle className="h-4 w-4" />
          Masih Bingung
        </button>
        <button
          type="button"
          onClick={() => handleMark("known")}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-success/30 bg-success-bg/70 px-4 text-sm font-semibold text-success-text transition hover:bg-success-bg"
        >
          <CheckCircle2 className="h-4 w-4" />
          Sudah Hafal
        </button>
      </div>

      {/* Navigasi Bawah */}
      <div className="mt-4 flex items-center justify-between">
        <Button size="sm" variant="secondary" onClick={goPrev} disabled={index === 0}>
          <ArrowLeft className="h-4 w-4" />
          Sebelumnya
        </Button>

        <Button size="sm" variant="secondary" onClick={goNext}>
          {index + 1 < total ? "Lewati" : "Selesai"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

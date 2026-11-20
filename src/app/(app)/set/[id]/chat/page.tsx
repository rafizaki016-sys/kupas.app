"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  Layers,
  ListChecks,
  MessageSquare,
  Network,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { getLocalSet, StudySet } from "@/lib/data";

export default function SetOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const [set, setSet] = useState<StudySet | null>(null);

  useEffect(() => {
    setSet(getLocalSet(id));
  }, [id]);

  if (!set) {
    return (
      <div className="mx-auto max-w-[960px] p-6">
        <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
          Materi tidak ditemukan.
        </div>
      </div>
    );
  }

  const flashcardCount = set.flashcards?.length ?? 0;
  const quizCount = set.quiz?.length ?? 0;
  const sectionCount = (set.summary_markdown || "")
    .replace(/\\n/g, "\n")
    .split("\n")
    .filter((line) => line.trim().startsWith("## ") || line.trim().startsWith("# ")).length;

  const modes = [
    {
      key: "summary",
      title: "Catatan & Rangkuman",
      description: "Baca poin inti, konsep utama, dan daftar isi terstruktur.",
      meta: sectionCount > 0 ? `${sectionCount} bagian materi` : "Ringkasan siap baca",
      href: `/set/${set.id}/summary`,
      icon: FileText,
      accentClass: "bg-accent/10 text-accent",
      cta: "Buka Catatan",
    },
    {
      key: "mindmap",
      title: "Peta Konsep",
      description: "Jelajahi hubungan antar-konsep dalam diagram cabang interaktif.",
      meta: "Geser & lipat cabang",
      href: `/set/${set.id}/mindmap`,
      icon: Network,
      accentClass: "bg-sky-500/10 text-sky-700",
      cta: "Lihat Peta Konsep",
    },
    {
      key: "quiz",
      title: "Latihan Kuis",
      description: "Uji pemahaman dengan pilihan ganda, skor instan, dan pembahasan.",
      meta: `${quizCount} soal latihan`,
      href: `/set/${set.id}/quiz`,
      icon: ListChecks,
      accentClass: "bg-amber-500/10 text-amber-700",
      cta: "Mulai Kuis",
    },
    {
      key: "flashcards",
      title: "Flashcard Offline",
      description: "Hafalkan istilah & konsep kunci dengan kartu bolak-balik.",
      meta: `${flashcardCount} kartu hafalan`,
      href: `/set/${set.id}/flashcards`,
      icon: Layers,
      accentClass: "bg-emerald-500/10 text-emerald-700",
      cta: "Latih Flashcard",
    },
  ];

  return (
    <div className="mx-auto max-w-[980px] space-y-6 p-4 md:p-8">
      {/* Navigasi Kembali */}
      <div>
        <Link
          href="/sets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Daftar Materi
        </Link>
      </div>

      {/* Hero Header Set Materi */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm md:p-7">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2.5 py-1 font-semibold uppercase tracking-wide text-accent">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            {set.source_type}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-1 font-medium text-success-text">
            <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
            Tersimpan Offline
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-text md:text-3xl">
          {set.title}
        </h1>

        <p className="mt-2 text-sm text-muted">
          Pilih mode belajar yang paling cocok untukmu saat ini atau tanya langsung ke Tutor AI.
        </p>

        {/* Ringkasan Angka Cepat */}
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-5">
          <div className="rounded-lg bg-surface-subtle/70 p-3">
            <p className="text-xs text-muted">Bagian Catatan</p>
            <p className="mt-0.5 text-lg font-bold text-text">
              {sectionCount > 0 ? sectionCount : 1}
            </p>
          </div>
          <div className="rounded-lg bg-surface-subtle/70 p-3">
            <p className="text-xs text-muted">Flashcard</p>
            <p className="mt-0.5 text-lg font-bold text-accent">{flashcardCount}</p>
          </div>
          <div className="rounded-lg bg-surface-subtle/70 p-3">
            <p className="text-xs text-muted">Soal Kuis</p>
            <p className="mt-0.5 text-lg font-bold text-text">{quizCount}</p>
          </div>
        </div>
      </section>

      {/* Grid 4 Mode Belajar */}
      <section aria-label="Mode belajar" className="grid gap-4 sm:grid-cols-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <Link
              key={mode.key}
              href={mode.href}
              className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:border-accent/60 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${mode.accentClass}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-surface-subtle px-2.5 py-1 text-[11px] font-semibold text-muted">
                    {mode.meta}
                  </span>
                </div>

                <h2 className="mt-4 text-base font-bold text-text group-hover:text-accent">
                  {mode.title}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {mode.description}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-accent">
                <span>{mode.cta}</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </section>

      {/* Banner Tutor AI */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-accent/25 bg-accent/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-on-accent">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text">
              Masih ada bagian yang bikin bingung?
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Diskusikan langsung dengan Tutor AI Kupas berbasis isi materi ini lewat teks atau suara.
            </p>
          </div>
        </div>

        <Link
          href={`/set/${set.id}/chat`}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-xs font-semibold text-on-accent transition hover:bg-accent-hover"
        >
          <MessageSquare className="h-4 w-4" />
          Buka Tutor AI
        </Link>
      </section>
    </div>
  );
}

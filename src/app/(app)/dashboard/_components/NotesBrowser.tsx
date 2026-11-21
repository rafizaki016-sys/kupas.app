"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Note, NoteKind } from "../data";
import { readStoredNotes } from "@/lib/kupas-store";
import { IconDoc, IconMic, IconNote, IconPlay, IconSlide } from "./icons";
import styles from "../dashboard.module.css";

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
    case "pdf": return <IconDoc />;
    case "slide": return <IconSlide />;
    case "audio": return <IconMic />;
    case "youtube": return <IconPlay />;
    default: return <IconNote />;
  }
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

export function NotesBrowser({ notes }: { notes: Note[] }) {
  const [mergedNotes, setMergedNotes] = useState<Note[]>(notes);
  const [filter, setFilter] = useState<"all" | NoteKind>("all");

  useEffect(() => {
    const stored = readStoredNotes();
    if (stored.length > 0) {
      const mapped: Note[] = stored.map((s) => ({
        id: s.id,
        title: s.title,
        kind: s.kind,
        snippet: s.snippet,
        createdAt: s.createdAt,
        chapterCount: s.chapterCount,
        chaptersDone: s.chaptersDone,
      }));
      setMergedNotes(mapped);
    }
  }, [notes]);

  const shown = useMemo(
    () => (filter === "all" ? mergedNotes : mergedNotes.filter((n) => n.kind === filter)),
    [mergedNotes, filter],
  );

  return (
    <section aria-labelledby="notes-heading">
      <h2 id="notes-heading" className={styles.h2}>Catatan</h2>

      <div className={styles.filters} role="group" aria-label="Filter jenis catatan">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={styles.filter}
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {mergedNotes.length === 0 ? (
        <p className={styles.empty}>Belum ada catatan. Tempel materi di atas untuk membuat yang pertama.</p>
      ) : shown.length === 0 ? (
        <p className={styles.empty} role="status">Tidak ada catatan dengan jenis ini.</p>
      ) : (
        <ul className={styles.grid}>
          {shown.map((n) => {
            const pct = n.chapterCount ? Math.round((n.chaptersDone / n.chapterCount) * 100) : 0;
            return (
              <li key={n.id} className={styles.noteItem}>
                <Link href={`/lessons/${n.id}`} className={styles.note}>
                  <div className={styles.preview}>
                    <span className={styles.badge}><KindIcon kind={n.kind} />{KIND_LABEL[n.kind]}</span>
                    <p className={styles.snippet}>{n.snippet}</p>
                  </div>
                  <div className={styles.noteBody}>
                    <h3 className={styles.noteTitle}>{n.title}</h3>
                    <p className={styles.meta}>
                      Dibuat {formatDate(n.createdAt)} · {n.chapterCount} bab
                    </p>
                    <div
                      className={styles.bar}
                      role="progressbar"
                      aria-label={`Kemajuan ${n.title}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={pct}
                    >
                      <i style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

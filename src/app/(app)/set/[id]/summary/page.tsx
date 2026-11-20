"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BookOpen,
  Check,
  Copy,
  Layers,
  ListChecks,
  Printer,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocalSet, StudySet } from "@/lib/data";

interface Section {
  id: string;
  title: string;
  lines: string[];
}

function renderInline(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-text">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={idx}
          className="rounded bg-surface-subtle px-1.5 py-0.5 font-mono text-[0.85em] text-accent"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return <span key={idx}>{token}</span>;
  });
}

function parseSections(markdown: string): Section[] {
  const rawLines = markdown.replace(/\\n/g, "\n").split("\n");
  const sections: Section[] = [];
  let current: Section = { id: "ringkasan", title: "Ringkasan Materi", lines: [] };

  for (const raw of rawLines) {
    const line = raw.trim();
    if (line.startsWith("## ") || line.startsWith("# ")) {
      if (current.lines.length > 0) sections.push(current);
      const title = line.replace(/^#{1,3}\s+/, "").trim();
      const id =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `bagian-${sections.length + 1}`;
      current = { id, title, lines: [] };
    } else if (line.length > 0) {
      current.lines.push(line);
    }
  }

  if (current.lines.length > 0) sections.push(current);
  return sections;
}

export default function SummaryPage() {
  const { id } = useParams<{ id: string }>();
  const [set, setSet] = useState<StudySet | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSet(getLocalSet(id));
  }, [id]);

  const sections = useMemo(
    () => (set ? parseSections(set.summary_markdown) : []),
    [set]
  );

  async function handleCopy() {
    if (!set) return;
    await navigator.clipboard.writeText(set.summary_markdown.replace(/\\n/g, "\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!set) {
    return (
      <div className="mx-auto max-w-[900px] p-6">
        <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
          Materi tidak ditemukan.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1040px] p-4 md:p-8">
      {/* Header Catatan */}
      <header className="rounded-lg border border-border bg-surface p-6 shadow-sm">
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

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Tersalin" : "Salin Catatan"}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" />
              Cetak / PDF
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/set/${set.id}/flashcards`}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-surface-subtle px-3 text-xs font-semibold text-text hover:bg-border/60"
            >
              <Layers className="h-3.5 w-3.5 text-accent" />
              {set.flashcards.length} Flashcard
            </Link>
            <Link
              href={`/set/${set.id}/quiz`}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-xs font-semibold text-on-accent hover:bg-accent-hover"
            >
              <ListChecks className="h-3.5 w-3.5" />
              Latihan Kuis ({set.quiz.length})
            </Link>
          </div>
        </div>
      </header>

      {/* Konten + Daftar Isi */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_230px]">
        <article className="space-y-4">
          {sections.map((section, sIdx) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-6 rounded-lg border border-border bg-surface p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10 text-xs font-bold text-accent">
                  {sIdx + 1}
                </span>
                <h2 className="text-lg font-bold text-text">{section.title}</h2>
              </div>

              <div className="mt-4 space-y-3 text-[15px] leading-7 text-text/90">
                {section.lines.map((line, lIdx) => {
                  if (line.startsWith("### ")) {
                    return (
                      <h3 key={lIdx} className="pt-2 text-base font-semibold text-text">
                        {line.replace(/^###\s+/, "")}
                      </h3>
                    );
                  }

                  const numbered = line.match(/^(\d+)\.\s+(.*)$/);
                  if (numbered) {
                    return (
                      <div
                        key={lIdx}
                        className="flex items-start gap-3 rounded-md bg-surface-subtle/70 p-3"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-on-accent">
                          {numbered[1]}
                        </span>
                        <p className="flex-1">{renderInline(numbered[2])}</p>
                      </div>
                    );
                  }

                  if (line.startsWith("- ") || line.startsWith("* ")) {
                    return (
                      <div key={lIdx} className="flex items-start gap-3 pl-1">
                        <span
                          className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-accent"
                          aria-hidden="true"
                        />
                        <p className="flex-1">{renderInline(line.slice(2))}</p>
                      </div>
                    );
                  }

                  return <p key={lIdx}>{renderInline(line)}</p>;
                })}
              </div>
            </section>
          ))}
        </article>

        {/* Daftar Isi (Desktop) */}
        {sections.length > 1 && (
          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-lg border border-border bg-surface p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Daftar Isi
              </p>
              <nav aria-label="Daftar isi catatan" className="mt-3 space-y-1.5">
                {sections.map((section, idx) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-start gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-muted transition hover:bg-surface-subtle hover:text-accent"
                  >
                    <span className="text-accent">{idx + 1}.</span>
                    <span className="line-clamp-2">{section.title}</span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

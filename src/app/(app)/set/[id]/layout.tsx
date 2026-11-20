"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const tabs = [
  { slug: "summary", label: "Rangkuman" },
  { slug: "flashcards", label: "Flashcard" },
  { slug: "quiz", label: "Kuis" },
  { slug: "mindmap", label: "Peta Konsep" },
  { slug: "chat", label: "Tutor AI" },
];

export default function StudySetLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();

  return (
    <div>
      <div role="tablist" className="flex overflow-x-auto border-b border-border bg-surface px-4">
        {tabs.map((t) => {
          const href = `/set/${id}/${t.slug}`;
          const active = pathname === href;
          return (
            <Link
              key={t.slug}
              role="tab"
              aria-selected={active}
              href={href}
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition ${
                active ? "border-accent text-accent" : "border-transparent text-muted hover:text-text"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}

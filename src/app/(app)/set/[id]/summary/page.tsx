"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getLocalSet, StudySet } from "@/lib/data";

export default function SummaryPage() {
  const { id } = useParams<{ id: string }>();
  const [set, setSet] = useState<StudySet | null>(null);

  useEffect(() => {
    setSet(getLocalSet(id));
  }, [id]);

  if (!set) return <p className="p-6 text-sm text-muted">Materi tidak ditemukan.</p>;

  return (
    <article className="mx-auto max-w-[720px] p-6">
      <h1 className="text-xl font-bold text-text">{set.title}</h1>
      <div className="mt-6 whitespace-pre-wrap rounded-lg border border-border bg-surface p-6 text-base leading-relaxed shadow-sm">
        {set.summary_markdown}
      </div>
    </article>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getLocalSet, StudySet } from "@/lib/data";

export default function MindMapPage() {
  const { id } = useParams<{ id: string }>();
  const [map, setMap] = useState<StudySet["mindmap"] | null>(null);

  useEffect(() => {
    setMap(getLocalSet(id)?.mindmap ?? null);
  }, [id]);

  if (!map) return <p className="p-6 text-sm text-muted">Peta konsep belum tersedia.</p>;

  return (
    <div className="mx-auto max-w-[900px] p-6">
      <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <div className="inline-block rounded-md bg-accent px-4 py-2 text-sm font-bold text-on-accent">
          {map.label}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {(map.children ?? []).map((branch, i) => (
            <div key={i} className="rounded-md border border-border bg-surface-subtle p-4">
              <p className="font-semibold text-text">{branch.label}</p>
              <ul className="mt-2 space-y-1 text-sm text-muted list-disc list-inside">
                {(branch.children ?? []).map((leaf, j) => (
                  <li key={j}>{leaf.label}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

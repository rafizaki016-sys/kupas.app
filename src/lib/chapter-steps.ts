import type { ChapterItem, ConceptItem, ExampleItem, QuizItem } from "./kupas-store";

/**
 * Satu langkah di layar bab. Tiap jenis langkah membaca kolom data yang berbeda,
 * jadi isi yang sama tidak tampil di beberapa langkah.
 */
export type ChapterStep =
  | { id: string; label: string; type: "intro"; title: string; paragraphs: string[]; objectives: string[] }
  | { id: string; label: string; type: "concept"; concept: ConceptItem }
  | { id: string; label: string; type: "map"; root: string; nodes: string[] }
  | { id: string; label: string; type: "example"; number: number; example: ExampleItem }
  | { id: string; label: string; type: "mistakes"; items: string[] }
  | { id: string; label: string; type: "check"; questions: QuizItem[] }
  | { id: string; label: string; type: "recap"; items: string[] }
  | { id: string; label: string; type: "points"; items: string[] };

function paragraphsOf(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Bab dianggap lengkap bila punya minimal satu konsep terurai. */
export function hasRichContent(chapter: ChapterItem): boolean {
  return Array.isArray(chapter.concepts) && chapter.concepts.length > 0;
}

export function buildChapterSteps(chapter: ChapterItem): ChapterStep[] {
  const steps: ChapterStep[] = [];

  if (!hasRichContent(chapter)) {
    // Catatan lama atau bab cadangan: tampilkan apa adanya, tanpa mengulang.
    steps.push({
      id: "intro",
      label: "Gambaran bab",
      type: "intro",
      title: chapter.title,
      paragraphs: [chapter.summary],
      objectives: [],
    });
    if (chapter.points.length > 0) {
      steps.push({ id: "points", label: "Poin utama", type: "points", items: chapter.points });
    }
    return steps;
  }

  const concepts = chapter.concepts ?? [];
  const examples = chapter.examples ?? [];

  steps.push({
    id: "intro",
    label: "Gambaran bab",
    type: "intro",
    title: chapter.title,
    paragraphs: paragraphsOf(chapter.intro || chapter.summary),
    objectives: chapter.objectives ?? [],
  });

  concepts.forEach((concept, i) => {
    steps.push({ id: `concept-${i + 1}`, label: concept.concept, type: "concept", concept });
  });

  // Peta hanya berisi nama simpul, tidak menyalin kalimat penjelasan.
  if (concepts.length >= 3) {
    steps.push({
      id: "map",
      label: "Peta konsep",
      type: "map",
      root: chapter.title,
      nodes: concepts.map((c) => c.concept),
    });
  }

  examples.forEach((example, i) => {
    steps.push({
      id: `example-${i + 1}`,
      label: `Contoh ${i + 1}`,
      type: "example",
      number: i + 1,
      example,
    });
  });

  if (chapter.mistakes && chapter.mistakes.length > 0) {
    steps.push({ id: "mistakes", label: "Kesalahan umum", type: "mistakes", items: chapter.mistakes });
  }
  if (chapter.checks && chapter.checks.length > 0) {
    steps.push({ id: "check", label: "Cek pemahaman", type: "check", questions: chapter.checks });
  }
  if (chapter.recap && chapter.recap.length > 0) {
    steps.push({ id: "recap", label: "Rangkuman bab", type: "recap", items: chapter.recap });
  }

  return steps;
}

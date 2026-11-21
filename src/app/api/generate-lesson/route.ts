import { NextResponse } from "next/server";
import {
  buildRichSubjectNote,
  cleanTopicFromInput,
  type ChapterItem,
  type FlashcardItem,
  type QuizItem,
  type StudyNote,
} from "../../../lib/kupas-store";

type OutlineChapter = {
  chapterIndex: number;
  title: string;
  learningObjectives: string[];
  keyConcepts: string[];
};

type OutlinePayload = {
  title: string;
  snippet: string;
  chapters: OutlineChapter[];
  mindmapBranches: { title: string; detail: string }[];
};

type ConceptDeepDive = {
  concept: string;
  explanation: string;
  analogy: string;
  misconception: string;
  correction: string;
};

type WorkedExample = {
  caseTitle: string;
  givenData: string;
  numberedSteps: string[];
  finalResult: string;
};

type ComprehensionCheckItem = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

type ChapterDetailPayload = {
  title: string;
  conceptDeepDives: ConceptDeepDive[];
  workedExamples: WorkedExample[];
  commonMistakes: string[];
  comprehensionChecks: ComprehensionCheckItem[];
  summaryPoints: string[];
};

type PracticePayload = {
  flashcards: { front: string; back: string }[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
};

const MIN_CHAPTERS = 6;
const MAX_CHAPTERS = 10;
const TARGET_FLASHCARDS = 6;
const TARGET_QUIZ = 5;

const GEMINI_MODEL = "gemini-2.5-flash";

// Skema JSON (responseSchema) Tahap 1: Kerangka Kurikulum (6 - 10 Bab)
const OUTLINE_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    snippet: { type: "STRING" },
    chapters: {
      type: "ARRAY",
      minItems: MIN_CHAPTERS,
      maxItems: MAX_CHAPTERS,
      items: {
        type: "OBJECT",
        properties: {
          chapterIndex: { type: "INTEGER" },
          title: { type: "STRING" },
          learningObjectives: {
            type: "ARRAY",
            minItems: 2,
            maxItems: 3,
            items: { type: "STRING" },
          },
          keyConcepts: {
            type: "ARRAY",
            minItems: 1,
            items: { type: "STRING" },
          },
        },
        required: ["chapterIndex", "title", "learningObjectives", "keyConcepts"],
      },
    },
    mindmapBranches: {
      type: "ARRAY",
      minItems: 3,
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          detail: { type: "STRING" },
        },
        required: ["title", "detail"],
      },
    },
  },
  required: ["title", "snippet", "chapters", "mindmapBranches"],
};

// Skema JSON (responseSchema) Tahap 2: Isi Lengkap Satu Bab Mengajar
const CHAPTER_DETAIL_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    conceptDeepDives: {
      type: "ARRAY",
      minItems: 1,
      items: {
        type: "OBJECT",
        properties: {
          concept: { type: "STRING" },
          explanation: { type: "STRING" },
          analogy: { type: "STRING" },
          misconception: { type: "STRING" },
          correction: { type: "STRING" },
        },
        required: ["concept", "explanation", "analogy", "misconception", "correction"],
      },
    },
    workedExamples: {
      type: "ARRAY",
      minItems: 2,
      items: {
        type: "OBJECT",
        properties: {
          caseTitle: { type: "STRING" },
          givenData: { type: "STRING" },
          numberedSteps: {
            type: "ARRAY",
            minItems: 2,
            items: { type: "STRING" },
          },
          finalResult: { type: "STRING" },
        },
        required: ["caseTitle", "givenData", "numberedSteps", "finalResult"],
      },
    },
    commonMistakes: {
      type: "ARRAY",
      minItems: 3,
      items: { type: "STRING" },
    },
    comprehensionChecks: {
      type: "ARRAY",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          options: {
            type: "ARRAY",
            minItems: 4,
            maxItems: 4,
            items: { type: "STRING" },
          },
          correctIndex: { type: "INTEGER" },
          explanation: { type: "STRING" },
        },
        required: ["question", "options", "correctIndex", "explanation"],
      },
    },
    summaryPoints: {
      type: "ARRAY",
      minItems: 5,
      maxItems: 7,
      items: { type: "STRING" },
    },
  },
  required: [
    "title",
    "conceptDeepDives",
    "workedExamples",
    "commonMistakes",
    "comprehensionChecks",
    "summaryPoints",
  ],
};

// Skema JSON (responseSchema) Tahap 3: Kartu Hafalan & Kuis
const PRACTICE_SCHEMA = {
  type: "OBJECT",
  properties: {
    flashcards: {
      type: "ARRAY",
      minItems: TARGET_FLASHCARDS,
      items: {
        type: "OBJECT",
        properties: {
          front: { type: "STRING" },
          back: { type: "STRING" },
        },
        required: ["front", "back"],
      },
    },
    quiz: {
      type: "ARRAY",
      minItems: TARGET_QUIZ,
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          options: {
            type: "ARRAY",
            minItems: 4,
            maxItems: 4,
            items: { type: "STRING" },
          },
          correctIndex: { type: "INTEGER" },
          explanation: { type: "STRING" },
        },
        required: ["question", "options", "correctIndex", "explanation"],
      },
    },
  },
  required: ["flashcards", "quiz"],
};

// Prompt Tahap 1: Perancang Kurikulum (Kerangka 6 - 10 Bab)
const OUTLINE_SYSTEM_INSTRUCTION = [
  "Kamu perancang kurikulum.",
  "Dari materi di bawah, buat KERANGKA belajar.",
  "Aturan:",
  "- Cakup SEMUA bagian materi, urut dari bagian awal sampai akhir. Jangan melewatkan bagian.",
  `- ${MIN_CHAPTERS} sampai ${MAX_CHAPTERS} bab. Tiap bab punya judul, tujuan belajar (2-3 butir), dan daftar konsep kunci yang harus dibahas.`,
  '- Jangan menambah fakta yang tidak ada di materi. Kalau materi hanya topik singkat, lengkapi dengan pengetahuan umum yang akurat dan tandai "dari luar materi".',
  "- Keluaran HANYA JSON sesuai skema.",
].join("\n");

// Prompt Tahap 3: Penyusunan Kartu Hafalan & Kuis
const PRACTICE_SYSTEM_INSTRUCTION = [
  "Kamu adalah penyusun latihan soal dan kartu hafalan untuk aplikasi belajar Kupas.",
  "Buat kartu hafalan (flashcards) dan soal pilihan ganda (quiz) dalam bahasa Indonesia berdasarkan bab yang telah disusun.",
  "Tiap soal kuis harus memiliki tepat 4 pilihan jawaban dan correctIndex antara 0 sampai 3, serta penjelasan singkat yang akurat.",
].join("\n");

function buildTeacherChapterPrompt(params: {
  title: string;
  keyConcepts: string[];
  sourceSlice: string;
  extraInstruction?: string;
}): string {
  const conceptsText =
    params.keyConcepts.length > 0 ? params.keyConcepts.join(", ") : params.title;
  const lines = [
    "Kamu guru berpengalaman. Tulis isi SATU bab secara lengkap dan mengajar, bukan ringkasan.",
    `Bab: ${params.title} | Konsep kunci yang wajib dibahas: ${conceptsText}`,
    `Materi sumber: """${params.sourceSlice}"""`,
    "",
    "Syarat wajib:",
    "- Tiap konsep: penjelasan 120-200 kata, 1 analogi, 1 anggapan keliru beserta koreksinya.",
    "- Minimal 2 contoh terkerjakan dengan langkah bernomor dan angka nyata.",
    "- Minimal 3 kesalahan umum, 4 soal cek pemahaman (4 opsi, 1 benar, ada penjelasan).",
    "- Rangkuman 5-7 poin dengan kalimat baru, tidak menyalin penjelasan.",
    "- Dilarang mengulang kalimat yang sama di bagian berbeda.",
    '- Dilarang kalimat kosong seperti "bab ini terdiri atas...".',
    "- Bahasa Indonesia yang jelas untuk pelajar.",
    "- Keluaran HANYA JSON sesuai skema.",
  ];
  if (params.extraInstruction) {
    lines.push("", params.extraInstruction);
  }
  return lines.join("\n");
}

function guessMimeType(file: File): string {
  if (file.type) return file.type;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".m4a")) return "audio/mp4";
  if (lower.endsWith(".ogg")) return "audio/ogg";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".csv")) return "text/csv";
  if (lower.endsWith(".md")) return "text/markdown";
  return "text/plain";
}

function isGeminiInlineSupported(mime: string): boolean {
  return (
    mime === "application/pdf" ||
    mime.startsWith("image/") ||
    mime.startsWith("audio/") ||
    mime.startsWith("video/")
  );
}

function isPlainTextFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  return (
    /\.(txt|md|markdown|csv|json|log|html|xml)$/i.test(lower) ||
    file.type.startsWith("text/")
  );
}

async function callGeminiStructured<T>(params: {
  apiKey: string;
  systemInstruction: string;
  userParts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  >;
  responseSchema: Record<string, unknown>;
  maxOutputTokens: number;
  temperature: number;
}): Promise<T | null> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
    params.apiKey,
  )}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: params.systemInstruction }],
      },
      contents: [
        {
          role: "user",
          parts: params.userParts,
        },
      ],
      generationConfig: {
        temperature: params.temperature,
        maxOutputTokens: params.maxOutputTokens,
        responseMimeType: "application/json",
        responseSchema: params.responseSchema,
      },
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!rawText) return null;

  try {
    return JSON.parse(rawText) as T;
  } catch {
    return null;
  }
}

async function buildMediaAndTextParts(params: {
  topic: string;
  content: string;
  source?: string;
  files: File[];
}): Promise<
  Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  >
> {
  const parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  > = [];

  for (const file of params.files.slice(0, 5)) {
    const mime = guessMimeType(file);
    if (isPlainTextFile(file)) {
      const txt = await file.text();
      if (txt.trim()) {
        parts.push({
          text: `Berkas "${file.name}":\n"""\n${txt.slice(0, 14000)}\n"""`,
        });
      }
    } else if (isGeminiInlineSupported(mime) && file.size <= 20 * 1024 * 1024) {
      const buf = Buffer.from(await file.arrayBuffer());
      parts.push({
        inlineData: {
          mimeType: mime,
          data: buf.toString("base64"),
        },
      });
    } else {
      parts.push({
        text: `Berkas terlampir: ${file.name} (${mime})`,
      });
    }
  }

  const materialBlock = params.content.trim() || params.topic;
  parts.push({
    text: [
      `Topik: ${params.topic}`,
      `Jenis sumber: ${params.source || "upload"}`,
      `Materi: """${materialBlock.slice(0, 16000)}"""`,
    ].join("\n"),
  });

  return parts;
}

function getSourceSliceForChapter(
  fullMaterial: string,
  chapterIndex: number,
  totalChapters: number,
): string {
  const clean = fullMaterial.trim();
  if (!clean) return "";
  if (clean.length <= 3500 || totalChapters <= 1) {
    return clean.slice(0, 4500);
  }
  const chunkSize = Math.ceil(clean.length / totalChapters);
  const start = Math.max(0, chapterIndex * chunkSize - 250);
  const end = Math.min(clean.length, (chapterIndex + 1) * chunkSize + 250);
  return clean.slice(start, end);
}

function expandChaptersToMinimum(
  baseChapters: ChapterItem[],
  topic: string,
  minCount: number,
): ChapterItem[] {
  const result = [...baseChapters];
  const fallbackTemplates: Array<{ title: string; summary: string; points: string[] }> = [
    {
      title: `Pengantar & Ruang Lingkup ${topic}`,
      summary: `Memahami cakupan utama dan konteks dasar ${topic} secara runtut (dari luar materi).`,
      points: [
        `Mengenali batasan masalah dan istilah pokok pada ${topic} (dari luar materi).`,
        "Menyusun kerangka berpikir sebelum masuk ke detail teknis.",
      ],
    },
    {
      title: `Komponen & Struktur Utama ${topic}`,
      summary: `Mengidentifikasi elemen-elemen pembentuk utama pada ${topic} (dari luar materi).`,
      points: [
        "Membedakan komponen inti dan komponen pendukung.",
        "Memahami peran masing-masing bagian di dalam sistem.",
      ],
    },
    {
      title: `Mekanisme & Alur Kerja ${topic}`,
      summary: `Menelusuri bagaimana proses atau aturan bekerja langkah demi langkah (dari luar materi).`,
      points: [
        "Mengurutkan tahapan proses dari kondisi awal hingga hasil.",
        "Memperhatikan syarat atau prasyarat pada tiap langkah.",
      ],
    },
    {
      title: `Contoh & Studi Kasus ${topic}`,
      summary: `Menerapkan konsep ${topic} pada contoh konkret agar mudah dipahami (dari luar materi).`,
      points: [
        "Menelaah contoh kasus sederhana sebelum kasus yang lebih kompleks.",
        "Menghubungkan teori dengan hasil atau solusi yang diperoleh.",
      ],
    },
    {
      title: `Kesalahan Umum & Pencegahan pada ${topic}`,
      summary: `Mengenali kekeliruan yang sering terjadi dan cara menghindarinya (dari luar materi).`,
      points: [
        "Menghindari lompatan logika atau pengabaian syarat awal.",
        "Melakukan pengecekan ulang terhadap hasil akhir.",
      ],
    },
    {
      title: `Ringkasan & Strategi Penguasaan ${topic}`,
      summary: `Merangkum poin-poin inti ${topic} untuk persiapan latihan dan evaluasi (dari luar materi).`,
      points: [
        "Menghubungkan kembali antarbab menjadi satu gambaran utuh.",
        "Menguji pemahaman aktif melalui latihan soal dan kartu hafalan.",
      ],
    },
  ];

  let tplIdx = 0;
  while (result.length < minCount) {
    const sourceTpl = fallbackTemplates[tplIdx % fallbackTemplates.length];
    const nextNum = result.length + 1;
    result.push({
      title: `Bab ${nextNum} · ${sourceTpl.title}`,
      summary: sourceTpl.summary,
      points: sourceTpl.points,
    });
    tplIdx += 1;
  }

  return result.slice(0, MAX_CHAPTERS);
}

function isChapterDetailComplete(detail: ChapterDetailPayload | null): boolean {
  if (!detail) return false;
  const hasConcepts =
    Array.isArray(detail.conceptDeepDives) &&
    detail.conceptDeepDives.some(
      (c) =>
        c.concept?.trim() &&
        c.explanation?.trim() &&
        c.analogy?.trim() &&
        c.misconception?.trim() &&
        c.correction?.trim(),
    );
  const hasExamples =
    Array.isArray(detail.workedExamples) && detail.workedExamples.length >= 2;
  const hasMistakes =
    Array.isArray(detail.commonMistakes) && detail.commonMistakes.length >= 3;
  const hasChecks =
    Array.isArray(detail.comprehensionChecks) &&
    detail.comprehensionChecks.length >= 4;
  const hasSummaryPoints =
    Array.isArray(detail.summaryPoints) && detail.summaryPoints.length >= 5;

  return (
    hasConcepts &&
    hasExamples &&
    hasMistakes &&
    hasChecks &&
    hasSummaryPoints
  );
}

function mergeChapterDetailParts(
  primary: ChapterDetailPayload | null,
  supplement: ChapterDetailPayload | null,
): ChapterDetailPayload | null {
  if (!primary && !supplement) return null;
  if (!primary) return supplement;
  if (!supplement) return primary;

  const uniqueByKey = <T,>(arr: T[], getKey: (item: T) => string): T[] => {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const item of arr) {
      const k = getKey(item).trim().toLowerCase();
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out.push(item);
    }
    return out;
  };

  return {
    title: primary.title?.trim() || supplement.title?.trim() || "",
    conceptDeepDives: uniqueByKey(
      [...(primary.conceptDeepDives ?? []), ...(supplement.conceptDeepDives ?? [])],
      (c) => `${c.concept}::${c.explanation}`,
    ),
    workedExamples: uniqueByKey(
      [...(primary.workedExamples ?? []), ...(supplement.workedExamples ?? [])],
      (e) => `${e.caseTitle}::${e.finalResult}`,
    ),
    commonMistakes: uniqueByKey(
      [...(primary.commonMistakes ?? []), ...(supplement.commonMistakes ?? [])],
      (m) => m,
    ),
    comprehensionChecks: uniqueByKey(
      [...(primary.comprehensionChecks ?? []), ...(supplement.comprehensionChecks ?? [])],
      (q) => q.question,
    ).slice(0, 4),
    summaryPoints: uniqueByKey(
      [...(primary.summaryPoints ?? []), ...(supplement.summaryPoints ?? [])],
      (s) => s,
    ).slice(0, 7),
  };
}

function buildChapterItemFromDetail(params: {
  detail: ChapterDetailPayload | null;
  fallbackChapter: ChapterItem;
  chapterIndex: number;
  objectives: string[];
}): ChapterItem {
  const { detail, fallbackChapter, chapterIndex, objectives } = params;
  const rawTitle = (detail?.title || fallbackChapter.title || `Bab ${chapterIndex + 1}`).trim();
  const title = /^bab\s*\d+/i.test(rawTitle)
    ? rawTitle
    : `Bab ${chapterIndex + 1} · ${rawTitle}`;

  const usedSentences = new Set<string>();
  const addUnique = (target: string[], text?: string) => {
    const clean = (text || "").trim();
    if (!clean) return;
    const norm = clean.toLowerCase();
    if (usedSentences.has(norm)) return;
    usedSentences.add(norm);
    target.push(clean);
  };

  const firstConcept = detail?.conceptDeepDives?.[0];
  const summary =
    firstConcept?.explanation?.trim() ||
    detail?.summaryPoints?.[0]?.trim() ||
    fallbackChapter.summary;
  usedSentences.add(summary.trim().toLowerCase());

  const points: string[] = [];

  if (objectives.length > 0) {
    addUnique(points, `Tujuan belajar: ${objectives.join("; ")}`);
  }

  for (const c of detail?.conceptDeepDives ?? []) {
    addUnique(points, `Konsep "${c.concept.trim()}": ${c.explanation.trim()}`);
    addUnique(points, `Analogi (${c.concept.trim()}): ${c.analogy.trim()}`);
    addUnique(
      points,
      `Anggapan keliru & koreksi (${c.concept.trim()}): ${c.misconception.trim()} -> Koreksi: ${c.correction.trim()}`,
    );
  }

  for (const ex of detail?.workedExamples ?? []) {
    const stepsText = (ex.numberedSteps ?? [])
      .map((st, idx) => `${idx + 1}) ${st.trim()}`)
      .join(" ");
    addUnique(
      points,
      `Contoh terkerjakan (${ex.caseTitle.trim()}): Diketahui ${ex.givenData.trim()}. Langkah: ${stepsText} Hasil: ${ex.finalResult.trim()}.`,
    );
  }

  for (const m of detail?.commonMistakes ?? []) {
    addUnique(points, `Kesalahan umum: ${m.trim()}`);
  }

  for (const sp of detail?.summaryPoints ?? []) {
    addUnique(points, `Rangkuman: ${sp.trim()}`);
  }

  if (points.length < 3) {
    for (const fbPt of fallbackChapter.points) {
      addUnique(points, fbPt);
      if (points.length >= 3) break;
    }
  }

  return {
    title,
    summary,
    points,
  };
}

function extractQuizFromChapterDetails(
  details: Array<ChapterDetailPayload | null>,
): QuizItem[] {
  const out: QuizItem[] = [];
  const seen = new Set<string>();

  for (const d of details) {
    for (const chk of d?.comprehensionChecks ?? []) {
      const qText = (chk.question || "").trim();
      const opts = Array.isArray(chk.options)
        ? chk.options.map((o) => String(o).trim()).filter(Boolean)
        : [];
      if (!qText || opts.length < 2) continue;
      const key = qText.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const validIdx =
        typeof chk.correctIndex === "number" &&
        chk.correctIndex >= 0 &&
        chk.correctIndex < opts.length
          ? chk.correctIndex
          : 0;

      out.push({
        question: qText,
        options: opts,
        correctIndex: validIdx,
        explanation: (chk.explanation || "").trim(),
      });
    }
  }

  return out;
}

async function generateMultiStepWithGemini(params: {
  topic: string;
  content: string;
  source?: string;
  files: File[];
  fallbackNote: StudyNote;
}): Promise<StudyNote | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || !apiKey.startsWith("AIza")) return null;

  const baseParts = await buildMediaAndTextParts({
    topic: params.topic,
    content: params.content,
    source: params.source,
    files: params.files,
  });

  // Tahap 1: Buat kerangka belajar (6 - 10 bab)
  const outline = await callGeminiStructured<OutlinePayload>({
    apiKey,
    systemInstruction: OUTLINE_SYSTEM_INSTRUCTION,
    userParts: baseParts,
    responseSchema: OUTLINE_SCHEMA,
    maxOutputTokens: 2800,
    temperature: 0.25,
  });

  const outlineChapters: OutlineChapter[] = Array.isArray(outline?.chapters)
    ? outline.chapters
        .filter((ch) => ch && typeof ch.title === "string" && ch.title.trim().length > 0)
        .slice(0, MAX_CHAPTERS)
        .map((ch, idx) => ({
          chapterIndex: idx + 1,
          title: ch.title.trim(),
          learningObjectives: Array.isArray(ch.learningObjectives)
            ? ch.learningObjectives.map((o) => String(o).trim()).filter(Boolean).slice(0, 3)
            : [],
          keyConcepts: Array.isArray(ch.keyConcepts)
            ? ch.keyConcepts.map((k) => String(k).trim()).filter(Boolean)
            : [],
        }))
    : [];

  // Pemeriksaan Tahap 1: Jika jumlah bab kurang dari MIN_CHAPTERS, minta ulang hanya bab yang kurang
  const missingOutlineCount = Math.max(0, MIN_CHAPTERS - outlineChapters.length);
  if (missingOutlineCount > 0) {
    const existingTitles = outlineChapters.map((c) => `${c.chapterIndex}. ${c.title}`);
    const topUpOutline = await callGeminiStructured<OutlinePayload>({
      apiKey,
      systemInstruction: [
        OUTLINE_SYSTEM_INSTRUCTION,
        `Kerangka saat ini baru memiliki ${outlineChapters.length} bab.`,
        `Tambahkan bab lanjutan berikutnya (mulai bab ke-${outlineChapters.length + 1}) agar total mencakup seluruh bagian materi secara berurutan.`,
      ].join("\n"),
      userParts: [
        ...baseParts,
        {
          text: `Bab yang sudah ada:\n${existingTitles.join("\n") || "(belum ada)"}\nLanjutkan urutan bab berikutnya tanpa mengulang yang sudah ada.`,
        },
      ],
      responseSchema: OUTLINE_SCHEMA,
      maxOutputTokens: 2400,
      temperature: 0.25,
    });

    if (Array.isArray(topUpOutline?.chapters)) {
      for (const extraCh of topUpOutline.chapters) {
        if (outlineChapters.length >= MAX_CHAPTERS) break;
        const cleanChTitle = extraCh?.title?.trim();
        if (!cleanChTitle) continue;
        const isDuplicate = outlineChapters.some(
          (c) => c.title.toLowerCase() === cleanChTitle.toLowerCase(),
        );
        if (!isDuplicate) {
          outlineChapters.push({
            chapterIndex: outlineChapters.length + 1,
            title: cleanChTitle,
            learningObjectives: Array.isArray(extraCh.learningObjectives)
              ? extraCh.learningObjectives.map((o) => String(o).trim()).filter(Boolean).slice(0, 3)
              : [],
            keyConcepts: Array.isArray(extraCh.keyConcepts)
              ? extraCh.keyConcepts.map((k) => String(k).trim()).filter(Boolean)
              : [],
          });
        }
      }
    }
  }

  const expandedFallbackChapters = expandChaptersToMinimum(
    params.fallbackNote.chapters,
    params.topic,
    Math.max(MIN_CHAPTERS, outlineChapters.length),
  );

  while (outlineChapters.length < MIN_CHAPTERS) {
    const idx = outlineChapters.length;
    const fb = expandedFallbackChapters[idx];
    outlineChapters.push({
      chapterIndex: idx + 1,
      title: fb.title,
      learningObjectives: [
        `Memahami inti ${fb.title}`,
        `Menerapkan konsep utama pada contoh`,
      ],
      keyConcepts: fb.points.slice(0, 2),
    });
  }

  const cleanTopic =
    cleanTopicFromInput(outline?.title || params.topic) || params.topic;
  const fullMaterialText = params.content.trim() || cleanTopic;

  // Tahap 2: Isi tiap bab secara terpisah (satu panggilan per bab)
  const chapters: ChapterItem[] = [];
  const chapterDetails: Array<ChapterDetailPayload | null> = [];

  for (let i = 0; i < outlineChapters.length; i++) {
    const chMeta = outlineChapters[i];
    const fbChapter = expandedFallbackChapters[i] ?? expandedFallbackChapters[0];
    const sourceSlice = getSourceSliceForChapter(
      fullMaterialText,
      i,
      outlineChapters.length,
    );

    const chapterPrompt = buildTeacherChapterPrompt({
      title: chMeta.title,
      keyConcepts: chMeta.keyConcepts,
      sourceSlice,
    });

    let detail = await callGeminiStructured<ChapterDetailPayload>({
      apiKey,
      systemInstruction: chapterPrompt,
      userParts: [
        ...baseParts,
        {
          text: `Fokus pada bab: ${chMeta.title} (Bab ${i + 1} dari ${outlineChapters.length}).`,
        },
      ],
      responseSchema: CHAPTER_DETAIL_SCHEMA,
      maxOutputTokens: 5200,
      temperature: 0.35,
    });

    // Pemeriksaan per bab: jika bagian belum lengkap, minta ulang hanya bagian yang kurang
    if (!isChapterDetailComplete(detail)) {
      const missingHints: string[] = [];
      if (!detail?.conceptDeepDives?.length) {
        missingHints.push(
          "lengkapi conceptDeepDives (tiap konsep 120-200 kata, 1 analogi, 1 anggapan keliru + koreksi)",
        );
      }
      if ((detail?.workedExamples?.length ?? 0) < 2) {
        missingHints.push(
          "tambahkan contoh terkerjakan hingga minimal 2 contoh dengan langkah bernomor dan angka nyata",
        );
      }
      if ((detail?.commonMistakes?.length ?? 0) < 3) {
        missingHints.push("tambahkan kesalahan umum hingga minimal 3 butir");
      }
      if ((detail?.comprehensionChecks?.length ?? 0) < 4) {
        missingHints.push(
          "lengkapi soal cek pemahaman hingga 4 soal (4 opsi, 1 benar, ada penjelasan)",
        );
      }
      if ((detail?.summaryPoints?.length ?? 0) < 5) {
        missingHints.push(
          "lengkapi rangkuman 5-7 poin dengan kalimat baru tanpa menyalin penjelasan",
        );
      }

      const retryPrompt = buildTeacherChapterPrompt({
        title: chMeta.title,
        keyConcepts: chMeta.keyConcepts,
        sourceSlice,
        extraInstruction: `Bagian yang masih kurang dan wajib dilengkapi: ${missingHints.join("; ")}.`,
      });

      const supplement = await callGeminiStructured<ChapterDetailPayload>({
        apiKey,
        systemInstruction: retryPrompt,
        userParts: [
          ...baseParts,
          {
            text: `Lengkapi bagian yang masih kurang untuk ${chMeta.title}.`,
          },
        ],
        responseSchema: CHAPTER_DETAIL_SCHEMA,
        maxOutputTokens: 4800,
        temperature: 0.3,
      });

      detail = mergeChapterDetailParts(detail, supplement);
    }

    chapterDetails.push(detail);
    chapters.push(
      buildChapterItemFromDetail({
        detail,
        fallbackChapter: fbChapter,
        chapterIndex: i,
        objectives: chMeta.learningObjectives,
      }),
    );
  }

  // Tahap 3: Buat kartu hafalan & soal kuis berdasarkan seluruh bab
  const chapterDigest = chapters
    .map(
      (c, idx) =>
        `${idx + 1}. ${c.title}: ${c.summary} Poin: ${c.points.slice(0, 2).join(" | ")}`,
    )
    .join("\n");

  const practice = await callGeminiStructured<PracticePayload>({
    apiKey,
    systemInstruction: PRACTICE_SYSTEM_INSTRUCTION,
    userParts: [
      {
        text: [
          `Topik: ${cleanTopic}`,
          `Target minimal: ${TARGET_FLASHCARDS} kartu hafalan dan ${TARGET_QUIZ} soal kuis.`,
          `Ringkasan bab:\n${chapterDigest}`,
        ].join("\n\n"),
      },
    ],
    responseSchema: PRACTICE_SCHEMA,
    maxOutputTokens: 2600,
    temperature: 0.3,
  });

  const flashcards: FlashcardItem[] = (practice?.flashcards ?? [])
    .filter((fc) => fc.front?.trim() && fc.back?.trim())
    .map((fc, idx) => ({
      id: `${params.fallbackNote.id}-fc-${idx + 1}`,
      front: fc.front.trim(),
      back: fc.back.trim(),
    }));

  const quizFromChapterChecks = extractQuizFromChapterDetails(chapterDetails);
  const quizFromPractice: QuizItem[] = (practice?.quiz ?? [])
    .filter(
      (q) =>
        q.question?.trim() &&
        Array.isArray(q.options) &&
        q.options.filter(Boolean).length >= 2,
    )
    .map((q) => {
      const cleanOpts = q.options.map((o) => String(o).trim()).filter(Boolean);
      const validIdx =
        typeof q.correctIndex === "number" &&
        q.correctIndex >= 0 &&
        q.correctIndex < cleanOpts.length
          ? q.correctIndex
          : 0;
      return {
        question: q.question.trim(),
        options: cleanOpts,
        correctIndex: validIdx,
        explanation: (q.explanation || "").trim(),
      };
    });

  const quiz: QuizItem[] = [];
  const seenQuiz = new Set<string>();
  for (const qItem of [...quizFromChapterChecks, ...quizFromPractice]) {
    const key = qItem.question.toLowerCase();
    if (seenQuiz.has(key)) continue;
    seenQuiz.add(key);
    quiz.push(qItem);
  }

  // Tahap 4: Pemeriksaan & permintaan ulang parsial jika kartu atau soal kurang dari target
  const missingFlashcardsCount = Math.max(0, TARGET_FLASHCARDS - flashcards.length);
  const missingQuizCount = Math.max(0, TARGET_QUIZ - quiz.length);

  if (missingFlashcardsCount > 0 || missingQuizCount > 0) {
    const topUpPractice = await callGeminiStructured<PracticePayload>({
      apiKey,
      systemInstruction: [
        PRACTICE_SYSTEM_INSTRUCTION,
        `Tambahkan ${missingFlashcardsCount} kartu hafalan baru dan ${missingQuizCount} soal kuis baru yang belum ada sebelumnya.`,
      ].join("\n"),
      userParts: [
        {
          text: [
            `Topik: ${cleanTopic}`,
            `Ringkasan bab:\n${chapterDigest}`,
            `Flashcard yang sudah ada: ${flashcards.map((f) => f.front).join(" | ") || "-"}`,
            `Soal kuis yang sudah ada: ${quiz.map((q) => q.question).join(" | ") || "-"}`,
          ].join("\n\n"),
        },
      ],
      responseSchema: PRACTICE_SCHEMA,
      maxOutputTokens: 2000,
      temperature: 0.3,
    });

    if (missingFlashcardsCount > 0 && Array.isArray(topUpPractice?.flashcards)) {
      for (const fc of topUpPractice.flashcards) {
        if (flashcards.length >= TARGET_FLASHCARDS) break;
        if (fc.front?.trim() && fc.back?.trim()) {
          flashcards.push({
            id: `${params.fallbackNote.id}-fc-${flashcards.length + 1}`,
            front: fc.front.trim(),
            back: fc.back.trim(),
          });
        }
      }
    }

    if (missingQuizCount > 0 && Array.isArray(topUpPractice?.quiz)) {
      for (const q of topUpPractice.quiz) {
        if (quiz.length >= TARGET_QUIZ) break;
        const cleanOpts = Array.isArray(q.options)
          ? q.options.map((o) => String(o).trim()).filter(Boolean)
          : [];
        if (q.question?.trim() && cleanOpts.length >= 2) {
          const validIdx =
            typeof q.correctIndex === "number" &&
            q.correctIndex >= 0 &&
            q.correctIndex < cleanOpts.length
              ? q.correctIndex
              : 0;
          const qKey = q.question.trim().toLowerCase();
          if (!seenQuiz.has(qKey)) {
            seenQuiz.add(qKey);
            quiz.push({
              question: q.question.trim(),
              options: cleanOpts,
              correctIndex: validIdx,
              explanation: (q.explanation || "").trim(),
            });
          }
        }
      }
    }
  }

  for (const fbFc of params.fallbackNote.flashcards) {
    if (flashcards.length >= TARGET_FLASHCARDS) break;
    if (!flashcards.some((f) => f.front === fbFc.front)) {
      flashcards.push({
        ...fbFc,
        id: `${params.fallbackNote.id}-fc-${flashcards.length + 1}`,
      });
    }
  }

  for (const fbQ of params.fallbackNote.quiz) {
    if (quiz.length >= TARGET_QUIZ) break;
    if (!quiz.some((q) => q.question === fbQ.question)) {
      quiz.push(fbQ);
    }
  }

  const branches =
    outline && Array.isArray(outline.mindmapBranches) && outline.mindmapBranches.length > 0
      ? outline.mindmapBranches
          .filter((b) => b.title?.trim())
          .map((b) => ({
            title: b.title.trim(),
            detail: (b.detail || "").trim(),
          }))
      : chapters.slice(0, 6).map((ch) => ({
          title: ch.title.replace(/^Bab\s*\d+\s*·\s*/i, ""),
          detail: ch.summary,
        }));

  return {
    ...params.fallbackNote,
    title: cleanTopic,
    snippet: (outline?.snippet || params.fallbackNote.snippet).trim(),
    sourceInput:
      params.files.length > 0
        ? params.files.map((f) => f.name).join(", ")
        : params.fallbackNote.sourceInput,
    chapterCount: chapters.length,
    chapters,
    flashcards,
    quiz,
    mindmapRoot: {
      label: cleanTopic.slice(0, 46),
      branches,
    },
  };
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let rawTitle = "";
    let rawContent = "";
    let source = "upload";
    let uploadedFiles: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      rawTitle = String(form.get("title") || "").trim();
      rawContent = String(form.get("content") || "").trim();
      source = String(form.get("source") || "upload").trim();
      uploadedFiles = form
        .getAll("files")
        .filter((item): item is File => item instanceof File && item.size > 0);
    } else {
      const body = (await req.json()) as {
        title?: string;
        content?: string;
        source?: string;
      };
      rawTitle = (body.title || "").trim();
      rawContent = (body.content || "").trim();
      source = (body.source || "upload").trim();
    }

    if (!rawTitle && !rawContent && uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: "Topik atau file materi tidak boleh kosong." },
        { status: 400 },
      );
    }

    const extractedTexts: string[] = [];
    for (const file of uploadedFiles) {
      if (isPlainTextFile(file)) {
        const txt = await file.text();
        if (txt.trim()) extractedTexts.push(txt.slice(0, 12000));
      }
    }

    const combinedContent = [rawContent, ...extractedTexts].filter(Boolean).join("\n\n");
    const firstFileTitle = uploadedFiles[0]
      ? cleanTopicFromInput(uploadedFiles[0].name.replace(/\.[^/.]+$/, ""))
      : "";
    const cleanTitle =
      cleanTopicFromInput(rawTitle || combinedContent) || firstFileTitle || "Materi Belajar";

    const fallbackNote = buildRichSubjectNote({
      source,
      query: combinedContent || firstFileTitle || cleanTitle,
      title: cleanTitle,
    });

    fallbackNote.chapters = expandChaptersToMinimum(
      fallbackNote.chapters,
      cleanTitle,
      MIN_CHAPTERS,
    );
    fallbackNote.chapterCount = fallbackNote.chapters.length;

    if (uploadedFiles.length > 0) {
      fallbackNote.sourceInput = uploadedFiles.map((f) => f.name).join(", ");
    }

    try {
      const multiStepNote = await generateMultiStepWithGemini({
        topic: cleanTitle,
        content: combinedContent,
        source,
        files: uploadedFiles,
        fallbackNote,
      });
      if (multiStepNote) {
        return NextResponse.json({ note: multiStepNote }, { status: 200 });
      }
    } catch {
      // lanjut ke fallback lokal jika API eksternal tidak aktif
    }

    return NextResponse.json({ note: fallbackNote }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Gagal memproses permintaan pembuatan materi." },
      { status: 500 },
    );
  }
}

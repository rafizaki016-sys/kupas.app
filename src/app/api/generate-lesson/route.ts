import { NextResponse } from "next/server";
import {
  buildRichSubjectNote,
  cleanTopicFromInput,
  type StudyNote,
} from "@/lib/kupas-store";

type GenerateBody = {
  title?: string;
  content?: string;
  source?: string;
};

type GeminiGeneratedPayload = {
  title?: string;
  snippet?: string;
  chapters?: {
    title?: string;
    summary?: string;
    points?: string[];
  }[];
  flashcards?: {
    front?: string;
    back?: string;
  }[];
  quiz?: {
    question?: string;
    options?: string[];
    correctIndex?: number;
    explanation?: string;
  }[];
  mindmapBranches?: {
    title?: string;
    detail?: string;
  }[];
};

async function generateWithGemini(params: {
  topic: string;
  content: string;
  source?: string;
}): Promise<StudyNote | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  // API key standar Google AI Studio berawalan "AIza"
  if (!apiKey || !apiKey.startsWith("AIza")) return null;

  const systemPrompt = [
    "Kamu adalah asisten pendidik untuk aplikasi belajar Kupas.",
    "Tugasmu adalah menyusun materi pembelajaran dalam bahasa Indonesia yang RINGKAS, JELAS, dan MUDAH DIPAHAMI berdasarkan topik atau isi berkas/catatan yang diberikan.",
    "Jangan pernah menyalin kalimat perintah pengguna sebagai judul atau poin materi.",
    "Kembalikan HANYA JSON valid dengan struktur:",
    "{",
    '  "title": "Judul topik bersih",',
    '  "snippet": "Ringkasan 1-2 kalimat yang jelas dan mudah dipahami",',
    '  "chapters": [',
    '    { "title": "Bab 1 · ...", "summary": "Penjelasan ringkas dan jelas", "points": ["Poin 1", "Poin 2", "Poin 3"] }',
    "  ],",
    '  "flashcards": [{ "front": "Pertanyaan singkat", "back": "Jawaban jelas" }],',
    '  "quiz": [{ "question": "Soal latihan", "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"], "correctIndex": 0, "explanation": "Penjelasan singkat" }],',
    '  "mindmapBranches": [{ "title": "Cabang konsep", "detail": "Keterangan singkat" }]',
    "}",
  ].join("\n");

  const userPrompt = [
    `Topik: ${params.topic}`,
    `Jenis sumber: ${params.source || "upload"}`,
    `Materi / Catatan / Isi Berkas:\n${params.content.slice(0, 12000)}`,
  ].join("\n\n");

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
    apiKey,
  )}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!rawText) return null;

  const parsed = JSON.parse(rawText) as GeminiGeneratedPayload;
  const fallback = buildRichSubjectNote({
    source: params.source,
    query: params.content,
    title: params.topic,
  });

  const chapters =
    Array.isArray(parsed.chapters) && parsed.chapters.length > 0
      ? parsed.chapters
          .map((ch, idx) => ({
            title: (ch.title || `Bab ${idx + 1} · ${params.topic}`).trim(),
            summary: (ch.summary || "").trim(),
            points: Array.isArray(ch.points)
              ? ch.points.map((p) => String(p).trim()).filter(Boolean)
              : [],
          }))
          .filter((ch) => ch.summary.length > 0)
      : fallback.chapters;

  if (chapters.length === 0) return null;

  const flashcards =
    Array.isArray(parsed.flashcards) && parsed.flashcards.length > 0
      ? parsed.flashcards
          .map((fc, idx) => ({
            id: `${fallback.id}-fc-${idx + 1}`,
            front: (fc.front || "").trim(),
            back: (fc.back || "").trim(),
          }))
          .filter((fc) => fc.front && fc.back)
      : fallback.flashcards;

  const quiz =
    Array.isArray(parsed.quiz) && parsed.quiz.length > 0
      ? parsed.quiz
          .map((q) => ({
            question: (q.question || "").trim(),
            options: Array.isArray(q.options)
              ? q.options.map((o) => String(o).trim()).filter(Boolean)
              : [],
            correctIndex:
              typeof q.correctIndex === "number" && q.correctIndex >= 0
                ? q.correctIndex
                : 0,
            explanation: (q.explanation || "").trim(),
          }))
          .filter((q) => q.question && q.options.length >= 2)
      : fallback.quiz;

  const branches =
    Array.isArray(parsed.mindmapBranches) && parsed.mindmapBranches.length > 0
      ? parsed.mindmapBranches
          .map((b) => ({
            title: (b.title || "").trim(),
            detail: (b.detail || "").trim(),
          }))
          .filter((b) => b.title)
      : fallback.mindmapRoot.branches;

  const cleanTitle = cleanTopicFromInput(parsed.title || params.topic);

  return {
    ...fallback,
    title: cleanTitle || fallback.title,
    snippet: (parsed.snippet || fallback.snippet).trim(),
    chapterCount: chapters.length,
    chapters,
    flashcards: flashcards.length > 0 ? flashcards : fallback.flashcards,
    quiz: quiz.length > 0 ? quiz : fallback.quiz,
    mindmapRoot: {
      label: (cleanTitle || fallback.title).slice(0, 46),
      branches: branches.length > 0 ? branches : fallback.mindmapRoot.branches,
    },
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateBody;
    const rawQuery = (body.content || body.title || "").trim();

    if (!rawQuery) {
      return NextResponse.json(
        { error: "Topik atau materi tidak boleh kosong." },
        { status: 400 },
      );
    }

    const cleanTitle = cleanTopicFromInput(body.title || rawQuery);

    try {
      const aiNote = await generateWithGemini({
        topic: cleanTitle,
        content: rawQuery,
        source: body.source,
      });
      if (aiNote) {
        return NextResponse.json({ note: aiNote }, { status: 200 });
      }
    } catch {
      // lanjut ke penyusun materi terstruktur
    }

    const richNote = buildRichSubjectNote({
      source: body.source,
      query: rawQuery,
      title: cleanTitle,
    });

    return NextResponse.json({ note: richNote }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Gagal memproses permintaan pembuatan materi." },
      { status: 500 },
    );
  }
}

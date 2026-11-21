import { NextResponse } from "next/server";
import {
  buildRichSubjectNote,
  cleanTopicFromInput,
  type StudyNote,
} from "../../../lib/kupas-store";

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

async function generateWithGemini(params: {
  topic: string;
  content: string;
  source?: string;
  files: File[];
}): Promise<StudyNote | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || !apiKey.startsWith("AIza")) return null;

  const systemPrompt = [
    "Kamu adalah asisten pendidik untuk aplikasi belajar Kupas.",
    "Tugasmu adalah membaca seluruh berkas (PDF, dokumen, gambar, audio, video) dan catatan yang diberikan, lalu menyusun materi pembelajaran dalam bahasa Indonesia yang RINGKAS, JELAS, dan MUDAH DIPAHAMI.",
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

  const parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  > = [
    {
      text: [
        `Topik: ${params.topic}`,
        `Sumber: ${params.source || "upload"}`,
        params.content ? `Catatan / Teks:\n${params.content.slice(0, 16000)}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
  ];

  for (const file of params.files.slice(0, 5)) {
    const mime = guessMimeType(file);
    if (isPlainTextFile(file)) {
      const txt = await file.text();
      if (txt.trim()) {
        parts.push({
          text: `Isi berkas "${file.name}":\n${txt.slice(0, 16000)}`,
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
          parts,
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
    query: params.content || params.topic,
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
    sourceInput:
      params.files.length > 0
        ? params.files.map((f) => f.name).join(", ")
        : fallback.sourceInput,
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

    // Ekstrak isi file teks polos bila ada untuk memperkaya konten
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

    try {
      const aiNote = await generateWithGemini({
        topic: cleanTitle,
        content: combinedContent,
        source,
        files: uploadedFiles,
      });
      if (aiNote) {
        return NextResponse.json({ note: aiNote }, { status: 200 });
      }
    } catch {
      // lanjut ke penyusun lokal jika API eksternal tidak aktif
    }

    const richNote = buildRichSubjectNote({
      source,
      query: combinedContent || firstFileTitle || cleanTitle,
      title: cleanTitle,
    });

    if (uploadedFiles.length > 0) {
      richNote.sourceInput = uploadedFiles.map((f) => f.name).join(", ");
    }

    return NextResponse.json({ note: richNote }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Gagal memproses permintaan pembuatan materi." },
      { status: 500 },
    );
  }
}

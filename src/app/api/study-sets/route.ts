import { NextResponse } from "next/server";
import { z } from "zod";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const BodySchema = z.object({
  title: z.string().min(1).max(160),
  source_type: z.enum(["pdf", "docx", "pptx", "xlsx", "txt", "youtube"]),
  content: z.string().min(10).max(40000),
});

const OutputSchema = z.object({
  summary_markdown: z.string(),
  flashcards: z.array(z.object({ id: z.string(), front: z.string(), back: z.string() })),
  quiz: z.array(
    z.object({
      id: z.string(),
      prompt: z.string(),
      options: z.array(z.string()).length(4),
      correct_index: z.number().int().min(0).max(3),
      explanation: z.string(),
    })
  ),
  mindmap: z.object({
    label: z.string(),
    children: z.array(z.object({ label: z.string(), children: z.array(z.object({ label: z.string() })).optional() })),
  }),
});

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Input materi terlalu pendek atau tidak valid." }, { status: 400 });

  const apiKey = req.headers.get("x-gemini-api-key") || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API Key Gemini belum diatur. Buka Pengaturan dan tempel API Key gratis dari Google AI Studio." },
      { status: 400 }
    );
  }

  const google = createGoogleGenerativeAI({ apiKey });
  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: OutputSchema,
    prompt: `Buat kit belajar bahasa Indonesia dari materi berikut (judul: ${parsed.data.title}):
1. summary_markdown yang rapi.
2. 5 flashcard.
3. 4 soal kuis pilihan ganda lengkap pembahasan.
4. mindmap 2-3 cabang utama.

Materi:
${parsed.data.content}`,
  });

  return NextResponse.json({
    id: `set-${Date.now()}`,
    title: parsed.data.title,
    source_type: parsed.data.source_type,
    status: "ready",
    created_at: new Date().toISOString(),
    ...object,
  });
}

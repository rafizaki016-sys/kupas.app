import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const Schema = z.object({
  content: z.string().min(1).max(2000),
  context: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Pertanyaan tidak valid." }, { status: 400 });
    }

    const apiKey =
      req.headers.get("x-gemini-api-key") || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Tempel API Key gratis Google AI Studio di menu Pengaturan terlebih dahulu." },
        { status: 400 }
      );
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system: `Kamu adalah Tutor AI Kupas yang ramah, jelas, dan setara dalam bahasa Indonesia. Jawab berdasarkan materi berikut:\n${parsed.data.context ?? ""}`,
      prompt: parsed.data.content,
    });

    return NextResponse.json({ reply: text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error tidak diketahui dari server AI.";
    return NextResponse.json({ error: `Gagal memproses AI: ${msg}` }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const Schema = z.object({
  image_base64: z.string().min(20),
  mime_type: z.string().default("image/jpeg"),
});

export async function POST(req: Request) {
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Gambar tidak valid." }, { status: 400 });

  const apiKey = req.headers.get("x-gemini-api-key") || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Tempel API Key gratis Google AI Studio di menu Pengaturan terlebih dahulu." }, { status: 400 });
  }

  const google = createGoogleGenerativeAI({ apiKey });
  const { text } = await generateText({
    model: google("gemini-3.8-flash"),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Baca soal pada gambar ini lalu jelaskan cara mengerjakannya langkah demi langkah dalam bahasa Indonesia yang mudah dipahami pelajar." },
          { type: "image", image: Buffer.from(parsed.data.image_base64, "base64"), mimeType: parsed.data.mime_type },
        ],
      },
    ],
  });

  return NextResponse.json({ solution: text });
}

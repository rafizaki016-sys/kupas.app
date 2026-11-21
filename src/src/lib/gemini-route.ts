import { NextResponse } from "next/server";

// Alat bersama untuk route yang memanggil Gemini (study, tutor, snap-solve).

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

// Pembatas laju sederhana (per instans). Di serverless memori tidak dibagi antar instans,
// jadi ini hanya pengaman awal. Untuk batas yang kuat pakai Upstash Redis / Vercel KV
// atau login + kuota per pengguna.
const hits = new Map<string, number[]>();
export function isLimited(key: string, max = 8, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return false;
}

// Ubah galat Gemini jadi respons yang ramah. Log tanpa kunci.
export function geminiFailure(tag: string, e: unknown) {
  const err = e as { statusCode?: number; name?: string; message?: string };
  console.error(`[${tag}]`, err?.name, err?.statusCode, String(err?.message ?? "").slice(0, 300));

  if (err?.name === "TimeoutError" || err?.name === "AbortError") {
    return NextResponse.json({ error: "Pemrosesan terlalu lama. Coba lagi dengan materi yang lebih pendek." }, { status: 504 });
  }
  switch (err?.statusCode) {
    case 400:
    case 401:
    case 403:
      return NextResponse.json({ error: "API Key ditolak Google. Periksa kuncimu di Pengaturan." }, { status: 401 });
    case 404:
      return NextResponse.json({ error: "Model AI tidak ditemukan. Hubungi pengelola aplikasi." }, { status: 502 });
    case 429:
      return NextResponse.json({ error: "Kuota Gemini habis. Tunggu beberapa saat atau pakai API Key milikmu sendiri." }, { status: 429 });
    default:
      return NextResponse.json({ error: "Layanan AI sedang bermasalah. Coba lagi sebentar." }, { status: 502 });
  }
}

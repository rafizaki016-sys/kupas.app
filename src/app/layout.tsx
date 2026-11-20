import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kupas — Teman Belajar AI Gratis",
  description:
    "Ubah PDF, slide, YouTube, dan foto soal jadi rangkuman, flashcard offline, kuis, dan Tutor AI 100% gratis tanpa paywall.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

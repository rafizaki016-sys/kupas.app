import Link from "next/link";
import { Sparkles, WifiOff, Mic, KeyRound, Camera } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
          <span className="flex items-center gap-2 font-bold text-lg text-accent">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            Kupas
          </span>
          <Link
            href="/dashboard"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent hover:bg-accent-hover"
          >
            Mulai Belajar Gratis
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-16">
        <section className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Kupas tuntas materi kuliah dan PR — 100% gratis tanpa paywall.
          </h1>
          <p className="mt-4 text-base text-muted sm:text-lg">
            Ubah PDF, slide, YouTube, atau foto soal jadi rangkuman rapi, flashcard offline, kuis latihan, dan Tutor AI 24 jam di HP Android-mu.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-on-accent hover:bg-accent-hover"
            >
              Buka Aplikasi Web
            </Link>
            <Link
              href="/settings"
              className="rounded-md border border-border-input bg-surface px-6 py-3 text-sm font-semibold text-text hover:bg-surface-subtle"
            >
              Panduan Mode Gratis (BYOK)
            </Link>
          </div>
        </section>

        <section className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: KeyRound, title: "Rp 0 Tanpa Langganan", desc: "Semua fitur terbuka. Gunakan kuota komunitas atau API Key gratis Google AI Studio milikmu." },
            { icon: WifiOff, title: "Flashcard Offline", desc: "Rangkuman dan kartu hafalan tersimpan lokal di perangkat agar hemat kuota data." },
            { icon: Mic, title: "Tutor Suara Gratis", desc: "Tanya dan dengarkan penjelasan lewat mikrofon bawaan perangkat tanpa biaya tambahan." },
            { icon: Camera, title: "Foto & Bahas Soal", desc: "Ambil foto soal PR untuk melihat penjelasan langkah demi langkah yang mudah dipahami." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-lg border border-border bg-surface p-5 shadow-sm">
              <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="mt-3 font-semibold text-text">{title}</h2>
              <p className="mt-1 text-sm text-muted">{desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border bg-surface py-6 text-center text-xs text-muted">
        <div className="flex justify-center gap-4">
          <Link href="/privacy" className="underline">Kebijakan Privasi</Link>
          <Link href="/terms" className="underline">Syarat &amp; Ketentuan</Link>
        </div>
      </footer>
    </div>
  );
}

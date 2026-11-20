"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Headphones,
  Image as ImageIcon,
  Layers,
  Link2,
  MessageSquare,
  Video,
} from "lucide-react";

const FORMATS = [
  { label: "PDF · OFFICE", icon: FileText },
  { label: "AUDIO", icon: Headphones },
  { label: "VIDEO", icon: Video },
  { label: "YOUTUBE", icon: Link2 },
  { label: "GAMBAR", icon: ImageIcon },
];

const FEATURES = [
  {
    num: "01",
    title: "Catatan per bab",
    desc: "Ratusan halaman dipadatkan jadi bab pendek dengan poin penting yang mudah dibaca ulang.",
    icon: FileText,
  },
  {
    num: "02",
    title: "Kartu hafalan berjarak",
    desc: "Istilah diulang pada waktu yang pas, sehingga yang dihafal tidak menguap sehari setelah ujian.",
    icon: Layers,
  },
  {
    num: "03",
    title: "Kuis latihan",
    desc: "Soal pilihan ganda dari materimu sendiri, dengan penjelasan di setiap jawaban.",
    icon: CheckCircle2,
  },
  {
    num: "04",
    title: "Tanya materi",
    desc: "Ada bagian yang belum paham? Tanyakan, dan jawabannya merujuk ke catatanmu.",
    icon: MessageSquare,
  },
];

const STEPS = [
  {
    step: "LANGKAH 1",
    title: "Masukkan materi",
    desc: "Unggah berkas, rekam, atau tempel teks.",
  },
  {
    step: "LANGKAH 2",
    title: "Tunggu sebentar",
    desc: "Materi disusun jadi bab, kartu, dan soal.",
  },
  {
    step: "LANGKAH 3",
    title: "Belajar tiap hari",
    desc: "Selesaikan bab, kumpulkan XP, jaga streak.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#14181F] antialiased selection:bg-[#DBEAFE] selection:text-[#1D4ED8]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-[#E7E1D6] bg-[#FAF7F2]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1060px] items-center justify-between px-5">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 text-base font-bold tracking-tight">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#14181F] text-white">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>Kupas</span>
            </Link>

            <nav aria-label="Menu utama" className="hidden items-center gap-6 text-xs font-medium text-[#5C6470] md:flex">
              <a href="#fitur" className="transition hover:text-[#14181F]">Fitur</a>
              <a href="#cara-kerja" className="transition hover:text-[#14181F]">Cara kerja</a>
              <a href="#gratis" className="transition hover:text-[#14181F]">Gratis</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/settings" className="text-xs font-semibold text-[#5C6470] transition hover:text-[#14181F]">
              Pengaturan
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-md bg-[#1D4ED8] px-4 text-xs font-semibold text-white transition hover:bg-[#1E40AF]"
            >
              Mulai gratis
            </Link>
          </div>
        </div>
      </header>
            <main>
        {/* Hero Section */}
        <section className="mx-auto grid max-w-[1060px] items-center gap-12 px-5 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-20">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1D4ED8]">
              GRATIS · UNTUK SEMUA PELAJAR
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight text-[#14181F] sm:text-5xl md:text-[54px]">
              Belajar jadi lebih ringan, bukan lebih mahal.
            </h1>
            <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-[#5C6470]">
              Masukkan materimu. Dapatkan catatan per bab, kartu hafalan, dan kuis latihan yang
              siap dipakai malam ini juga.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#1D4ED8] px-5 text-sm font-semibold text-white transition hover:bg-[#1E40AF]"
              >
                <span>Mulai belajar gratis</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#contoh-catatan"
                className="inline-flex h-11 items-center justify-center rounded-lg border-2 border-[#14181F] bg-white px-5 text-sm font-semibold text-[#14181F] shadow-[3px_3px_0px_#14181F] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#14181F]"
              >
                Lihat contoh catatan
              </a>
            </div>

            <p className="mt-3.5 text-xs text-[#6B7280]">
              Tanpa kartu kredit. Offline. Bisa dihapus kapan saja.
            </p>
          </div>

          {/* Kartu Contoh Catatan di Kanan */}
          <div id="contoh-catatan" className="mx-auto w-full max-w-[440px]">
            <div className="rounded-2xl border-2 border-[#14181F] bg-white p-6 shadow-[5px_5px_0px_#14181F]">
              <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                <span>CATATAN · BAB 2</span>
                <span>2 / 5 SELESAI</span>
              </div>

              <h2 className="mt-4 text-lg font-bold text-[#14181F]">
                Tempat terjadinya fotosintesis
              </h2>

              <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-[#374151]">
                <p>
                  Proses ini berlangsung di dalam{" "}
                  <mark className="rounded bg-[#FEF08A] px-1.5 py-0.5 font-semibold text-[#14181F]">
                    kloroplas
                  </mark>
                  , organel sel tumbuhan yang mengandung{" "}
                  <mark className="rounded bg-[#DBEAFE] px-1.5 py-0.5 font-semibold text-[#1D4ED8]">
                    klorofil
                  </mark>
                  .
                </p>
                <p>
                  Klorofil menangkap cahaya matahari, lalu energinya dipakai membuat glukosa.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#EFECE6] pt-4 text-[11px] font-semibold">
                <span className="rounded-full border border-[#D6D1C7] bg-[#FAF7F2] px-3 py-1 text-[#374151]">
                  4 kartu
                </span>
                <span className="rounded-full border border-[#D6D1C7] bg-[#FAF7F2] px-3 py-1 text-[#374151]">
                  5 soal kuis
                </span>
                <span className="rounded-full bg-[#FEF3C7] px-3 py-1 font-bold text-[#92400E]">
                  +3 XP
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Format Bar */}
        <section aria-label="Format materi yang didukung" className="border-y border-[#E7E1D6] bg-[#F5F1E8]">
          <div className="mx-auto flex max-w-[1060px] flex-wrap items-center justify-between gap-4 px-5 py-4">
            {FORMATS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#4B5563]"
                >
                  <Icon className="h-3.5 w-3.5 text-[#1D4ED8]" aria-hidden="true" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Fitur Section */}
        <section id="fitur" className="mx-auto max-w-[1060px] px-5 py-16 md:py-24">
          <div className="grid gap-12 md:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1D4ED8]">
                FITUR
              </p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#14181F] sm:text-4xl">
                Empat alat dari satu materi.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#5C6470]">
                Semuanya dibuat dari bahan yang kamu unggah, jadi yang kamu latih sama dengan yang
                diujikan.
              </p>
            </div>

            <div className="divide-y divide-[#E7E1D6] border-y border-[#E7E1D6]">
              {FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.num}
                    className="grid grid-cols-[36px_1fr_28px] items-start gap-4 py-6"
                  >
                    <span className="pt-0.5 text-xs font-bold text-[#1D4ED8]">{feat.num}</span>
                    <div>
                      <h3 className="text-base font-bold text-[#14181F]">{feat.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#5C6470]">{feat.desc}</p>
                    </div>
                    <Icon className="mt-0.5 h-4 w-4 text-[#6B7280]" aria-hidden="true" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3 Langkah Section */}
        <section id="cara-kerja" className="mx-auto max-w-[1060px] px-5 pb-16 md:pb-24">
          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.step}
                className="rounded-xl border-2 border-[#14181F] bg-white p-6 shadow-[4px_4px_0px_#14181F]"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1D4ED8]">
                  {s.step}
                </p>
                <h3 className="mt-2.5 text-base font-bold text-[#14181F]">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#5C6470]">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Banner Dark CTA */}
        <section id="gratis" className="mx-auto max-w-[1060px] px-5 pb-20">
          <div className="grid items-center gap-8 rounded-2xl bg-[#161B22] p-8 text-white md:grid-cols-[1.2fr_0.8fr] md:p-12">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#93C5FD]">
                KENAPA GRATIS?
              </p>
              <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">
                Alat belajar yang bagus tidak seharusnya mahal.
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-[#CBD5E1]">
                Kupas dibuat supaya lebih banyak pelajar terbantu, bukan hanya yang sanggup
                berlangganan.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-5 text-xs font-bold text-[#14181F] transition hover:bg-[#F3F4F6]"
              >
                <span>Mulai gratis</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E7E1D6] py-8 text-xs text-[#6B7280]">
        <div className="mx-auto flex max-w-[1060px] flex-wrap items-center justify-between gap-4 px-5">
          <span>© 2026 Kupas</span>
          <nav aria-label="Tautan bawah" className="flex items-center gap-5">
            <Link href="/terms" className="hover:text-[#14181F]">Syarat</Link>
            <Link href="/privacy" className="hover:text-[#14181F]">Privasi</Link>
            <Link href="/settings" className="hover:text-[#14181F]">Pengaturan</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

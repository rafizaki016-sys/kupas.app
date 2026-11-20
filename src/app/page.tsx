"use client";

import { useState } from "react";
import Link from "next/link";

const OPTIONS = [
  { label: "Mitokondria", ok: false },
  { label: "Kloroplas", ok: true },
  { label: "Ribosom", ok: false },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"p1" | "p2" | "p3">("p1");
  const [flipped, setFlipped] = useState(false);
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);

  const showXp = pickedIdx !== null && OPTIONS[pickedIdx]?.ok;

  return (
    <div id="top" className="kupas-landing">
      <style>{`
        .kupas-landing {
          --bg: #f6faf8; --surface: #ffffff; --ink: #10211f; --muted: #53655f;
          --line: #dbe7e2; --brand: #0f766e; --brand-ink: #ffffff; --soft: #d9f2ec;
          --warm: #f2b134; --warm-soft: #fdf1d3;
          --head: "Bricolage Grotesque", "Segoe UI", system-ui, sans-serif;
          --body: "Figtree", "Segoe UI", system-ui, sans-serif;
          min-height: 100vh; background: var(--bg); color: var(--ink);
          font: 400 17px/1.6 var(--body); -webkit-font-smoothing: antialiased;
          padding-top: env(safe-area-inset-top, 0px);
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        @media (prefers-color-scheme: dark) {
          .kupas-landing {
            --bg: #0b1513; --surface: #112320; --ink: #e8f3f0; --muted: #9ab3ac;
            --line: #21403a; --brand: #2dd4bf; --brand-ink: #06201c; --soft: #12332e;
            --warm: #f2b134; --warm-soft: #33280f;
          }
        }
        .kupas-landing *, .kupas-landing *::before, .kupas-landing *::after { box-sizing: border-box; }
        .kupas-landing a { color: inherit; }
        .kupas-landing :focus-visible { outline: 3px solid var(--warm); outline-offset: 3px; border-radius: 6px; }
        .kl-wrap { max-width: 1080px; margin: 0 auto; padding: 0 20px; }
        .kupas-landing h1, .kupas-landing h2, .kupas-landing h3 { font-family: var(--head); line-height: 1.1; margin: 0; letter-spacing: -0.02em; }
        .kupas-landing h1 { font-size: clamp(2.3rem, 7.5vw, 4rem); font-weight: 800; }
        .kupas-landing h2 { font-size: clamp(1.7rem, 5vw, 2.5rem); font-weight: 800; }
        .kupas-landing h3 { font-size: 1.2rem; font-weight: 600; }
        .kupas-landing p { margin: 0; }
        .kl-lead { color: var(--muted); font-size: 1.1rem; max-width: 56ch; }
        .kl-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 24px; border-radius: 14px; font-weight: 600; text-decoration: none; border: 2px solid transparent; transition: transform 0.15s; cursor: pointer; }
        .kl-btn:active { transform: scale(0.97); }
        .kl-btn-main { background: var(--brand); color: var(--brand-ink); }
        .kl-btn-ghost { border-color: var(--line); background: var(--surface); }
        .kl-header { position: sticky; top: 0; z-index: 20; background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
        .kl-nav { display: flex; align-items: center; justify-content: space-between; height: 64px; gap: 12px; }
        .kl-logo { display: flex; align-items: center; gap: 8px; font: 800 1.4rem var(--head); color: var(--brand); text-decoration: none; }
        .kl-nav-links { display: none; gap: 24px; font-weight: 500; }
        .kl-nav-links a { text-decoration: none; color: var(--muted); }
        .kl-nav .kl-btn { min-height: 42px; padding: 0 16px; font-size: 0.95rem; }
        @media (min-width: 760px) { .kl-nav-links { display: flex; } }
        .kl-hero { padding: 56px 0 40px; display: grid; gap: 40px; }
        .kl-hero-copy { display: grid; gap: 20px; justify-items: start; }
        .kl-hero-cta { display: flex; flex-wrap: wrap; gap: 12px; }
        .kl-note { font-size: 0.92rem; color: var(--muted); }
        @media (min-width: 900px) { .kl-hero { grid-template-columns: 1.1fr 0.9fr; align-items: center; padding: 80px 0 56px; } }
        .kl-demo { background: var(--surface); border: 1px solid var(--line); border-radius: 22px; padding: 14px; box-shadow: 0 18px 40px -22px rgba(15, 118, 110, 0.45); }
        .kl-tabs { display: flex; gap: 6px; margin-bottom: 12px; overflow-x: auto; }
        .kl-tab { flex: none; border: 0; background: transparent; color: var(--muted); font: 600 0.9rem var(--body); padding: 8px 14px; border-radius: 999px; cursor: pointer; min-height: 40px; }
        .kl-tab[aria-selected="true"] { background: var(--soft); color: var(--brand); }
        .kl-panel { min-height: 230px; border-radius: 14px; background: var(--bg); padding: 18px; display: grid; gap: 10px; align-content: start; }
        .kl-panel h3 { font-size: 1.05rem; }
        .kl-panel ul { margin: 0; padding-left: 18px; color: var(--muted); }
        .kl-card { perspective: 800px; border: 0; background: none; padding: 0; width: 100%; cursor: pointer; text-align: left; font: inherit; color: inherit; }
        .kl-card-in { display: flex; align-items: center; min-height: 150px; padding: 20px; border-radius: 14px; background: var(--brand); color: var(--brand-ink); font: 600 1.15rem/1.4 var(--head); transition: transform 0.35s, background-color 0.25s; }
        .kl-card[aria-pressed="true"] .kl-card-in { background: var(--warm); color: #33260a; }
        .kl-hint { font-size: 0.85rem; color: var(--muted); }
        .kl-opt { display: block; width: 100%; text-align: left; padding: 10px 14px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); color: var(--ink); font: 500 1rem var(--body); cursor: pointer; min-height: 44px; }
        .kl-opt.ok { border-color: var(--brand); background: var(--soft); }
        .kl-opt.no { border-color: #d9534f; }
        .kl-xp { justify-self: start; background: var(--warm-soft); color: var(--ink); font-weight: 600; font-size: 0.9rem; padding: 4px 12px; border-radius: 999px; }
        .kupas-landing section { padding: 56px 0; }
        .kl-sec-head { display: grid; gap: 12px; margin-bottom: 32px; }
        .kl-formats { display: flex; flex-wrap: wrap; gap: 10px; }
        .kl-chip { padding: 10px 18px; border-radius: 999px; background: var(--surface); border: 1px solid var(--line); font-weight: 600; }
        .kl-feat { display: grid; gap: 16px; }
        .kl-feat article { padding: 24px; border-radius: 20px; background: var(--surface); border: 1px solid var(--line); display: grid; gap: 8px; }
        .kl-feat article:nth-child(1) { background: var(--soft); border-color: transparent; }
        .kl-feat p { color: var(--muted); }
        @media (min-width: 760px) {
          .kl-feat { grid-template-columns: repeat(6, 1fr); }
          .kl-feat article { grid-column: span 3; }
          .kl-feat article:nth-child(1) { grid-column: span 4; }
          .kl-feat article:nth-child(2) { grid-column: span 2; }
          .kl-feat article:nth-child(3) { grid-column: span 2; }
          .kl-feat article:nth-child(4) { grid-column: span 4; }
        }
        .kl-scroll { overflow-x: auto; border: 1px solid var(--line); border-radius: 18px; background: var(--surface); }
        .kupas-landing table { width: 100%; border-collapse: collapse; min-width: 520px; }
        .kupas-landing th, .kupas-landing td { padding: 14px 18px; text-align: left; border-bottom: 1px solid var(--line); }
        .kupas-landing tr:last-child td { border-bottom: 0; }
        .kupas-landing th { font-family: var(--head); font-size: 1rem; }
        .kupas-landing td:last-child, .kupas-landing th:last-child { background: var(--soft); }
        .kl-steps { display: grid; gap: 14px; padding: 0; margin: 0; list-style: none; counter-reset: s; }
        .kl-steps li { counter-increment: s; display: grid; grid-template-columns: 44px 1fr; gap: 14px; align-items: start; padding: 18px; border-radius: 18px; background: var(--surface); border: 1px solid var(--line); }
        .kl-steps li::before { content: counter(s); display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: var(--brand); color: var(--brand-ink); font: 800 1.1rem var(--head); }
        .kl-steps p { color: var(--muted); }
        .kupas-landing details { border-bottom: 1px solid var(--line); padding: 4px 0; }
        .kupas-landing summary { cursor: pointer; min-height: 52px; display: flex; align-items: center; font-weight: 600; list-style: none; }
        .kupas-landing summary::-webkit-details-marker { display: none; }
        .kupas-landing summary::after { content: "+"; margin-left: auto; font-size: 1.4rem; color: var(--brand); }
        .kupas-landing details[open] summary::after { content: "−"; }
        .kupas-landing details p { color: var(--muted); padding: 0 0 16px; max-width: 62ch; }
        .kl-cta { background: var(--brand); color: var(--brand-ink); border-radius: 28px; padding: 40px 24px; display: grid; gap: 16px; justify-items: start; }
        .kl-cta .kl-btn { background: var(--brand-ink); color: var(--brand); }
        @media (prefers-color-scheme: dark) { .kl-cta .kl-btn { background: #06201c; color: #2dd4bf; } }
        .kl-footer { padding: 32px 0 48px; color: var(--muted); font-size: 0.95rem; }
        .kl-foot { display: flex; flex-wrap: wrap; gap: 16px 24px; justify-content: space-between; }
        .kl-foot nav { display: flex; gap: 20px; }
        @media (prefers-reduced-motion: reduce) { .kupas-landing * { transition: none !important; } }
      `}</style>

      <header className="kl-header">
        <div className="kl-wrap kl-nav">
          <a className="kl-logo" href="#top" aria-label="Kupas, ke atas">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
              <path d="M19 17v4M17 19h4" />
            </svg>
            Kupas
          </a>
          <nav className="kl-nav-links" aria-label="Menu utama">
            <a href="#fitur">Fitur</a>
            <a href="#bandingkan">Bandingkan</a>
            <a href="#byok">Cara pakai</a>
            <a href="#faq">FAQ</a>
          </nav>
          <Link className="kl-btn kl-btn-main" href="/dashboard">Mulai belajar</Link>
        </div>
      </header>

      <main>
        <div className="kl-wrap kl-hero">
          <div className="kl-hero-copy">
            <h1>Kupas tuntas materi kuliah dan PR, gratis.</h1>
            <p className="kl-lead">Unggah PDF, slide, atau link YouTube, atau foto soal PR. Kupas mengubahnya jadi rangkuman, flashcard, kuis, dan penjelasan dari Tutor AI.</p>
            <div className="kl-hero-cta">
              <Link className="kl-btn kl-btn-main" href="/dashboard">Mulai belajar gratis</Link>
              <a className="kl-btn kl-btn-ghost" href="#byok">Cara pakai API Key gratis</a>
            </div>
            <p className="kl-note">Tanpa kartu kredit. Tanpa langganan. Semua fitur terbuka.</p>
          </div>

          <div className="kl-demo" aria-label="Contoh tampilan Kupas">
            <div className="kl-tabs" role="tablist" aria-label="Contoh hasil belajar">
              <button type="button" className="kl-tab" role="tab" aria-selected={activeTab === "p1"} aria-controls="p1" id="t1" onClick={() => setActiveTab("p1")}>Rangkuman</button>
              <button type="button" className="kl-tab" role="tab" aria-selected={activeTab === "p2"} aria-controls="p2" id="t2" onClick={() => setActiveTab("p2")}>Flashcard</button>
              <button type="button" className="kl-tab" role="tab" aria-selected={activeTab === "p3"} aria-controls="p3" id="t3" onClick={() => setActiveTab("p3")}>Kuis</button>
            </div>
            <div className="kl-panel" role="tabpanel" id="p1" aria-labelledby="t1" hidden={activeTab !== "p1"}>
              <h3>Fotosintesis</h3>
              <ul>
                <li>Bahan baku: karbon dioksida dan air.</li>
                <li>Hasil: glukosa dan oksigen.</li>
                <li>Syarat: cahaya matahari dan klorofil.</li>
              </ul>
              <p className="kl-hint">Dari PDF 184 halaman jadi 6 poin inti.</p>
            </div>
            <div className="kl-panel" role="tabpanel" id="p2" aria-labelledby="t2" hidden={activeTab !== "p2"}>
              <button type="button" className="kl-card" id="flip" aria-pressed={flipped} onClick={() => setFlipped((f) => !f)}>
                <span className="kl-card-in" id="face">{flipped ? "Karbon dioksida, air, dan cahaya." : "Apa bahan baku fotosintesis?"}</span>
              </button>
              <p className="kl-hint">Ketuk kartu untuk melihat jawaban. Tersimpan di perangkatmu, bisa dibuka offline.</p>
            </div>
            <div className="kl-panel" role="tabpanel" id="p3" aria-labelledby="t3" hidden={activeTab !== "p3"}>
              <h3>Di bagian sel mana fotosintesis terjadi?</h3>
              {OPTIONS.map((opt, idx) => (
                <button key={opt.label} type="button" className={pickedIdx === idx ? (opt.ok ? "kl-opt ok" : "kl-opt no") : "kl-opt"} onClick={() => setPickedIdx(idx)}>
                  {opt.label}
                </button>
              ))}
              <p className="kl-xp" id="xp" hidden={!showXp}>Benar! +3 XP</p>
            </div>
          </div>
        </div>

        <section id="format"><div className="kl-wrap">
          <div className="kl-sec-head"><h2>Unggah apa saja, Kupas yang mengurus sisanya</h2></div>
          <div className="kl-formats">
            <span className="kl-chip">PDF</span><span className="kl-chip">Slide PPTX</span><span className="kl-chip">Dokumen Word</span><span className="kl-chip">Link YouTube</span><span className="kl-chip">Foto soal</span>
          </div>
        </div></section>
                <section id="fitur"><div className="kl-wrap">
          <div className="kl-sec-head"><h2>Semua yang kamu butuhkan untuk belajar</h2><p className="kl-lead">Satu tempat untuk merangkum, menghafal, latihan soal, dan bertanya.</p></div>
          <div className="kl-feat">
            <article><h3>Rangkuman otomatis</h3><p>Materi panjang jadi poin-poin inti yang rapi, siap dibaca sebelum ujian.</p></article>
            <article><h3>Flashcard offline</h3><p>Kartu hafalan tersimpan di HP, hemat kuota.</p></article>
            <article><h3>Tutor AI</h3><p>Tanya apa saja tentang materimu, lewat teks atau suara.</p></article>
            <article><h3>Foto dan bahas soal</h3><p>Foto soal PR, lalu baca penjelasan langkah demi langkah sampai paham.</p></article>
          </div>
        </div></section>

        <section id="bandingkan"><div className="kl-wrap">
          <div className="kl-sec-head"><h2>Kupas dibanding aplikasi belajar berbayar</h2></div>
          <div className="kl-scroll"><table>
            <thead><tr><th>Fitur</th><th>Umumnya berbayar</th><th>Kupas</th></tr></thead>
            <tbody>
              <tr><td>Harga</td><td>Langganan bulanan</td><td>Rp 0</td></tr>
              <tr><td>Rangkuman, flashcard, kuis</td><td>Sebagian terkunci</td><td>Semua terbuka</td></tr>
              <tr><td>Tutor AI dengan suara</td><td>Paket premium</td><td>Gratis</td></tr>
              <tr><td>Flashcard bisa offline</td><td>Jarang</td><td>Ya</td></tr>
            </tbody>
          </table></div>
        </div></section>

        <section id="byok"><div className="kl-wrap">
          <div className="kl-sec-head"><h2>Cara memakai API Key gratismu sendiri</h2><p className="kl-lead">Kuota komunitas bisa habis saat ramai. Pakai API Key milikmu supaya tetap lancar, dan tetap gratis.</p></div>
          <ol className="kl-steps">
            <li><div><h3>Buat API Key</h3><p>Buka Google AI Studio dan masuk dengan akun Google, lalu buat API Key baru.</p></div></li>
            <li><div><h3>Tempel di Pengaturan</h3><p>Buka Pengaturan di Kupas dan tempel API Key-mu. Kunci disimpan di perangkatmu.</p></div></li>
            <li><div><h3>Mulai belajar</h3><p>Unggah materi pertamamu dan tunggu rangkumannya jadi.</p></div></li>
          </ol>
          <p style={{ marginTop: 20 }}><Link className="kl-btn kl-btn-ghost" href="/settings">Buka Pengaturan</Link></p>
        </div></section>

        <section id="faq"><div className="kl-wrap">
          <div className="kl-sec-head"><h2>Pertanyaan umum</h2></div>
          <details><summary>Benarkah gratis selamanya?</summary><p>Semua fitur Kupas terbuka tanpa langganan. Kamu bisa memakai kuota komunitas atau API Key Google AI Studio milikmu.</p></details>
          <details><summary>Format file apa yang didukung?</summary><p>PDF, slide, dokumen, link YouTube, dan foto soal.</p></details>
          <details><summary>Apakah ini curang?</summary><p>Tidak. Kupas menjelaskan konsep supaya kamu bisa mengerjakan sendiri, seperti tutor yang sabar.</p></details>
          <details><summary>Di mana datamu disimpan?</summary><p>Rangkuman dan flashcard tersimpan lokal di perangkatmu. Baca detailnya di Kebijakan Privasi.</p></details>
        </div></section>

        <div className="kl-wrap" style={{ paddingBottom: 56 }}>
          <div className="kl-cta"><h2>Siap kupas materi pertamamu?</h2><p>Unggah satu file dan lihat hasilnya dalam hitungan menit.</p><Link className="kl-btn" href="/dashboard">Mulai belajar gratis</Link></div>
        </div>
      </main>

      <footer className="kl-footer"><div className="kl-wrap kl-foot"><span>© 2026 Kupas. Dibuat untuk pelajar Indonesia.</span><nav aria-label="Legal"><Link href="/privacy">Kebijakan Privasi</Link><Link href="/terms">Syarat &amp; Ketentuan</Link></nav></div></footer>
    </div>
  );
}
                                                                                                                                                         }

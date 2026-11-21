import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardData } from "./data";
import { CreatePrompt } from "./_components/CreatePrompt";
import { NotesBrowser } from "./_components/NotesBrowser";
import { IconArrow, IconCards, IconNote } from "./_components/icons";
import styles from "./dashboard.module.css";

export const metadata: Metadata = { title: "Beranda" };

// Halaman ini hanya berisi isi utama. Bilah atas (menu, streak, XP, avatar)
// sebaiknya ada di layout (app)/layout.tsx agar dipakai semua halaman.
export default async function DashboardPage() {
  // Di produksi: pastikan pengguna sudah masuk sebelum membaca data (redirect ke /masuk bila belum).
  const data = await getDashboardData();

  return (
    <div className={styles.root}>
      <main className={styles.main}>
        <h1 className={styles.h1}>Apa yang ingin kamu pelajari?</h1>

        <CreatePrompt />

        <section className={styles.today} aria-label="Hari ini">
          {data.dueCards > 0 ? (
            <Link href="/cards" className={styles.todayCard}>
              <span className={styles.todayIcon}><IconCards /></span>
              <span>
                <b>{data.dueCards} kartu perlu diulang</b>
                <small>Sekitar {Math.max(1, Math.round(data.dueCards / 2))} menit</small>
              </span>
              <span className={styles.go}>Mulai <IconArrow /></span>
            </Link>
          ) : (
            <div className={styles.todayCard}>
              <span className={styles.todayIcon}><IconCards /></span>
              <span>
                <b>Tidak ada kartu yang perlu diulang</b>
                <small>Kerja bagus. Kartu berikutnya muncul sesuai jadwal.</small>
              </span>
            </div>
          )}

          {data.continueNote && (
            <Link href={`/lessons/${data.continueNote.id}`} className={styles.todayCard}>
              <span className={styles.todayIcon}><IconNote /></span>
              <span>
                <b>Lanjutkan: {data.continueNote.title}</b>
                <small>Bab {data.continueNote.chapter} dari {data.continueNote.chapterCount}</small>
              </span>
              <span className={styles.go}>Buka <IconArrow /></span>
            </Link>
          )}
        </section>

        <NotesBrowser notes={data.notes} />
      </main>
    </div>
  );
        }

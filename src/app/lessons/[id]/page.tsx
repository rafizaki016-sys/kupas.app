import Link from "next/link";

type NoteKind = "text" | "pdf" | "slide" | "audio" | "youtube";

type Note = {
  id: string;
  title: string;
  kind: NoteKind;
  snippet: string;
  createdAt: string;
  chapterCount: number;
  chaptersDone: number;
};

const NOTES: Note[] = [
  {
    id: "n1",
    title: "Hukum Newton dan penerapannya",
    kind: "text",
    snippet:
      "Hukum pertama menyatakan benda tetap diam atau bergerak lurus beraturan selama resultan gaya nol. Kita mulai dari contoh sehari-hari, lalu ke rumusnya.",
    createdAt: "2026-11-20T03:00:00Z",
    chapterCount: 4,
    chaptersDone: 2,
  },
  {
    id: "n2",
    title: "Sel dan organel",
    kind: "pdf",
    snippet:
      "Sel adalah satuan terkecil makhluk hidup. Organel seperti mitokondria dan kloroplas punya tugas masing-masing di dalam sel.",
    createdAt: "2026-11-19T03:00:00Z",
    chapterCount: 5,
    chaptersDone: 5,
  },
  {
    id: "n3",
    title: "Rekaman kelas sejarah",
    kind: "audio",
    snippet:
      "Latar belakang pergerakan nasional, tokoh-tokohnya, dan urutan peristiwa penting dari awal abad ke-20.",
    createdAt: "2026-11-17T03:00:00Z",
    chapterCount: 6,
    chaptersDone: 1,
  },
];

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = NOTES.find((n) => n.id === id) ?? NOTES[0];

  return (
    <main className="mx-auto max-w-[780px] space-y-5 px-4 py-10">
      <Link href="/dashboard" className="inline-block text-xs font-bold text-[#1e4fd8] hover:underline">
        ← Kembali ke Beranda
      </Link>

      <article className="rounded-xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-6 shadow-[5px_5px_0_#1d2433]">
        <span className="inline-block rounded-full border-[1.5px] border-[#1d2433] bg-[#dfe8ff] px-3 py-0.5 text-xs font-bold uppercase text-[#1d2433]">
          {note.kind}
        </span>

        <h1 className="mt-3 text-2xl font-extrabold text-[#1d2433]">{note.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#5d6578]">{note.snippet}</p>

        <div className="mt-5 border-t border-[#e6dece] pt-4 text-xs font-semibold text-[#1d2433]">
          Kemajuan belajar: {note.chaptersDone} dari {note.chapterCount} bab selesai
        </div>
      </article>
    </main>
  );
}

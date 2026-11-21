import Link from "next/link";
import { getDashboardData } from "../../(app)/dashboard/data";

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getDashboardData();
  const note = data.notes.find((n) => n.id === id) ?? data.notes[0];

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

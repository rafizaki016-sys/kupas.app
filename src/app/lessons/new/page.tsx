import Link from "next/link";

export default async function NewLessonPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; q?: string }>;
}) {
  const params = await searchParams;
  const sourceLabel =
    params.source === "record"
      ? "Rekam Audio"
      : params.source === "upload"
        ? "Unggah Berkas"
        : params.source === "link"
          ? "Tautan / YouTube"
          : "Materi Teks";

  return (
    <main className="mx-auto max-w-[780px] space-y-5 px-4 py-10">
      <Link href="/dashboard" className="inline-block text-xs font-bold text-[#1e4fd8] hover:underline">
        ← Kembali ke Beranda
      </Link>

      <div className="rounded-xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-6 shadow-[5px_5px_0_#1d2433]">
        <p className="text-xs font-bold uppercase tracking-wider text-[#1e4fd8]">
          {sourceLabel}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-[#1d2433]">
          Siap disusun menjadi catatan per bab, kartu, dan kuis
        </h1>

        {params.q ? (
          <div className="mt-4 rounded-lg border-[1.5px] border-[#1d2433] bg-[#faf6ee] p-4">
            <p className="text-xs font-bold uppercase text-[#5d6578]">Topik / Materi Dimasukkan:</p>
            <p className="mt-1.5 text-sm font-medium text-[#1d2433]">{params.q}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#5d6578]">
            Pilih atau masukkan materimu untuk mulai membuat catatan belajar.
          </p>
        )}
      </div>
    </main>
  );
}

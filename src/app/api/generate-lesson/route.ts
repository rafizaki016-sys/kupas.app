import { NextResponse } from "next/server";
import { generateStudyNoteFromInput, type StudyNote } from "@/lib/kupas-store";

type GenerateBody = {
  title?: string;
  content?: string;
  source?: string;
};

function buildTopicSpecificNote(rawQuery: string, source?: string): StudyNote {
  const base = generateStudyNoteFromInput({ source, query: rawQuery });
  const qLower = rawQuery.toLowerCase();

  // Contoh bank konten terstruktur untuk topik yang sering diuji
  if (qLower.includes("logika") || qLower.includes("proposisi") || qLower.includes("implikasi")) {
    return {
      ...base,
      title: rawQuery.trim() || "Logika Matematika",
      snippet:
        "Mempelajari pernyataan (proposisi), operator logika (¬, ∧, ∨, →, ↔), tabel kebenaran, dan ekuivalensi logika.",
      chapterCount: 3,
      chapters: [
        {
          title: "Bab 1 · Proposisi & Operator Dasar",
          summary:
            "Proposisi adalah kalimat deklaratif yang bernilai benar (B/T) atau salah (S/F), tetapi tidak keduanya sekaligus.",
          points: [
            "Negasi (¬p): membalikkan nilai kebenaran proposisi p.",
            "Konjungsi (p ∧ q): bernilai benar hanya jika p dan q keduanya benar.",
            "Disjungsi inklusif (p ∨ q): bernilai salah hanya jika p dan q keduanya salah.",
          ],
        },
        {
          title: "Bab 2 · Implikasi (→) & Biimplikasi (↔)",
          summary:
            "Implikasi 'jika p maka q' hanya bernilai salah ketika anteseden p benar dan konsekuen q salah.",
          points: [
            "p → q ekuivalen secara logika dengan ¬p ∨ q.",
            "Kontraposisi dari p → q adalah ¬q → ¬p (memiliki nilai kebenaran sama).",
            "Biimplikasi (p ↔ q) bernilai benar jika p dan q memiliki nilai kebenaran yang sama.",
          ],
        },
        {
          title: "Bab 3 · Tabel Kebenaran & Inferensi",
          summary:
            "Menyusun baris kombinasi nilai kebenaran untuk mengecek tautologi, kontradiksi, dan validitas argumen.",
          points: [
            "Untuk n proposisi dasar, tabel kebenaran memiliki 2^n baris.",
            "Modus Ponens: dari (p → q) dan p dapat disimpulkan q.",
          ],
        },
      ],
      flashcards: [
        {
          id: `${base.id}-fc-1`,
          front: "Kapan implikasi p → q bernilai salah?",
          back: "Hanya ketika p bernilai benar (T/B) dan q bernilai salah (F/S).",
        },
        {
          id: `${base.id}-fc-2`,
          front: "Apa bentuk kontraposisi dari 'Jika hujan (p), maka jalan basah (q)'?",
          back: "Jika jalan tidak basah (¬q), maka tidak hujan (¬p).",
        },
        {
          id: `${base.id}-fc-3`,
          front: "Berapa banyak baris tabel kebenaran untuk 3 proposisi berbeda?",
          back: "2³ = 8 baris kombinasi nilai kebenaran.",
        },
      ],
      quiz: [
        {
          question: "Jika p bernilai Benar dan q bernilai Salah, berapakah nilai kebenaran dari (p → q)?",
          options: ["Benar", "Salah", "Tautologi", "Tidak dapat ditentukan"],
          correctIndex: 1,
          explanation: "Implikasi p → q bernilai Salah tepat ketika p Benar dan q Salah.",
        },
        {
          question: "Pernyataan yang ekuivalen dengan ¬(p ∧ q) menurut Hukum De Morgan adalah...",
          options: ["¬p ∧ ¬q", "¬p ∨ ¬q", "p ∨ ¬q", "¬p → q"],
          correctIndex: 1,
          explanation: "Hukum De Morgan menyatakan negasi konjungsi sama dengan disjungsi dari negasi masing-masing.",
        },
      ],
      mindmapRoot: {
        label: "Logika Matematika",
        branches: [
          { title: "Operator Dasar", detail: "Negasi (¬), Konjungsi (∧), Disjungsi (∨)" },
          { title: "Bersyarat", detail: "Implikasi (→), Kontraposisi, Biimplikasi (↔)" },
          { title: "Evaluasi", detail: "Tabel kebenaran (2^n baris) & penarikan kesimpulan" },
        ],
      },
    };
  }

  return base;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateBody;
    const rawQuery = (body.content || body.title || "").trim();

    if (!rawQuery) {
      return NextResponse.json(
        { error: "Topik atau materi tidak boleh kosong." },
        { status: 400 },
      );
    }

    const note = buildTopicSpecificNote(rawQuery, body.source);
    return NextResponse.json({ note }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Gagal memproses permintaan pembuatan materi." },
      { status: 500 },
    );
  }
}

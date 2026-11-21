import { NextResponse } from "next/server";
import {
  cleanTopicFromInput,
  generateStudyNoteFromInput,
  type StudyNote,
} from "@/lib/kupas-store";

type GenerateBody = {
  title?: string;
  content?: string;
  source?: string;
};

function buildTopicSpecificNote(rawQuery: string, source?: string): StudyNote {
  const cleanTitle = cleanTopicFromInput(rawQuery);
  const base = generateStudyNoteFromInput({ source, query: cleanTitle || rawQuery });
  const qLower = `${rawQuery} ${cleanTitle}`.toLowerCase();

  if (
    qLower.includes("matematika diskrit") ||
    qLower.includes("himpunan") ||
    qLower.includes("graf") ||
    qLower.includes("kombinatorika")
  ) {
    const displayTitle = cleanTitle || "Matematika Diskrit";
    return {
      ...base,
      title: displayTitle,
      snippet:
        "Mempelajari struktur objek diskrit (terpisah/terhitung) seperti himpunan, logika, relasi & fungsi, kombinatorika, serta teori graf.",
      chapterCount: 3,
      chapters: [
        {
          title: "Bab 1 · Himpunan, Relasi & Fungsi",
          summary:
            "Matematika diskrit berfokus pada objek yang terpisah/terbilang, dimulai dari operasi himpunan serta pemetaan relasi dan fungsi.",
          points: [
            "Operasi dasar himpunan: gabungan (A ∪ B), irisan (A ∩ B), selisih (A − B), dan komplemen.",
            "Fungsi memetakan setiap elemen domain tepat ke satu elemen kodomain.",
          ],
        },
        {
          title: "Bab 2 · Kombinatorika & Peluang Diskrit",
          summary:
            "Menghitung banyaknya kemungkinan susunan atau pemilihan tanpa mencacah satu per satu.",
          points: [
            "Aturan perkalian dipakai untuk kejadian berurutan/bersamaan; aturan penjumlahan untuk pilihan saling lepas.",
            "Permutasi memperhatikan urutan (P(n,r)), sedangkan kombinasi tidak memperhatikan urutan (C(n,r)).",
          ],
        },
        {
          title: "Bab 3 · Teori Graf & Penerapan Komputasi",
          summary:
            "Graf terdiri atas simpul (vertex) dan sisi (edge) untuk memodelkan jaringan, rute, dan ketergantungan.",
          points: [
            "Jumlah derajat seluruh simpul pada graf sama dengan dua kali jumlah sisinya.",
            "Diterapkan pada jaringan komputer, penjadwalan, dan pencarian jalur terpendek.",
          ],
        },
      ],
      flashcards: [
        {
          id: `${base.id}-fc-1`,
          front: "Apa perbedaan utama permutasi dan kombinasi?",
          back: "Permutasi memperhatikan urutan elemen, sedangkan kombinasi tidak memperhatikan urutan.",
        },
        {
          id: `${base.id}-fc-2`,
          front: "Apa komponen utama pembentuk sebuah graf?",
          back: "Himpunan simpul (vertices/nodes) dan himpunan sisi (edges) yang menghubungkan simpul-simpul tersebut.",
        },
      ],
      quiz: [
        {
          question: "Jika sebuah graf memiliki 5 sisi, berapakah jumlah derajat seluruh simpulnya?",
          options: ["5", "10", "15", "20"],
          correctIndex: 1,
          explanation: "Menurut teorema jabat tangan (handshaking lemma), jumlah derajat semua simpul = 2 × jumlah sisi = 2 × 5 = 10.",
        },
        {
          question: "Kapan aturan perkalian digunakan dalam kombinatorika?",
          options: [
            "Saat memilih satu jalur dari beberapa pilihan saling lepas",
            "Saat menyusun keputusan berurutan yang masing-masing punya pilihan sendiri",
            "Saat mengurangkan dua himpunan",
            "Saat menghitung komplemen himpunan",
          ],
          correctIndex: 1,
          explanation: "Aturan perkalian mengalikan banyaknya cara pada setiap tahap yang dilakukan bersama/berurutan.",
        },
      ],
      mindmapRoot: {
        label: displayTitle.slice(0, 46),
        branches: [
          { title: "Himpunan & Relasi", detail: "Operasi himpunan & pemetaan fungsi" },
          { title: "Kombinatorika", detail: "Aturan hitung, permutasi & kombinasi" },
          { title: "Teori Graf", detail: "Simpul, sisi & pemodelan jaringan" },
        ],
      },
    };
  }

  if (qLower.includes("logika") || qLower.includes("proposisi") || qLower.includes("implikasi")) {
    const displayTitle = cleanTitle || "Logika Matematika";
    return {
      ...base,
      title: displayTitle,
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
      ],
      quiz: [
        {
          question: "Jika p bernilai Benar dan q bernilai Salah, berapakah nilai kebenaran dari (p → q)?",
          options: ["Benar", "Salah", "Tautologi", "Tidak dapat ditentukan"],
          correctIndex: 1,
          explanation: "Implikasi p → q bernilai Salah tepat ketika p Benar dan q Salah.",
        },
      ],
      mindmapRoot: {
        label: displayTitle.slice(0, 46),
        branches: [
          { title: "Operator Dasar", detail: "Negasi (¬), Konjungsi (∧), Disjungsi (∨)" },
          { title: "Bersyarat", detail: "Implikasi (→), Kontraposisi, Biimplikasi (↔)" },
          { title: "Evaluasi", detail: "Tabel kebenaran (2^n baris) & penarikan kesimpulan" },
        ],
      },
    };
  }

  return {
    ...base,
    title: cleanTitle || base.title,
  };
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

export type NoteKind = "text" | "pdf" | "slide" | "audio" | "youtube";

export type FlashcardItem = {
  id: string;
  front: string;
  back: string;
};

export type QuizItem = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type ChapterItem = {
  title: string;
  summary: string;
  points: string[];
};

export type StudyNote = {
  id: string;
  title: string;
  kind: NoteKind;
  sourceInput: string;
  snippet: string;
  createdAt: string;
  chapterCount: number;
  chaptersDone: number;
  chapters: ChapterItem[];
  flashcards: FlashcardItem[];
  quiz: QuizItem[];
  mindmapRoot: {
    label: string;
    branches: { title: string; detail: string }[];
  };
};

const STORAGE_KEY = "kupas_study_notes_v1";

export const DEFAULT_NOTES: StudyNote[] = [
  {
    id: "n1",
    title: "Hukum Newton dan penerapannya",
    kind: "text",
    sourceInput: "Hukum Newton 1, 2, dan 3 beserta contoh penerapan sehari-hari.",
    snippet:
      "Hukum pertama menyatakan benda tetap diam atau bergerak lurus beraturan selama resultan gaya nol. Kita mulai dari contoh sehari-hari, lalu ke rumusnya.",
    createdAt: "2026-11-20T03:00:00Z",
    chapterCount: 4,
    chaptersDone: 2,
    chapters: [
      {
        title: "Bab 1 · Hukum I Newton (Kelembaman)",
        summary:
          "Benda cenderung mempertahankan keadaannya selama resultan gaya yang bekerja sama dengan nol.",
        points: [
          "Jika diam akan tetap diam (∑F = 0, v = 0).",
          "Jika bergerak lurus beraturan akan terus bergerak dengan kecepatan tetap (∑F = 0, a = 0).",
          "Contoh: penumpang terdorong ke depan saat bus direm mendadak.",
        ],
      },
      {
        title: "Bab 2 · Hukum II Newton (F = m · a)",
        summary:
          "Percepatan yang dihasilkan resultan gaya berbanding lurus dengan gaya dan berbanding terbalik dengan massa benda.",
        points: [
          "Rumus utama: a = ∑F / m atau ∑F = m · a.",
          "Semakin besar massa dengan gaya sama, percepatan makin kecil.",
          "Contoh: mendorong troli kosong lebih cepat daripada troli penuh.",
        ],
      },
      {
        title: "Bab 3 · Hukum III Newton (Aksi-Reaksi)",
        summary:
          "Setiap aksi selalu menimbulkan reaksi yang sama besar dan berlawanan arah pada dua benda berbeda.",
        points: [
          "Gaya aksi dan reaksi bekerja pada dua benda yang berbeda (tidak saling meniadakan).",
          "Contoh: kaki mendorong lantai ke belakang, lantai mendorong tubuh ke depan.",
        ],
      },
      {
        title: "Bab 4 · Ringkasan Penerapan Soal",
        summary:
          "Langkah praktis membaca soal dinamika partikel dan bidang datar.",
        points: [
          "Gambar diagram gaya (berat w, normal N, gesek f, tarik T).",
          "Pisahkan sumbu X dan sumbu Y sebelum menghitung.",
        ],
      },
    ],
    flashcards: [
      {
        id: "fc-n1-1",
        front: "Apa bunyi Hukum I Newton?",
        back: "Benda akan tetap diam atau bergerak lurus beraturan jika resultan gaya yang bekerja padanya sama dengan nol (∑F = 0).",
      },
      {
        id: "fc-n1-2",
        front: "Bagaimana hubungan gaya (F), massa (m), dan percepatan (a) pada Hukum II Newton?",
        back: "a = ∑F / m — percepatan sebanding dengan resultan gaya dan berbanding terbalik dengan massa.",
      },
      {
        id: "fc-n1-3",
        front: "Mengapa gaya aksi dan reaksi tidak saling meniadakan?",
        back: "Karena gaya aksi dan reaksi bekerja pada dua benda yang berbeda, bukan pada satu benda yang sama.",
      },
    ],
    quiz: [
      {
        question: "Sebuah balok bermassa 2 kg ditarik dengan gaya resultan 10 N. Berapa percepatannya?",
        options: ["2 m/s²", "5 m/s²", "12 m/s²", "20 m/s²"],
        correctIndex: 1,
        explanation: "Berdasarkan Hukum II Newton, a = F / m = 10 / 2 = 5 m/s².",
      },
      {
        question: "Peristiwa yang paling tepat menggambarkan Hukum III Newton adalah...",
        options: [
          "Buku diam di atas meja",
          "Roket meluncur ke atas akibat gas buang terdorong ke bawah",
          "Mobil melaju konstan di jalan tol",
          "Koin jatuh saat kertas ditarik cepat",
        ],
        correctIndex: 1,
        explanation: "Gas terdorong ke bawah (aksi) dan roket terdorong ke atas (reaksi).",
      },
    ],
    mindmapRoot: {
      label: "Hukum Newton",
      branches: [
        { title: "Hukum I (∑F = 0)", detail: "Kelembaman / inersia benda" },
        { title: "Hukum II (F = m·a)", detail: "Hubungan gaya, massa, dan percepatan" },
        { title: "Hukum III (Aksi-Reaksi)", detail: "Pasangan gaya pada dua benda berbeda" },
      ],
    },
  },
];

export function cleanTopicFromInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const strippedCommand = trimmed
    .replace(
      /^(buatkan|buat|tolong buatkan|tolong|bantu buatkan|bantu|pelajari|jelaskan|ringkaskan)\s+(pelajaran|materi|catatan|ringkasan|pembelajaran)?\s*(dari|tentang|mengenai|soal)?\s*/i,
      "",
    )
    .replace(/^(materi|pelajaran|catatan|ringkasan)\s+(tentang|mengenai)?\s*/i, "")
    .trim();

  const target = strippedCommand || trimmed;

  try {
    if (/^https?:\/\//i.test(target)) {
      const url = new URL(target);
      const segments = url.pathname.split("/").filter(Boolean);
      const candidate = [...segments].reverse().find(
        (seg) =>
          !/^(id|en|artikel|article|post|blog|news|read|watch|v|shorts)$/i.test(seg) &&
          seg.replace(/[-_]+/g, " ").trim().length >= 4,
      );

      if (candidate) {
        const cleaned = decodeURIComponent(candidate)
          .replace(/\.[a-z0-9]+$/i, "")
          .replace(/[-_]+/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        if (cleaned.length >= 4) {
          return cleaned
            .split(" ")
            .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
            .join(" ");
        }
      }

      return url.hostname.replace(/^www\./, "");
    }
  } catch {
    // abaikan jika bukan URL valid
  }

  const normalized = target.replace(/\s+/g, " ");
  return normalized.length > 0
    ? normalized[0].toUpperCase() + normalized.slice(1)
    : "";
}

export function readStoredNotes(): StudyNote[] {
  if (typeof window === "undefined") return DEFAULT_NOTES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_NOTES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_NOTES;
    return parsed as StudyNote[];
  } catch {
    return DEFAULT_NOTES;
  }
}

export function writeStoredNotes(notes: StudyNote[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // abaikan jika storage penuh
  }
}

export function upsertStudyNote(note: StudyNote): StudyNote[] {
  const current = readStoredNotes();
  const filtered = current.filter((n) => n.id !== note.id);
  const next = [note, ...filtered];
  writeStoredNotes(next);
  return next;
}

function dedupeStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const clean = item.trim();
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
  }
  return out;
}

export function buildRichSubjectNote(params: {
  source?: string;
  query?: string;
  title?: string;
}): StudyNote {
  const kind: NoteKind =
    params.source === "record"
      ? "audio"
      : params.source === "upload"
        ? "pdf"
        : params.source === "link"
          ? "youtube"
          : "text";

  const rawQuery = (params.query || "").trim();
  const cleanTitle = cleanTopicFromInput(params.title || rawQuery) || "Materi Belajar";
  const lower = `${cleanTitle} ${rawQuery}`.toLowerCase();
  const id = `note-${Date.now()}`;

  // 1. Jika pengguna menempel isi teks/catatan panjang, urai dari kalimat aslinya
  const sentences = dedupeStrings(
    rawQuery
      .replace(/\r\n/g, "\n")
      .split(/(?<=[.!?])\s+|\n+/)
      .filter((s) => s.trim().length >= 16),
  );

  if (sentences.length >= 3 && rawQuery.length > 140) {
    const perGroup = Math.max(2, Math.ceil(sentences.length / 3));
    const groups = [
      sentences.slice(0, perGroup),
      sentences.slice(perGroup, perGroup * 2),
      sentences.slice(perGroup * 2),
    ].filter((g) => g.length > 0);

    const chapterLabels = [
      "Konsep & Dasar",
      "Uraian & Mekanisme",
      "Penerapan & Kesimpulan",
    ];

    const chapters: ChapterItem[] = groups.map((grp, idx) => {
      const summary = grp[0];
      const details = grp.slice(1);
      return {
        title: `Bab ${idx + 1} · ${chapterLabels[idx] || "Pembahasan Lanjutan"}`,
        summary,
        points:
          details.length > 0
            ? details
            : [`Poin kunci: ${summary}`],
      };
    });

    return {
      id,
      title: cleanTitle.slice(0, 72),
      kind,
      sourceInput: rawQuery,
      snippet: sentences.slice(0, 2).join(" ").slice(0, 180),
      createdAt: new Date().toISOString(),
      chapterCount: chapters.length,
      chaptersDone: 0,
      chapters,
      flashcards: chapters.map((ch, idx) => ({
        id: `${id}-fc-${idx + 1}`,
        front: `Jelaskan poin inti pada ${ch.title}`,
        back: `${ch.summary}${ch.points[0] && ch.points[0] !== `Poin kunci: ${ch.summary}` ? ` — ${ch.points[0]}` : ""}`,
      })),
      quiz: [
        {
          question: `Pernyataan manakah yang sesuai dengan ${chapters[0]?.title || cleanTitle}?`,
          options: [
            chapters[0]?.summary || sentences[0],
            "Mengabaikan seluruh informasi utama pada teks sumber",
            "Menyimpulkan hasil akhir tanpa memperhatikan data awal",
            "Menghapus seluruh pengecualian yang dijelaskan materi",
          ],
          correctIndex: 0,
          explanation: chapters[0]?.points[0] || chapters[0]?.summary || "",
        },
        ...(chapters[1]
          ? [
              {
                question: `Apa pembahasan utama pada ${chapters[1].title}?`,
                options: [
                  chapters[1].summary,
                  "Daftar pustaka tanpa penjelasan konsep",
                  "Pengulangan definisi tanpa mekanisme",
                  "Catatan yang bertentangan dengan bab pertama",
                ],
                correctIndex: 0,
                explanation: chapters[1].points[0] || chapters[1].summary,
              },
            ]
          : []),
      ],
      mindmapRoot: {
        label: cleanTitle.slice(0, 46),
        branches: chapters.map((ch) => ({
          title: ch.title.replace(/^Bab\s*\d+\s*·\s*/i, ""),
          detail: ch.summary,
        })),
      },
    };
  }

  // 2. Topik Kalkulus
  if (
    lower.includes("kalkulus") ||
    lower.includes("limit") ||
    lower.includes("turunan") ||
    lower.includes("integral")
  ) {
    return {
      id,
      title:
        cleanTitle.toLowerCase() === "kalkulus"
          ? "Kalkulus: Limit, Turunan & Integral"
          : cleanTitle,
      kind,
      sourceInput: rawQuery || cleanTitle,
      snippet:
        "Kalkulus mempelajari perubahan dan akumulasi: Limit mendekati nilai tertentu, Turunan mengukur laju perubahan sesaat, dan Integral menghitung luas/akumulasi.",
      createdAt: new Date().toISOString(),
      chapterCount: 3,
      chaptersDone: 0,
      chapters: [
        {
          title: "Bab 1 · Konsep Limit Fungsi",
          summary:
            "Limit melihat nilai yang didekati f(x) saat x mendekati titik c, meskipun di titik c fungsinya mungkin tak terdefinisi.",
          points: [
            "Notasi: lim(x → c) f(x) = L artinya nilai f(x) mendekati L saat x mendekati c dari kiri maupun kanan.",
            "Jika limit kiri ≠ limit kanan, maka nilai limit di titik tersebut tidak ada.",
            "Contoh: lim(x → 2) (x² − 4)/(x − 2) = lim(x → 2) (x + 2) = 4.",
          ],
        },
        {
          title: "Bab 2 · Turunan (Laju Perubahan Sesaat)",
          summary:
            "Turunan f'(x) menyatakan kemiringan garis singgung kurva atau kecepatan perubahan suatu besaran pada saat tertentu.",
          points: [
            "Aturan pangkat: jika f(x) = xⁿ, maka f'(x) = n · xⁿ⁻¹.",
            "Contoh: untuk f(x) = x³, turunannya f'(x) = 3x²; pada x = 2 nilainya 3(2)² = 12.",
            "Dalam gerak lurus, turunan posisi s(t) adalah kecepatan v(t), dan turunan kecepatan adalah percepatan a(t).",
          ],
        },
        {
          title: "Bab 3 · Integral (Akumulasi & Luas Daerah)",
          summary:
            "Integral merupakan kebalikan dari turunan (anti-turunan) dan dipakai untuk menghitung luas daerah di bawah kurva serta total akumulasi.",
          points: [
            "Integral tak tentu aturan pangkat: ∫ xⁿ dx = [1/(n + 1)] xⁿ⁺¹ + C (untuk n ≠ −1).",
            "Contoh: ∫ 6x² dx = 2x³ + C.",
            "Integral tentu ∫[a,b] f(x) dx menghitung nilai akumulasi dari batas bawah a hingga batas atas b.",
          ],
        },
      ],
      flashcards: [
        {
          id: `${id}-fc-1`,
          front: "Apa makna limit lim(x → c) f(x) = L?",
          back: "Nilai f(x) mendekati L ketika x semakin dekat ke c (dari kiri dan kanan), tanpa harus bergantung pada nilai f(c).",
        },
        {
          id: `${id}-fc-2`,
          front: "Berapa turunan dari f(x) = 4x³ + 2x?",
          back: "f'(x) = 12x² + 2 (menggunakan aturan pangkat n · xⁿ⁻¹ pada tiap suku).",
        },
        {
          id: `${id}-fc-3`,
          front: "Apa hubungan turunan dan integral secara sederhana?",
          back: "Integral (anti-turunan) adalah proses kebalikan dari turunan dan digunakan untuk menghitung akumulasi atau luas daerah.",
        },
      ],
      quiz: [
        {
          question: "Jika f(x) = 5x², berapakah turunan pertama f'(x)?",
          options: ["5x", "10x", "10x²", "25x"],
          correctIndex: 1,
          explanation: "Dengan aturan pangkat, d/dx (5x²) = 5 · 2x²⁻¹ = 10x.",
        },
        {
          question: "Berapakah hasil dari ∫ 3x² dx?",
          options: ["6x + C", "x³ + C", "3x³ + C", "x² + C"],
          correctIndex: 1,
          explanation: "∫ 3x² dx = 3 · (1/3)x³ + C = x³ + C.",
        },
      ],
      mindmapRoot: {
        label: "Kalkulus",
        branches: [
          { title: "Limit Fungsi", detail: "Pendekatan nilai saat x → c" },
          { title: "Turunan f'(x)", detail: "Kemiringan & laju perubahan sesaat" },
          { title: "Integral ∫", detail: "Anti-turunan, luas & akumulasi" },
        ],
      },
    };
  }

  // 3. Topik Matematika Diskrit
  if (
    lower.includes("diskrit") ||
    lower.includes("himpunan") ||
    lower.includes("graf") ||
    lower.includes("kombinatorika")
  ) {
    return {
      id,
      title: cleanTitle,
      kind,
      sourceInput: rawQuery || cleanTitle,
      snippet:
        "Membahas struktur objek diskrit (terpisah dan terbilang): himpunan & relasi, kombinatorika (permutasi & kombinasi), serta teori graf.",
      createdAt: new Date().toISOString(),
      chapterCount: 3,
      chaptersDone: 0,
      chapters: [
        {
          title: "Bab 1 · Himpunan, Relasi & Fungsi",
          summary:
            "Himpunan adalah kumpulan objek yang terdefinisi jelas, sedangkan fungsi memetakan setiap anggota domain ke tepat satu anggota kodomain.",
          points: [
            "Gabungan (A ∪ B) memuat anggota A atau B; irisan (A ∩ B) memuat anggota yang ada di keduanya.",
            "Selisih (A − B) memuat anggota A yang tidak ada di B.",
            "Fungsi injektif (satu-satu), surjektif (onto), dan bijektif (korespondensi satu-satu).",
          ],
        },
        {
          title: "Bab 2 · Kombinatorika (Permutasi & Kombinasi)",
          summary:
            "Teknik pencacahan untuk menghitung banyak susunan atau pemilihan tanpa mendaftar satu per satu.",
          points: [
            "Permutasi P(n, r) = n! / (n − r)! — urutan diperhatikan (misal: susunan ketua & sekretaris).",
            "Kombinasi C(n, r) = n! / (r!(n − r)!) — urutan tidak diperhatikan (misal: memilih tim).",
            "Aturan perkalian dipakai untuk tahap berurutan; aturan penjumlahan untuk pilihan saling lepas.",
          ],
        },
        {
          title: "Bab 3 · Teori Graf & Derajat Simpul",
          summary:
            "Graf G = (V, E) terdiri atas himpunan simpul (V) dan sisi (E) untuk memodelkan jaringan dan hubungan antar-objek.",
          points: [
            "Teorema jabat tangan: jumlah derajat seluruh simpul = 2 × |E|.",
            "Graf terhubung memiliki jalur antara setiap pasang simpul.",
            "Digunakan pada pemetaan rute, jaringan komputer, dan penjadwalan.",
          ],
        },
      ],
      flashcards: [
        {
          id: `${id}-fc-1`,
          front: "Kapan memakai kombinasi dibanding permutasi?",
          back: "Pakai kombinasi saat urutan tidak penting (seperti memilih anggota kelompok), dan permutasi saat urutan penting.",
        },
        {
          id: `${id}-fc-2`,
          front: "Apa isi Teorema Jabat Tangan pada graf?",
          back: "Jumlah derajat seluruh simpul pada graf selalu sama dengan dua kali jumlah sisinya (∑ deg(v) = 2|E|).",
        },
      ],
      quiz: [
        {
          question: "Jika sebuah graf memiliki 6 sisi, berapakah jumlah derajat seluruh simpulnya?",
          options: ["3", "6", "12", "18"],
          correctIndex: 2,
          explanation: "Jumlah derajat seluruh simpul = 2 × jumlah sisi = 2 × 6 = 12.",
        },
      ],
      mindmapRoot: {
        label: cleanTitle.slice(0, 46),
        branches: [
          { title: "Himpunan & Fungsi", detail: "Irisan, gabungan & pemetaan" },
          { title: "Kombinatorika", detail: "Permutasi (urutan) & Kombinasi" },
          { title: "Teori Graf", detail: "Simpul, sisi & derajat" },
        ],
      },
    };
  }

  // 4. Topik Algoritma & Pemrograman / Struktur Data
  if (
    lower.includes("algoritma") ||
    lower.includes("struktur data") ||
    lower.includes("pemrograman") ||
    lower.includes("array") ||
    lower.includes("kompleksitas")
  ) {
    return {
      id,
      title: cleanTitle,
      kind,
      sourceInput: rawQuery || cleanTitle,
      snippet:
        "Mempelajari cara menyusun langkah penyelesaian masalah yang efisien, memilih struktur data yang tepat, serta menganalisis kompleksitas waktu O(n).",
      createdAt: new Date().toISOString(),
      chapterCount: 3,
      chaptersDone: 0,
      chapters: [
        {
          title: "Bab 1 · Logika Algoritma & Efisiensi Big-O",
          summary:
            "Algoritma adalah urutan langkah logis yang terbatas untuk mengubah input menjadi output yang benar dan efisien.",
          points: [
            "O(1) berarti waktu akses konstan; O(log n) membelah ruang pencarian seperti Binary Search.",
            "O(n) memeriksa elemen satu per satu; O(n²) muncul pada perulangan bersarang.",
            "Pemilihan algoritma yang efisien krusial saat ukuran data tumbuh besar.",
          ],
        },
        {
          title: "Bab 2 · Struktur Data Dasar (Array, Stack, Queue, Hash Map)",
          summary:
            "Setiap struktur data memiliki pola akses dan biaya operasi sisip/cari yang berbeda.",
          points: [
            "Array: akses indeks cepat O(1), tetapi sisip di tengah membutuhkan pergeseran O(n).",
            "Stack (LIFO): elemen terakhir masuk keluar lebih dulu; Queue (FIFO): elemen pertama masuk keluar lebih dulu.",
            "Hash Map: pemetaan kunci-nilai dengan pencarian rata-rata O(1).",
          ],
        },
        {
          title: "Bab 3 · Pola Penyelesaian Masalah & Kasus Uji",
          summary:
            "Menguji algoritma pada kasus normal maupun kasus batas (edge cases) agar bebas bug.",
          points: [
            "Selalu uji kondisi batas seperti input kosong, satu elemen, atau data duplikat.",
            "Pecah masalah besar menjadi sub-masalah kecil agar mudah diuji.",
          ],
        },
      ],
      flashcards: [
        {
          id: `${id}-fc-1`,
          front: "Apa perbedaan prinsip kerja Stack dan Queue?",
          back: "Stack bekerja dengan prinsip LIFO (Last In, First Out), sedangkan Queue bekerja dengan FIFO (First In, First Out).",
        },
        {
          id: `${id}-fc-2`,
          front: "Mengapa Binary Search memiliki kompleksitas O(log n)?",
          back: "Karena pada setiap langkah pencarian, ruang data yang diperiksa dibagi dua.",
        },
      ],
      quiz: [
        {
          question: "Struktur data yang paling cocok untuk fitur Undo (batalkan tindakan terakhir) adalah...",
          options: ["Queue", "Stack", "Array statis", "Graf tak berarah"],
          correctIndex: 1,
          explanation: "Stack mengikuti prinsip LIFO sehingga tindakan terakhir dapat diambil kembali terlebih dahulu.",
        },
      ],
      mindmapRoot: {
        label: cleanTitle.slice(0, 46),
        branches: [
          { title: "Kompleksitas Big-O", detail: "O(1), O(log n), O(n), O(n²)" },
          { title: "Struktur Data", detail: "Array, Stack, Queue & Hash Map" },
          { title: "Pengujian", detail: "Kasus batas & verifikasi alur" },
        ],
      },
    };
  }

  // 5. Fallback terstruktur non-repetitif untuk topik umum lainnya
  return {
    id,
    title: cleanTitle,
    kind,
    sourceInput: rawQuery || cleanTitle,
    snippet: `Ringkasan terstruktur ${cleanTitle}: definisi & ruang lingkup, prinsip kerja serta contoh penerapan, dan rangkuman poin kunci.`,
    createdAt: new Date().toISOString(),
    chapterCount: 3,
    chaptersDone: 0,
    chapters: [
      {
        title: `Bab 1 · Konsep Inti & Ruang Lingkup ${cleanTitle}`,
        summary: `Mengenali definisi dasar, komponen pembentuk, dan peran utama ${cleanTitle} dalam konteks penerapannya.`,
        points: [
          `Pengertian pokok: menjelaskan batasan dan tujuan utama dari ${cleanTitle}.`,
          "Komponen & istilah kunci: membedakan elemen utama agar tidak tertukar saat menganalisis kasus.",
          "Keterkaitan konsep: melihat bagaimana setiap bagian saling memengaruhi dalam satu sistem.",
        ],
      },
      {
        title: `Bab 2 · Mekanisme Kerja & Contoh Penerapan`,
        summary: `Menguraikan alur kerja, aturan atau syarat yang berlaku, serta contoh konkret penerapan ${cleanTitle}.`,
        points: [
          "Tahap identifikasi: menentukan data awal, variabel, atau kondisi yang diketahui.",
          "Tahap eksekusi: menerapkan aturan atau prosedur yang sesuai secara berurutan.",
          "Contoh kasus: membandingkan hasil sebelum dan sesudah prinsip diterapkan.",
        ],
      },
      {
        title: `Bab 3 · Kesalahan Umum & Rangkuman Evaluasi`,
        summary: `Merangkum titik rawan kesalahan serta poin penting yang perlu dikuasai sebelum mengerjakan evaluasi.`,
        points: [
          "Periksa kembali syarat berlakunya aturan sebelum menarik kesimpulan.",
          "Gunakan fitur Kuis dan Kartu Hafalan untuk menguji daya ingat aktif.",
        ],
      },
    ],
    flashcards: [
      {
        id: `${id}-fc-1`,
        front: `Apa tujuan utama mempelajari ${cleanTitle}?`,
        back: `Memahami konsep dasar, komponen utama, serta cara menerapkan prinsip ${cleanTitle} secara tepat pada kasus nyata.`,
      },
      {
        id: `${id}-fc-2`,
        front: `Apa dua tahap awal dalam menerapkan ${cleanTitle}?`,
        back: "1) Mengidentifikasi kondisi/data awal yang diketahui, lalu 2) menerapkan aturan atau prosedur yang sesuai.",
      },
    ],
    quiz: [
      {
        question: `Hal pertama yang perlu dilakukan sebelum menerapkan aturan pada ${cleanTitle} adalah...`,
        options: [
          "Mengidentifikasi kondisi awal, syarat, dan komponen yang terlibat",
          "Langsung menebak hasil akhir tanpa memeriksa syarat",
          "Mengabaikan perbedaan istilah dasar",
          "Melewatkan pengecekan hasil",
        ],
        correctIndex: 0,
        explanation:
          "Mengidentifikasi syarat dan data awal mencegah kesalahan penerapan aturan pada tahap berikutnya.",
      },
    ],
    mindmapRoot: {
      label: cleanTitle.slice(0, 46),
      branches: [
        { title: "Konsep & Istilah", detail: `Definisi & komponen utama ${cleanTitle}` },
        { title: "Mekanisme & Contoh", detail: "Alur penerapan & studi kasus" },
        { title: "Evaluasi", detail: "Kesalahan umum & latihan" },
      ],
    },
  };
}

export function generateStudyNoteFromInput(params: {
  source?: string;
  query?: string;
}): StudyNote {
  return buildRichSubjectNote(params);
}

export function buildComprehensiveNoteFromSource(params: {
  source?: string;
  query?: string;
  title?: string;
}): StudyNote {
  return buildRichSubjectNote(params);
}

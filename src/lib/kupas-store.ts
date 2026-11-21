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
      /^(buatkan|buat|tolong buatkan|tolong|bantu buatkan|bantu)\s+(pelajaran|materi|catatan|ringkasan|pembelajaran)\s+(dari|tentang|mengenai|soal)?\s*/i,
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
          const titled = cleaned
            .split(" ")
            .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
            .join(" ");
          return titled;
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

  // Jika pengguna menempel isi teks/catatan panjang, urai menjadi bab dari isi aslinya
  const sentences = rawQuery
    .replace(/\r\n/g, "\n")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 15);

  if (sentences.length >= 3 && rawQuery.length > 140) {
    const perGroup = Math.max(2, Math.ceil(sentences.length / 3));
    const groups = [
      sentences.slice(0, perGroup),
      sentences.slice(perGroup, perGroup * 2),
      sentences.slice(perGroup * 2),
    ].filter((g) => g.length > 0);

    const chapters: ChapterItem[] = groups.map((grp, idx) => ({
      title: `Bab ${idx + 1} · ${
        idx === 0 ? "Konsep & Dasar" : idx === 1 ? "Penjelasan & Mekanisme" : "Penerapan & Kesimpulan"
      }`,
      summary: grp[0],
      points: grp.slice(1).length > 0 ? grp.slice(1) : [grp[0]],
    }));

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
        front: `Apa inti dari ${ch.title}?`,
        back: `${ch.summary} ${ch.points[0] || ""}`.trim(),
      })),
      quiz: [
        {
          question: `Pernyataan mana yang paling tepat terkait ${chapters[0]?.title || cleanTitle}?`,
          options: [
            chapters[0]?.summary || sentences[0],
            "Mengabaikan seluruh data pada materi sumber",
            "Menukar hasil akhir tanpa melalui langkah dasar",
            "Menghapus semua contoh penerapan",
          ],
          correctIndex: 0,
          explanation: chapters[0]?.points[0] || chapters[0]?.summary || "",
        },
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

  // Topik Kalkulus (Limit, Turunan, Integral)
  if (lower.includes("kalkulus") || lower.includes("limit") || lower.includes("turunan") || lower.includes("integral")) {
    return {
      id,
      title: cleanTitle.toLowerCase() === "kalkulus" ? "Kalkulus: Limit, Turunan & Integral" : cleanTitle,
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
            "Limit melihat nilai yang didekati f(x) saat x mendekati suatu titik c, meskipun di titik c fungsinya mungkin tak terdefinisi.",
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
            "Dalam gerak, turunan posisi s(t) terhadap waktu adalah kecepatan v(t), dan turunan kecepatan adalah percepatan a(t).",
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

  // Topik Matematika Diskrit
  if (lower.includes("diskrit") || lower.includes("himpunan") || lower.includes("graf") || lower.includes("kombinatorika")) {
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

  // Fallback tematik terstruktur untuk topik umum lainnya
  return {
    id,
    title: cleanTitle,
    kind,
    sourceInput: rawQuery || cleanTitle,
    snippet: `Ringkasan inti ${cleanTitle}: pengertian dasar, komponen atau prinsip utama, serta langkah penerapan yang mudah dipahami.`,
    createdAt: new Date().toISOString(),
    chapterCount: 3,
    chaptersDone: 0,
    chapters: [
      {
        title: `Bab 1 · Pengertian & Konsep Dasar ${cleanTitle}`,
        summary: `${cleanTitle} berfokus pada pemahaman ide pokok, istilah utama, dan tujuan penerapannya secara runtut.`,
        points: [
          `Definisi inti: memahami apa itu ${cleanTitle} dan mengapa konsep ini penting.`,
          "Istilah kunci: membedakan istilah utama agar tidak tertukar saat membaca atau mengerjakan soal.",
          "Gambaran umum: melihat keterkaitan antarbagian sebelum masuk ke detail.",
        ],
      },
      {
        title: `Bab 2 · Prinsip Kerja & Langkah Penerapan`,
        summary: `Menjelaskan bagaimana konsep pada ${cleanTitle} bekerja dalam praktik serta langkah-langkah menyelesaikannya.`,
        points: [
          "Langkah 1: identifikasi kondisi awal, data, atau informasi utama yang diketahui.",
          "Langkah 2: terapkan aturan, rumus, atau alur kerja yang sesuai dengan konteks.",
          "Langkah 3: periksa kembali hasil akhir agar sesuai dengan syarat yang diminta.",
        ],
      },
      {
        title: `Bab 3 · Kesalahan Umum & Ringkasan Inti`,
        summary: `Merangkum hal yang perlu dihindari dan poin utama yang paling sering keluar dalam latihan atau ujian.`,
        points: [
          "Hindari melompati langkah dasar atau mengabaikan syarat/satuan.",
          "Uji pemahaman secara berkala lewat soal latihan dan kartu hafalan.",
        ],
      },
    ],
    flashcards: [
      {
        id: `${id}-fc-1`,
        front: `Apa fokus utama pada Bab 1 ${cleanTitle}?`,
        back: `Memahami definisi dasar, istilah penting, dan gambaran umum ${cleanTitle} sebelum masuk ke penerapan.`,
      },
      {
        id: `${id}-fc-2`,
        front: `Bagaimana alur penerapan yang rapi untuk ${cleanTitle}?`,
        back: "Identifikasi informasi awal, terapkan prinsip/aturan yang tepat, lalu periksa kembali hasil akhirnya.",
      },
    ],
    quiz: [
      {
        question: `Langkah paling efektif setelah memahami konsep dasar ${cleanTitle} adalah...`,
        options: [
          "Menerapkannya pada contoh/latihan dan memeriksa kembali hasilnya",
          "Melewatkan latihan sama sekali",
          "Menghafal istilah tanpa memahami maknanya",
          "Mengabaikan langkah-langkah penyelesaian",
        ],
        correctIndex: 0,
        explanation: "Menerapkan konsep pada latihan dan memeriksa hasil memperkuat pemahaman serta ketelitian.",
      },
    ],
    mindmapRoot: {
      label: cleanTitle.slice(0, 46),
      branches: [
        { title: "Konsep Dasar", detail: `Definisi & istilah inti ${cleanTitle}` },
        { title: "Penerapan", detail: "Langkah kerja & contoh kasus" },
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

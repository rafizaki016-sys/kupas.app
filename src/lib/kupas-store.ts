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
  {
    id: "n2",
    title: "Sel dan organel",
    kind: "pdf",
    sourceInput: "Struktur dasar sel prokariotik dan eukariotik serta fungsi organel utama.",
    snippet:
      "Sel adalah satuan terkecil makhluk hidup. Organel seperti mitokondria dan kloroplas punya tugas masing-masing di dalam sel.",
    createdAt: "2026-11-19T03:00:00Z",
    chapterCount: 5,
    chaptersDone: 5,
    chapters: [
      {
        title: "Bab 1 · Konsep Dasar Sel",
        summary: "Sel merupakan unit struktural dan fungsional terkecil makhluk hidup.",
        points: [
          "Dibagi menjadi sel prokariotik (tanpa membran inti) dan eukariotik (memiliki membran inti).",
          "Membran sel mengatur keluar-masuk zat secara selektif permeabel.",
        ],
      },
      {
        title: "Bab 2 · Nukleus & Energi Sel",
        summary: "Pusat kendali genetik dan penghasil energi ATP.",
        points: [
          "Nukleus menyimpan DNA dan mengatur aktivitas sel.",
          "Mitokondria berperan dalam respirasi sel menghasilkan energi (ATP).",
        ],
      },
    ],
    flashcards: [
      {
        id: "fc-n2-1",
        front: "Apa fungsi utama mitokondria?",
        back: "Menghasilkan energi (ATP) melalui proses respirasi sel.",
      },
      {
        id: "fc-n2-2",
        front: "Organel mana yang khusus ada pada sel tumbuhan untuk fotosintesis?",
        back: "Kloroplas (mengandung klorofil).",
      },
    ],
    quiz: [
      {
        question: "Organel yang berfungsi mengontrol seluruh kegiatan sel adalah...",
        options: ["Ribosom", "Nukleus", "Vakuola", "Lisosom"],
        correctIndex: 1,
        explanation: "Nukleus (inti sel) mengandung materi genetik dan mengendalikan aktivitas sel.",
      },
    ],
    mindmapRoot: {
      label: "Sel & Organel",
      branches: [
        { title: "Nukleus", detail: "Pusat informasi genetik (DNA)" },
        { title: "Mitokondria", detail: "Penghasil energi ATP" },
        { title: "Kloroplas", detail: "Tempat fotosintesis pada tumbuhan" },
      ],
    },
  },
  {
    id: "n3",
    title: "Rekaman kelas sejarah",
    kind: "audio",
    sourceInput: "Perkembangan pergerakan nasional Indonesia awal abad ke-20.",
    snippet:
      "Latar belakang pergerakan nasional, tokoh-tokohnya, dan urutan peristiwa penting dari awal abad ke-20.",
    createdAt: "2026-11-17T03:00:00Z",
    chapterCount: 6,
    chaptersDone: 1,
    chapters: [
      {
        title: "Bab 1 · Latar Belakang Pergerakan Nasional",
        summary:
          "Kesadaran baru akibat Politik Etis, pendidikan modern, dan tekanan kolonialisme mendorong organisasi modern.",
        points: [
          "Perubahan strategi perjuangan dari kedaerahan/fisik ke organisasi modern.",
          "Munculnya golongan terpelajar sebagai penggerak kesadaran kebangsaan.",
        ],
      },
    ],
    flashcards: [
      {
        id: "fc-n3-1",
        front: "Apa ciri utama pergerakan nasional dibanding perjuangan abad ke-19?",
        back: "Bersifat nasional, terorganisasi modern, dan dipimpin kaum terpelajar.",
      },
    ],
    quiz: [
      {
        question: "Faktor internal yang memicu lahirnya pergerakan nasional adalah...",
        options: [
          "Kenangan kejayaan masa lalu dan penderitaan akibat penjajahan",
          "Kemenangan Jepang atas Rusia (1905)",
          "Masuknya paham liberalisme Eropa",
          "Perang Dunia I",
        ],
        correctIndex: 0,
        explanation: "Kesadaran nasib yang sama serta kenangan masa lalu menjadi pendorong internal utama.",
      },
    ],
    mindmapRoot: {
      label: "Pergerakan Nasional",
      branches: [
        { title: "Faktor Internal", detail: "Kesadaran senasib & sejarah bangsa" },
        { title: "Faktor Eksternal", detail: "Kebangkitan Asia & ideologi baru" },
      ],
    },
  },
];

export function cleanTopicFromInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed);
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

  return trimmed.replace(/\s+/g, " ");
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

export function generateStudyNoteFromInput(params: {
  source?: string;
  query?: string;
}): StudyNote {
  const kind: NoteKind =
    params.source === "record"
      ? "audio"
      : params.source === "upload"
        ? "pdf"
        : params.source === "link"
          ? "youtube"
          : "text";

  const cleanInput = cleanTopicFromInput(params.query || "");
  const baseTitle =
    cleanInput.length > 0
      ? cleanInput.length > 72
        ? `${cleanInput.slice(0, 69).trim()}...`
        : cleanInput
      : kind === "audio"
        ? "Catatan Rekaman Audio"
        : kind === "pdf"
          ? "Ringkasan Dokumen Unggahan"
          : kind === "youtube"
            ? "Ringkasan Materi Tautan"
            : "Catatan Belajar Baru";

  const topicLabel = cleanInput || baseTitle;
  const id = `note-${Date.now()}`;

  return {
    id,
    title: baseTitle,
    kind,
    sourceInput: (params.query || "").trim() || topicLabel,
    snippet: `Pembahasan terstruktur tentang ${topicLabel}: definisi & konsep inti, prinsip kerja serta penerapan, ditambah kartu hafalan dan latihan soal.`,
    createdAt: new Date().toISOString(),
    chapterCount: 3,
    chaptersDone: 0,
    chapters: [
      {
        title: `Bab 1 · Definisi, Ruang Lingkup & Konsep Inti ${topicLabel}`,
        summary: `Memahami pengertian dasar, istilah penting, dan kerangka utama dalam ${topicLabel} secara sistematis.`,
        points: [
          `Mendefinisikan ${topicLabel} beserta peran utamanya dalam konteks pembahasan.`,
          "Mengenali istilah kunci, komponen utama, dan perbedaan konsep yang sering tertukar.",
          "Menghubungkan konsep dasar dengan contoh nyata agar lebih mudah dipahami.",
        ],
      },
      {
        title: `Bab 2 · Prinsip Kerja, Langkah & Penerapan ${topicLabel}`,
        summary: `Menguraikan mekanisme, aturan atau rumus/alur kerja, serta contoh penerapan praktis dari ${topicLabel}.`,
        points: [
          "Menyusun alur langkah penyelesaian dari kondisi awal hingga hasil akhir.",
          "Mengidentifikasi syarat, batasan, atau faktor yang memengaruhi hasil penerapan.",
          "Menghindari kesalahan umum saat menerapkan konsep ke studi kasus atau soal.",
        ],
      },
      {
        title: `Bab 3 · Evaluasi, Catatan Penting & Penguatan Ingatan`,
        summary: `Menguji pemahaman secara aktif melalui cek pemahaman, flashcard, kuis, dan tanya jawab materi.`,
        points: [
          "Menyimpulkan poin-poin paling penting yang wajib diingat kembali sebelum ujian.",
          "Menguji ketepatan pemahaman lewat soal latihan dan meninjau penjelasan jawabannya.",
          "Mengulang kartu hafalan secara berkala untuk memperkuat retensi jangka panjang.",
        ],
      },
    ],
    flashcards: [
      {
        id: `${id}-fc-1`,
        front: `Apa inti pembahasan dari ${topicLabel}?`,
        back: `${topicLabel} menguraikan konsep dasar, prinsip/aturan utama, serta langkah penerapannya secara runtut dan terstruktur.`,
      },
      {
        id: `${id}-fc-2`,
        front: `Apa hal utama yang perlu diperhatikan saat menerapkan ${topicLabel}?`,
        back: "Pahami definisi dan syarat berlakunya terlebih dahulu, ikuti langkah secara berurutan, lalu periksa kembali hasilnya.",
      },
      {
        id: `${id}-fc-3`,
        front: `Bagaimana cara terbaik menguasai ${topicLabel} hingga tuntas?`,
        back: "Pelajari tiap bab secara bertahap, kerjakan cek pemahaman dan kuis, lalu ulangi poin kunci melalui kartu hafalan.",
      },
    ],
    quiz: [
      {
        question: `Langkah paling tepat saat mempelajari ${topicLabel} adalah...`,
        options: [
          "Memahami konsep dasar dan alurnya per bab sebelum mengerjakan latihan soal",
          "Menghafal tanpa memahami makna, syarat, dan penerapannya",
          "Melewatkan evaluasi dan pengulangan materi",
          "Membaca sekaligus tanpa membaginya per bagian",
        ],
        correctIndex: 0,
        explanation: `Memahami konsep dasar ${topicLabel} per bab membantu kamu menerapkan aturan dengan tepat saat mengerjakan soal.`,
      },
      {
        question: `Mengapa penting meninjau penjelasan setelah menjawab soal tentang ${topicLabel}?`,
        options: [
          "Untuk memperbaiki kesalahan konsep dan memperkuat pemahaman langkah penyelesaian",
          "Agar jumlah halaman catatan bertambah",
          "Supaya tidak perlu lagi membaca materi",
          "Karena semua soal memiliki pola yang sama persis tanpa syarat",
        ],
        correctIndex: 0,
        explanation: "Meninjau penjelasan membantu meluruskan miskonsepsi sejak awal sebelum lanjut ke materi berikutnya.",
      },
    ],
    mindmapRoot: {
      label: topicLabel.slice(0, 46),
      branches: [
        { title: "Konsep & Definisi", detail: `Dasar-dasar & istilah inti ${topicLabel}` },
        { title: "Prinsip & Penerapan", detail: "Alur kerja, syarat & contoh kasus" },
        { title: "Evaluasi & Hafalan", detail: "Kuis, flashcard & ringkasan inti" },
      ],
    },
  };
}

export function buildComprehensiveNoteFromSource(params: {
  source?: string;
  query?: string;
  title?: string;
}): StudyNote {
  const rawText = (params.query || "").trim();
  const cleanTitle = cleanTopicFromInput(params.title || rawText);
  const base = generateStudyNoteFromInput({
    source: params.source,
    query: cleanTitle || rawText,
  });

  const sentences = rawText
    .replace(/\r\n/g, "\n")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12);

  if (sentences.length < 2) {
    return {
      ...base,
      title: cleanTitle || base.title,
      sourceInput: rawText || base.sourceInput,
    };
  }

  const chunkSize = Math.max(2, Math.ceil(sentences.length / 3));
  const chapterSpecs = [
    {
      prefix: "Bab 1 · Konsep Inti & Latar Belakang",
      slice: sentences.slice(0, chunkSize),
    },
    {
      prefix: "Bab 2 · Uraian Mendalam & Mekanisme",
      slice: sentences.slice(chunkSize, chunkSize * 2),
    },
    {
      prefix: "Bab 3 · Penerapan, Catatan Penting & Kesimpulan",
      slice: sentences.slice(chunkSize * 2),
    },
  ].filter((c) => c.slice.length > 0);

  const richChapters = chapterSpecs.map((spec) => ({
    title: spec.prefix,
    summary: spec.slice[0],
    points: spec.slice.length > 1 ? spec.slice : [spec.slice[0]],
  }));

  const richFlashcards = richChapters.slice(0, 4).map((ch, idx) => ({
    id: `${base.id}-fc-${idx + 1}`,
    front: `Jelaskan poin utama pada "${ch.title}"`,
    back: ch.points.join(" — "),
  }));

  const richQuiz = [
    {
      question: `Poin manakah yang paling sesuai dengan pembahasan "${richChapters[0]?.title || base.title}"?`,
      options: [
        richChapters[0]?.summary || base.snippet,
        "Mengabaikan konsep dasar dan langsung melompat tanpa urutan",
        "Menyamaratakan semua istilah tanpa membedakan fungsinya",
        "Menghapus seluruh contoh dan catatan penerapan",
      ],
      correctIndex: 0,
      explanation: `Pada ${richChapters[0]?.title || "bab pertama"}, fokus utamanya adalah: ${
        richChapters[0]?.summary || base.snippet
      }`,
    },
    ...(richChapters[1]
      ? [
          {
            question: `Apa yang dibahas pada "${richChapters[1].title}"?`,
            options: [
              richChapters[1].summary,
              "Hanya daftar tautan luar tanpa isi materi",
              "Aturan yang bertentangan dengan seluruh konsep sebelumnya",
              "Pengulangan judul tanpa penjelasan",
            ],
            correctIndex: 0,
            explanation: richChapters[1].points.join(" "),
          },
        ]
      : []),
  ];

  return {
    ...base,
    title: cleanTitle || base.title,
    sourceInput: rawText,
    snippet: sentences.slice(0, 2).join(" ").slice(0, 180),
    chapterCount: richChapters.length,
    chapters: richChapters,
    flashcards: richFlashcards,
    quiz: richQuiz,
    mindmapRoot: {
      label: (cleanTitle || base.title).slice(0, 46),
      branches: richChapters.map((ch, idx) => ({
        title: ch.title.replace(/^Bab\s*\d+\s*·\s*/i, ""),
        detail: ch.points[idx] || ch.summary,
      })),
    },
  };
}

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
    snippet: `Ringkasan terstruktur tentang ${topicLabel}: konsep inti, penerapan, kartu hafalan, dan latihan soal.`,
    createdAt: new Date().toISOString(),
    chapterCount: 3,
    chaptersDone: 1,
    chapters: [
      {
        title: `Bab 1 · Pengertian & Konsep Dasar ${topicLabel}`,
        summary: `Memahami definisi, ruang lingkup, dan istilah utama dalam ${topicLabel} secara runtut.`,
        points: [
          `Mengenali definisi pokok dan karakteristik utama ${topicLabel}.`,
          "Membedakan konsep inti dengan contoh kasus di kehidupan nyata atau bidang terkait.",
        ],
      },
      {
        title: `Bab 2 · Prinsip Kerja & Penerapan ${topicLabel}`,
        summary: `Menelaah aturan, pola, atau langkah sistematis saat menerapkan ${topicLabel}.`,
        points: [
          "Mengikuti alur langkah dari dasar ke kasus yang lebih terstruktur.",
          "Memperhatikan syarat, batasan, atau kekhususan pada setiap bagian.",
        ],
      },
      {
        title: `Bab 3 · Latihan & Penguatan Ingatan`,
        summary: `Menguji pemahaman melalui pertanyaan cek pemahaman, flashcard, dan kuis.`,
        points: [
          "Menjawab soal latihan untuk memastikan pemahaman konsep sebelum lanjut.",
          "Mengulang kartu hafalan berkala dan memakai Tanya Materi untuk bagian yang belum jelas.",
        ],
      },
    ],
    flashcards: [
      {
        id: `${id}-fc-1`,
        front: `Apa gagasan utama dari ${topicLabel}?`,
        back: `${topicLabel} membahas konsep dasar, prinsip/aturan utama, serta penerapannya secara sistematis.`,
      },
      {
        id: `${id}-fc-2`,
        front: `Bagaimana cara terbaik menguasai ${topicLabel} lebih cepat?`,
        back: "Pahami definisi & alurnya per bab, kerjakan cek pemahaman dan kuis, lalu ulangi lewat flashcard.",
      },
    ],
    quiz: [
      {
        question: `Langkah paling tepat saat mempelajari ${topicLabel} adalah...`,
        options: [
          "Memahami konsep dasar dan alurnya per bab sebelum latihan soal",
          "Menghafal tanpa memahami makna atau penerapannya",
          "Melewatkan evaluasi dan pengulangan materi",
          "Membaca sekaligus tanpa membaginya per bagian",
        ],
        correctIndex: 0,
        explanation: `Memahami konsep dasar ${topicLabel} per bab membantu kamu menerapkan aturan dengan tepat saat mengerjakan soal.`,
      },
    ],
    mindmapRoot: {
      label: topicLabel.slice(0, 46),
      branches: [
        { title: "Konsep & Definisi", detail: `Dasar-dasar ${topicLabel}` },
        { title: "Penerapan", detail: "Contoh dan penggunaan praktis" },
        { title: "Evaluasi", detail: "Kuis, flashcard & tanya jawab" },
      ],
    },
  };
}

export type SourceType = "pdf" | "docx" | "pptx" | "xlsx" | "txt" | "youtube";

export interface StudySet {
  id: string;
  title: string;
  source_type: SourceType;
  status: "processing" | "ready" | "failed";
  summary_markdown: string;
  flashcards: { id: string; front: string; back: string }[];
  quiz: { id: string; prompt: string; options: string[]; correct_index: number; explanation: string }[];
  mindmap: { label: string; children?: { label: string; children?: { label: string }[] }[] };
  created_at: string;
}

const LOCAL_KEY = "kupas_offline_study_sets_v1";

const DEFAULT_SETS: StudySet[] = [
  {
    id: "contoh-makroekonomi",
    title: "Pengantar Ekonomi Makro — Bab 4: Inflasi & Kebijakan Moneter",
    source_type: "pdf",
    status: "ready",
    created_at: "2026-11-20T06:00:00Z",
    summary_markdown:
      "## Konsep Inti\n- **Inflasi** adalah kenaikan tingkat harga umum secara terus-menerus dalam jangka waktu tertentu.\n- **Demand-pull inflation** terjadi saat permintaan agregat melebihi kapasitas produksi.\n- **Cost-push inflation** dipicu kenaikan biaya produksi (energi, upah, bahan baku).\n\n## Instrumen Bank Sentral\n1. **Suku bunga acuan:** Menaikkan bunga untuk meredam belanja dan pinjaman.\n2. **Operasi pasar terbuka:** Menjual/membeli surat berharga pemerintah.\n3. **Giro wajib minimum (GWM):** Mengatur porsi dana yang wajib ditahan bank.",
    flashcards: [
      {
        id: "fc-1",
        front: "Apa perbedaan utama demand-pull dan cost-push inflation?",
        back: "Demand-pull berasal dari lonjakan permintaan agregat; cost-push berasal dari kenaikan biaya input produksi.",
      },
      {
        id: "fc-2",
        front: "Sebutkan 3 instrumen utama kebijakan moneter bank sentral.",
        back: "Suku bunga acuan, operasi pasar terbuka, dan giro wajib minimum (GWM).",
      },
    ],
    quiz: [
      {
        id: "q-1",
        prompt: "Kenaikan harga BBM yang mendorong naiknya biaya distribusi barang merupakan contoh dari...",
        options: ["Demand-pull inflation", "Cost-push inflation", "Deflasi struktural", "Hiperinflasi moneter"],
        correct_index: 1,
        explanation: "Lonjakan biaya energi menaikkan biaya produksi sehingga tergolong cost-push inflation.",
      },
      {
        id: "q-2",
        prompt: "Untuk menekan inflasi yang terlalu tinggi, bank sentral umumnya akan...",
        options: [
          "Menurunkan suku bunga acuan",
          "Menaikkan suku bunga acuan",
          "Membeli obligasi besar-besaran",
          "Menghapus giro wajib minimum",
        ],
        correct_index: 1,
        explanation: "Menaikkan suku bunga membuat pinjaman lebih mahal sehingga meredam konsumsi berlebih.",
      },
    ],
    mindmap: {
      label: "Inflasi & Moneter",
      children: [
        { label: "Jenis Inflasi", children: [{ label: "Demand-Pull" }, { label: "Cost-Push" }] },
        { label: "Instrumen Bank Sentral", children: [{ label: "Suku Bunga" }, { label: "Pasar Terbuka" }, { label: "GWM" }] },
      ],
    },
  },
];

export function loadLocalSets(): StudySet[] {
  if (typeof window === "undefined") return DEFAULT_SETS;
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) {
      window.localStorage.setItem(LOCAL_KEY, JSON.stringify(DEFAULT_SETS));
      return DEFAULT_SETS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SETS;
  }
}

export function saveLocalSet(set: StudySet): void {
  if (typeof window === "undefined") return;
  const current = loadLocalSets().filter((s) => s.id !== set.id);
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify([set, ...current]));
}

export function getLocalSet(id: string): StudySet | null {
  return loadLocalSets().find((s) => s.id === id) ?? null;
}

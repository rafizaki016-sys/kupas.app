"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CornerDownLeft,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import type { ChapterItem, QuizItem } from "../../lib/kupas-store";

type StepCard =
  | {
      kind: "intro";
      label: string;
      heading: string;
      body: string;
      totalPoints: number;
    }
  | {
      kind: "explain";
      label: string;
      heading: string;
      body: string;
      bullets?: string[];
      showDiagram?: boolean;
    }
  | {
      kind: "check";
      label: string;
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    };

type ChapterRunnerProps = {
  chapter: ChapterItem;
  chapterIndex: number;
  totalChapters: number;
  hasNextChapter: boolean;
  relatedQuiz?: QuizItem;
  onExit: () => void;
  onCompleteChapter: () => void;
  onNextChapter: () => void;
  onAwardQuizXp: () => void;
};

export default function ChapterRunner({
  chapter,
  chapterIndex,
  totalChapters,
  hasNextChapter,
  relatedQuiz,
  onExit,
  onCompleteChapter,
  onNextChapter,
  onAwardQuizXp,
}: ChapterRunnerProps) {
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [stepSelectedOpt, setStepSelectedOpt] = useState<number | null>(null);
  const [stepChecked, setStepChecked] = useState<boolean>(false);
  const [chapterFinished, setChapterFinished] = useState<boolean>(false);

  const chapterSteps: StepCard[] = useMemo(() => {
    const steps: StepCard[] = [
      {
        kind: "intro",
        label: "Gambaran bab",
        heading: chapter.title,
        body: chapter.summary,
        totalPoints: chapter.points.length,
      },
      {
        kind: "explain",
        label: "Poin utama",
        heading: chapter.points[0] || chapter.title,
        body: chapter.summary,
        bullets: chapter.points.slice(0, 2),
      },
      {
        kind: "explain",
        label: "Peta konsep dalam bab",
        heading: "Hubungan konsep inti di bab ini",
        body: "Perhatikan bagaimana konsep utama terhubung dengan poin-poin penting pada bab ini sebelum lanjut ke cek pemahaman.",
        showDiagram: true,
      },
    ];

    if (relatedQuiz) {
      steps.push({
        kind: "check",
        label: "Cek pemahaman",
        question: relatedQuiz.question,
        options: relatedQuiz.options,
        correctIndex: relatedQuiz.correctIndex,
        explanation: relatedQuiz.explanation,
      });
    }

    steps.push({
      kind: "explain",
      label: "Rangkuman bab",
      heading: `Rangkuman · ${chapter.title}`,
      body: chapter.summary,
      bullets: chapter.points,
    });

    return steps;
  }, [chapter, relatedQuiz]);

  const activeStep = chapterSteps[stepIdx] ?? chapterSteps[0];

  function jumpToStep(idx: number) {
    setChapterFinished(false);
    setStepIdx(idx);
    setStepSelectedOpt(null);
    setStepChecked(false);
  }

  function handleNextStep() {
    if (stepIdx < chapterSteps.length - 1) {
      jumpToStep(stepIdx + 1);
    } else if (!chapterFinished) {
      onCompleteChapter();
      setChapterFinished(true);
    }
  }

  function handlePrevStep() {
    if (chapterFinished) {
      setChapterFinished(false);
      return;
    }
    if (stepIdx > 0) {
      jumpToStep(stepIdx - 1);
    } else {
      onExit();
    }
  }

  function handleCheckAnswer() {
    if (stepSelectedOpt === null) return;
    setStepChecked(true);
    if (activeStep?.kind === "check" && stepSelectedOpt === activeStep.correctIndex) {
      onAwardQuizXp();
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#faf6ee] text-[#1d2433]">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b-[1.5px] border-[#1d2433] bg-[#fffdf8] px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3.5">
          <button
            type="button"
            aria-label="Keluar dari bab ke daftar bab"
            onClick={() => {
              setChapterFinished(false);
              onExit();
            }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-[1.5px] border-[#1d2433] bg-white text-[#1d2433] transition hover:bg-[#dfe8ff]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="min-w-0">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#6e7687]">
              BAB {chapterIndex + 1} DARI {totalChapters}
            </span>
            <h1 className="truncate text-sm font-extrabold text-[#1d2433] sm:text-base">
              {chapter.title}
            </h1>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-[1.5px] border-[#1d2433] bg-white px-3 py-1 text-xs font-bold text-[#1d2433]">
          <Sparkles className="h-3.5 w-3.5 text-[#1e4fd8]" aria-hidden="true" />
          <span>5 hari</span>
        </span>
      </header>

      <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col md:flex-row">
        <aside
          aria-label="Langkah di bab ini"
          className="w-full shrink-0 border-b-[1.5px] border-[#1d2433] bg-[#fffdf8] px-4 py-4 md:w-[270px] md:border-b-0 md:border-r-[1.5px] md:py-6"
        >
          <p className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-[#6e7687]">
            LANGKAH DI BAB INI
          </p>

          <ol className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-1.5 md:overflow-visible md:pb-0">
            {chapterSteps.map((st, idx) => {
              const isActive = !chapterFinished && idx === stepIdx;
              const isDone = chapterFinished || idx < stepIdx;

              return (
                <li key={`${st.label}-${idx}`} className="shrink-0 md:shrink">
                  <button
                    type="button"
                    onClick={() => jumpToStep(idx)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition ${
                      isActive
                        ? "border-[1.5px] border-[#1d2433] bg-[#dfe8ff] font-extrabold text-[#1d2433] shadow-[2px_2px_0_#1d2433]"
                        : "border border-transparent text-[#5d6578] hover:bg-[#faf6ee] hover:text-[#1d2433]"
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-extrabold ${
                        isDone
                          ? "bg-[#1e4fd8] text-white"
                          : isActive
                            ? "border-[1.5px] border-[#1e4fd8] bg-white text-[#1d2433]"
                            : "border border-[#b8c0cf] bg-white text-[#6e7687]"
                      }`}
                    >
                      {isDone ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : idx + 1}
                    </span>
                    <span className="max-w-[170px] truncate md:max-w-none md:whitespace-normal">
                      {st.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <main className="flex flex-1 flex-col justify-between px-4 py-6 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-[720px] space-y-5">
            {chapterFinished ? (
              <div className="space-y-4 rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-7 text-center shadow-[5px_5px_0_#1d2433]">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border-[1.5px] border-[#1d2433] bg-[#dfe8ff] text-[#1e4fd8]">
                  <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-extrabold text-[#1d2433]">Bab selesai!</h2>
                <p className="text-sm text-[#5d6578]">
                  Kamu menyelesaikan{" "}
                  <strong className="text-[#1d2433]">{chapter.title}</strong> dan mendapatkan{" "}
                  <strong className="text-[#1e4fd8]">+15 XP</strong>.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => jumpToStep(0)}
                    className="inline-flex items-center gap-1.5 rounded-xl border-[1.5px] border-[#1d2433] bg-white px-4 py-2 text-xs font-bold text-[#1d2433]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Ulang Bab</span>
                  </button>
                  {hasNextChapter ? (
                    <button
                      type="button"
                      onClick={() => {
                        setChapterFinished(false);
                        setStepIdx(0);
                        setStepSelectedOpt(null);
                        setStepChecked(false);
                        onNextChapter();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-4 py-2 text-xs font-bold text-white shadow-[3px_3px_0_#1d2433]"
                    >
                      <span>Bab Berikutnya</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setChapterFinished(false);
                        onExit();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-4 py-2 text-xs font-bold text-white shadow-[3px_3px_0_#1d2433]"
                    >
                      <span>Selesai &amp; Kembali</span>
                    </button>
                  )}
                </div>
              </div>
            ) : activeStep?.kind === "intro" ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold tracking-tight text-[#1d2433] sm:text-[28px]">
                  {activeStep.heading}
                </h2>
                <p className="text-sm leading-relaxed text-[#1d2433] sm:text-base">
                  {activeStep.body}
                </p>
                <div className="rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-5 shadow-[4px_4px_0_#1d2433]">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1e4fd8]">
                    RINGKASAN STRUKTUR BAB
                  </span>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#5d6578]">
                    Bab ini terdiri atas {activeStep.totalPoints} poin inti, peta hubungan konsep,
                    dan pertanyaan cek pemahaman di akhir.
                  </p>
                </div>
              </div>
            ) : activeStep?.kind === "explain" ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold tracking-tight text-[#1d2433] sm:text-[26px]">
                  {activeStep.heading}
                </h2>
                <p className="text-sm leading-relaxed text-[#1d2433] sm:text-[15px]">
                  {activeStep.body}
                </p>

                {activeStep.showDiagram && (
                  <div className="rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-5 shadow-[4px_4px_0_#1d2433]">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#6e7687]">
                      PETA KONSEP DALAM BAB
                    </span>

                    <div className="mt-4 flex flex-col items-center space-y-4">
                      <div className="rounded-full border-[1.5px] border-[#1e4fd8] bg-[#dfe8ff] px-5 py-2 text-xs font-extrabold text-[#1e4fd8]">
                        {chapter.title}
                      </div>

                      <div className="grid w-full gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border-[1.5px] border-[#1d2433] bg-white p-3.5 text-center text-xs font-bold leading-relaxed text-[#1d2433]">
                          {chapter.points[0] || "Konsep pertama"}
                        </div>

                        <div className="rounded-2xl border-[1.5px] border-[#1d2433] bg-white p-3.5 text-center text-xs font-bold leading-relaxed text-[#1d2433]">
                          {chapter.points[1] || "Konsep kedua"}
                        </div>
                      </div>

                      {chapter.points[2] && (
                        <div className="w-full rounded-2xl border-[1.5px] border-[#1d2433] bg-[#faf6ee] p-3.5 text-center text-xs font-semibold leading-relaxed text-[#1d2433]">
                          {chapter.points[2]}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeStep.bullets && activeStep.bullets.length > 0 && (
                  <ul className="space-y-2 rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-4 text-sm text-[#1d2433]">
                    {activeStep.bullets.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1e4fd8]" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : activeStep?.kind === "check" ? (
              <div className="space-y-4 rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-6 shadow-[5px_5px_0_#1d2433]">
                <span className="inline-block rounded-full border border-[#1d2433] bg-[#dfe8ff] px-3 py-0.5 text-[11px] font-bold uppercase text-[#1e4fd8]">
                  Cek Pemahaman
                </span>
                <h2 className="text-lg font-extrabold text-[#1d2433]">{activeStep.question}</h2>

                <div className="space-y-2.5">
                  {activeStep.options.map((opt, idx) => {
                    const picked = stepSelectedOpt === idx;
                    const isCorrect = idx === activeStep.correctIndex;
                    let boxClass =
                      "border-[#1d2433] bg-white text-[#1d2433] hover:bg-[#dfe8ff]";
                    if (stepChecked) {
                      if (isCorrect) boxClass = "border-emerald-700 bg-emerald-50 text-emerald-950";
                      else if (picked) boxClass = "border-rose-700 bg-rose-50 text-rose-950";
                    } else if (picked) {
                      boxClass = "border-[#1d2433] bg-[#dfe8ff] text-[#1d2433]";
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          if (stepChecked && stepSelectedOpt === activeStep.correctIndex) return;
                          setStepSelectedOpt(idx);
                          setStepChecked(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left text-sm font-semibold transition ${boxClass}`}
                      >
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#1d2433] bg-[#faf6ee] text-xs font-bold text-[#1d2433]">
                          {idx + 1}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {stepChecked && (
                  <div className="rounded-xl border border-[#e5ddd0] bg-[#faf6ee] p-4 text-xs text-[#1d2433]">
                    <p className="font-bold">
                      {stepSelectedOpt === activeStep.correctIndex
                        ? "Jawaban tepat! (+5 XP)"
                        : "Belum tepat — coba pilih opsi lain lalu periksa."}
                    </p>
                    <p className="mt-1 text-[#5d6578]">{activeStep.explanation}</p>
                  </div>
                )}

                {!(stepChecked && stepSelectedOpt === activeStep.correctIndex) && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      disabled={stepSelectedOpt === null}
                      onClick={handleCheckAnswer}
                      className="rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-4 py-2 text-xs font-bold text-white shadow-[3px_3px_0_#1d2433] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
                    >
                      Periksa Jawaban
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </main>
      </div>

      <footer className="sticky bottom-0 z-20 flex h-16 items-center justify-between border-t-[1.5px] border-[#1d2433] bg-[#fffdf8] px-4 sm:px-8">
        <button
          type="button"
          onClick={handlePrevStep}
          className="inline-flex items-center gap-1.5 rounded-xl border-[1.5px] border-[#1d2433] bg-white px-4 py-2 text-xs font-bold text-[#1d2433] transition hover:bg-[#faf6ee]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Kembali</span>
        </button>

        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6e7687]">
          {Math.min(stepIdx + 1, chapterSteps.length)} DARI {chapterSteps.length}
        </span>

        <button
          type="button"
          onClick={handleNextStep}
          className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-[#1d2433] bg-[#1e4fd8] px-5 py-2 text-xs font-bold text-white shadow-[3px_3px_0_#1d2433] transition hover:-translate-x-[1px] hover:-translate-y-[1px]"
        >
          <span>Lanjut</span>
          <CornerDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </footer>
    </div>
  );
}

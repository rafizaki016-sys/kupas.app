"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  ListChecks,
  MessageSquare,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocalSet, StudySet } from "@/lib/data";

type RawQuizItem = StudySet["quiz"][number];

interface NormalizedQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

function normalizeQuiz(items: RawQuizItem[]): NormalizedQuestion[] {
  return items.map((item) => {
    const rec = item as unknown as Record<string, unknown>;
    const question =
      typeof rec.question === "string"
        ? rec.question
        : typeof rec.q === "string"
          ? rec.q
          : typeof rec.prompt === "string"
            ? rec.prompt
            : "";
    const options = Array.isArray(rec.options)
      ? rec.options.map((opt) => String(opt))
      : Array.isArray(rec.choices)
        ? rec.choices.map((opt) => String(opt))
        : [];
    const correctIndex =
      typeof rec.correct_index === "number"
        ? rec.correct_index
        : typeof rec.answer_index === "number"
          ? rec.answer_index
          : typeof rec.correctIndex === "number"
            ? rec.correctIndex
            : typeof rec.answer === "number"
              ? rec.answer
              : 0;
    const explanation =
      typeof rec.explanation === "string" ? rec.explanation.trim() : "";

    return {
      question,
      options,
      correctIndex,
      explanation,
    };
  });
}

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const [set, setSet] = useState<StudySet | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setSet(getLocalSet(id));
  }, [id]);

  if (!set) {
    return (
      <div className="mx-auto max-w-[760px] p-6">
        <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
          Materi tidak ditemukan.
        </div>
      </div>
    );
  }

  const questions = normalizeQuiz(set.quiz ?? []);

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-[760px] p-6">
        <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
          Belum ada soal kuis untuk materi ini.
        </div>
      </div>
    );
  }

  const total = questions.length;
  const current = questions[currentIdx];
  const selectedOption = answers[currentIdx];
  const hasAnswered = selectedOption !== undefined;

  const correctCount = questions.reduce(
    (acc, q, idx) => (answers[idx] === q.correctIndex ? acc + 1 : acc),
    0
  );
  const scorePercent = Math.round((correctCount / total) * 100);

  function handleSelect(optIdx: number) {
    if (hasAnswered) return;
    setAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }));
  }

  function handleNext() {
    if (currentIdx + 1 < total) {
      setCurrentIdx((i) => i + 1);
    } else {
      setFinished(true);
    }
  }

  function handleRestart() {
    setAnswers({});
    setCurrentIdx(0);
    setFinished(false);
  }

  if (finished) {
    const verdict =
      scorePercent >= 80
        ? "Luar Biasa!"
        : scorePercent >= 60
          ? "Sudah Bagus!"
          : "Yuk Latihan Lagi!";

    return (
      <div className="mx-auto max-w-[760px] space-y-6 p-4 md:p-8">
        <div className="rounded-lg border border-border bg-surface p-6 text-center shadow-sm md:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Trophy className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-accent">
            Kuis Selesai
          </p>
          <h1 className="mt-1 text-2xl font-bold text-text">{verdict}</h1>
          <p className="mt-1 text-sm text-muted">{set.title}</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-surface-subtle/60 p-3">
              <p className="text-xs text-muted">Skor</p>
              <p className="mt-1 text-2xl font-bold text-accent">{scorePercent}%</p>
            </div>
            <div className="rounded-lg border border-border bg-success-bg/60 p-3">
              <p className="text-xs text-success-text">Benar</p>
              <p className="mt-1 text-2xl font-bold text-success-text">{correctCount}</p>
            </div>
            <div className="rounded-lg border border-border bg-danger-bg/60 p-3">
              <p className="text-xs text-danger-text">Salah</p>
              <p className="mt-1 text-2xl font-bold text-danger-text">
                {total - correctCount}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <Button onClick={handleRestart}>
              <RotateCcw className="h-4 w-4" />
              Ulangi Kuis
            </Button>
            <Link
              href={`/set/${set.id}/flashcards`}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium text-text hover:bg-surface-subtle"
            >
              <Layers className="h-4 w-4 text-accent" />
              Buka Flashcard
            </Link>
            <Link
              href={`/set/${set.id}/chat`}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium text-text hover:bg-surface-subtle"
            >
              <MessageSquare className="h-4 w-4 text-accent" />
              Tanya Tutor AI
            </Link>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-text">Tinjauan Jawaban</h2>
          {questions.map((q, idx) => {
            const userAns = answers[idx];
            const isCorrect = userAns === q.correctIndex;
            return (
              <div
                key={idx}
                className="rounded-lg border border-border bg-surface p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-text">
                    <span className="mr-1.5 text-accent">{idx + 1}.</span>
                    {q.question}
                  </p>
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-danger" />
                  )}
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  {!isCorrect && userAns !== undefined && (
                    <p className="rounded-md bg-danger-bg px-3 py-2 text-danger-text">
                      <span className="font-semibold">Jawabanmu:</span>{" "}
                      {OPTION_LABELS[userAns]}. {q.options[userAns]}
                    </p>
                  )}
                  <p className="rounded-md bg-success-bg px-3 py-2 text-success-text">
                    <span className="font-semibold">Jawaban benar:</span>{" "}
                    {OPTION_LABELS[q.correctIndex]}. {q.options[q.correctIndex]}
                  </p>
                  {q.explanation && (
                    <p className="pt-1 leading-relaxed text-muted">{q.explanation}</p>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIdx + (hasAnswered ? 1 : 0)) / total) * 100);

  return (
    <div className="mx-auto max-w-[760px] p-4 md:p-8">
      <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
              <ListChecks className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold text-accent">
                Soal {currentIdx + 1} dari {total}
              </p>
              <p className="line-clamp-1 text-xs text-muted">{set.title}</p>
            </div>
          </div>

          <span className="rounded-full bg-surface-subtle px-3 py-1 text-xs font-semibold text-text">
            Benar: {correctCount}
          </span>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {questions.map((q, idx) => {
            const ans = answers[idx];
            const isCurrent = idx === currentIdx;
            let pillClass = "border-border bg-surface text-muted";
            if (ans !== undefined) {
              pillClass =
                ans === q.correctIndex
                  ? "border-success bg-success-bg text-success-text"
                  : "border-danger bg-danger-bg text-danger-text";
            } else if (isCurrent) {
              pillClass = "border-accent bg-accent text-on-accent";
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                className={`flex h-7 w-7 items-center justify-center rounded-md border text-xs font-semibold transition ${pillClass} ${
                  isCurrent ? "ring-2 ring-accent/30" : ""
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-lg font-bold leading-snug text-text md:text-xl">
          {current.question}
        </h1>

        <div className="mt-5 space-y-2.5">
          {current.options.map((opt, optIdx) => {
            const isSelected = selectedOption === optIdx;
            const isCorrectOpt = optIdx === current.correctIndex;

            let cardStyle =
              "border-border bg-surface text-text hover:border-accent/60 hover:bg-surface-subtle/50";
            let badgeStyle = "bg-surface-subtle text-text";

            if (hasAnswered) {
              if (isCorrectOpt) {
                cardStyle = "border-success bg-success-bg/70 text-success-text";
                badgeStyle = "bg-success text-on-success";
              } else if (isSelected && !isCorrectOpt) {
                cardStyle = "border-danger bg-danger-bg/70 text-danger-text";
                badgeStyle = "bg-danger text-on-danger";
              } else {
                cardStyle = "border-border bg-surface text-muted opacity-65";
              }
            }

            return (
              <button
                key={optIdx}
                type="button"
                disabled={hasAnswered}
                onClick={() => handleSelect(optIdx)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border-2 p-3.5 text-left text-sm font-medium transition ${cardStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${badgeStyle}`}
                  >
                    {OPTION_LABELS[optIdx] ?? optIdx + 1}
                  </span>
                  <span className="leading-snug">{opt}</span>
                </div>

                {hasAnswered && isCorrectOpt && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                )}
                {hasAnswered && isSelected && !isCorrectOpt && (
                  <XCircle className="h-5 w-5 shrink-0 text-danger" />
                )}
              </button>
            );
          })}
        </div>

        {hasAnswered && (
          <div
            className={`mt-5 rounded-lg border p-4 text-sm ${
              selectedOption === current.correctIndex
                ? "border-success/40 bg-success-bg/50 text-success-text"
                : "border-danger/40 bg-danger-bg/50 text-danger-text"
            }`}
          >
            <p className="font-semibold">
              {selectedOption === current.correctIndex
                ? "Tepat sekali!"
                : `Kurang tepat. Jawaban yang benar adalah ${OPTION_LABELS[current.correctIndex]}.`}
            </p>
            {current.explanation && (
              <p className="mt-1.5 text-xs leading-relaxed text-text/90">
                {current.explanation}
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted">
            {hasAnswered ? "Lanjut ke soal berikutnya" : "Pilih salah satu jawaban di atas"}
          </p>
          <Button onClick={handleNext} disabled={!hasAnswered}>
            {currentIdx + 1 < total ? "Soal Berikutnya" : "Lihat Hasil"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
    

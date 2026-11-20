"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getLocalSet } from "@/lib/data";

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<
    { id: string; prompt: string; options: string[]; correct_index: number; explanation: string }[]
  >([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const set = getLocalSet(id);
    setQuestions(set?.quiz ?? []);
  }, [id]);

  const score = questions.filter((q) => answers[q.id] === q.correct_index).length;

  return (
    <div className="mx-auto max-w-[720px] space-y-6 p-6">
      {submitted && (
        <div role="status" className="flex items-center justify-between rounded-lg border border-border bg-surface-subtle p-4">
          <p className="font-semibold">Skor kamu: {score} / {questions.length}</p>
          <Button size="sm" variant="secondary" onClick={() => { setAnswers({}); setSubmitted(false); }}>
            Ulangi Kuis
          </Button>
        </div>
      )}

      {questions.map((q, idx) => (
        <fieldset key={q.id} className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <legend className="font-semibold">{idx + 1}. {q.prompt}</legend>
          <div className="mt-4 space-y-2">
            {q.options.map((opt, oIdx) => {
              const picked = answers[q.id] === oIdx;
              const correct = oIdx === q.correct_index;
              let cls = "border-border bg-surface";
              if (submitted && correct) cls = "border-success bg-success-bg text-success-text";
              else if (submitted && picked && !correct) cls = "border-danger bg-danger-bg text-danger-text";
              else if (picked) cls = "border-accent bg-surface-subtle";

              return (
                <label key={oIdx} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm ${cls}`}>
                  <input
                    type="radio"
                    name={q.id}
                    disabled={submitted}
                    checked={picked}
                    onChange={() => setAnswers((p) => ({ ...p, [q.id]: oIdx }))}
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
          {submitted && (
            <p className="mt-3 rounded-md bg-surface-subtle p-3 text-xs text-muted">
              <strong className="text-text">Pembahasan:</strong> {q.explanation}
            </p>
          )}
        </fieldset>
      ))}

      {!submitted && questions.length > 0 && (
        <Button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < questions.length} className="w-full">
          Periksa Jawaban
        </Button>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { CheckCircle2, CircleHelp, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "@/types/learning";
import { InlineGlossaryText } from "./inline-glossary";

interface KnowledgeCheckProps {
  questions: QuizQuestion[];
  lessonId: string;
}

export function KnowledgeCheck({ questions, lessonId }: KnowledgeCheckProps) {
  const [revealedIds, setRevealedIds] = useState<string[]>([]);

  useEffect(() => setRevealedIds([]), [lessonId]);

  if (!questions.length) return null;

  const reveal = (questionId: string) => {
    setRevealedIds((ids) => (ids.includes(questionId) ? ids : [...ids, questionId]));
  };

  return (
    <section aria-labelledby="knowledge-check-heading" className="border-y border-border py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <CircleHelp aria-hidden="true" className="mt-0.5 size-5 text-forest" strokeWidth={1.8} />
          <div>
            <h2 id="knowledge-check-heading" className="text-xl font-semibold tracking-[-0.02em]">
              Kiểm tra mental model
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Tự trả lời trước, rồi mở lập luận mẫu để so sánh cách phân rã domain.
            </p>
          </div>
        </div>
        {revealedIds.length ? (
          <Button className="gap-2" onClick={() => setRevealedIds([])} size="sm" variant="ghost">
            <RotateCcw aria-hidden="true" className="size-4" />
            Làm lại
          </Button>
        ) : null}
      </div>

      <ol className="mt-5 divide-y divide-border">
        {questions.map((question, index) => {
          const isRevealed = revealedIds.includes(question.id);
          return (
            <li className="py-5" key={question.id}>
              <p className="font-medium leading-7">
                <span className="mr-2 font-semibold tabular-nums text-amber">{String(index + 1).padStart(2, "0")}</span>
                <InlineGlossaryText text={question.prompt} />
              </p>

              {question.options?.length ? (
                <ul className="mt-3 space-y-2 pl-8 text-sm text-muted-foreground">
                  {question.options.map((option) => (
                    <li key={option.id}><InlineGlossaryText text={option.label} /></li>
                  ))}
                </ul>
              ) : null}

              {!isRevealed ? (
                <Button className="mt-4" onClick={() => reveal(question.id)} size="sm" variant="outline">
                  Xem lập luận mẫu
                </Button>
              ) : (
                <div className="mt-4 flex gap-3 border-l-2 border-forest bg-forest-soft/40 px-4 py-3 text-sm leading-6">
                  <CheckCircle2 aria-hidden="true" className="mt-1 size-4 shrink-0 text-forest" />
                  <div>
                    <p className="font-semibold text-forest">
                      <InlineGlossaryText text={question.correctAnswer} />
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      <InlineGlossaryText text={question.explanation} />
                    </p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

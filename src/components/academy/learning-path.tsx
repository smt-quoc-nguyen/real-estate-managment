import { ArrowRight } from "lucide-react";

import type { LearningPathStep } from "./types";

export interface LearningPathProps {
  steps: LearningPathStep[];
  activeStepId?: string;
  completedStepIds?: string[];
  onStepSelect?: (step: LearningPathStep) => void;
  label?: string;
  className?: string;
}

export function LearningPath({
  steps,
  activeStepId,
  completedStepIds = [],
  onStepSelect,
  label = "Chu trình học domain",
  className,
}: LearningPathProps) {
  const completed = new Set(completedStepIds);

  return (
    <nav
      aria-label={label}
      className={`overflow-x-auto py-6 [scrollbar-width:thin] ${className ?? ""}`}
    >
      <ol className="flex min-w-max items-center gap-2 text-sm">
        {steps.map((step, index) => {
          const isActive = step.id === activeStepId;
          const isCompleted = completed.has(step.id);
          const stepClassName = `rounded-sm px-1 py-2 font-medium transition-colors ${
            isActive
              ? "text-[#0e513b] underline decoration-[#d2740a] decoration-2 underline-offset-8"
              : isCompleted
                ? "text-[#0e513b]"
                : "text-[#26262b]"
          }`;

          return (
            <li className="flex items-center gap-2" key={step.id}>
              {onStepSelect ? (
                <button
                  aria-current={isActive ? "step" : undefined}
                  className={`${stepClassName} hover:text-[#0e513b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e513b] focus-visible:ring-offset-2`}
                  onClick={() => onStepSelect(step)}
                  title={step.description}
                  type="button"
                >
                  {step.label}
                </button>
              ) : (
                <span aria-current={isActive ? "step" : undefined} className={stepClassName} title={step.description}>
                  {step.label}
                </span>
              )}
              {index < steps.length - 1 ? (
                <ArrowRight aria-hidden="true" className="size-4 text-[#d2740a]" strokeWidth={1.8} />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

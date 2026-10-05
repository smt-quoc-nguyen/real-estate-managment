"use client";

import { useId, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

import type { LessonCheckpointItem, LessonNavigationTarget } from "./types";

export interface LessonCheckpointsProps {
  items: LessonCheckpointItem[];
  completedIds?: string[];
  defaultCompletedIds?: string[];
  onCompletedChange?: (completedIds: string[]) => void;
  title?: string;
  description?: string;
  className?: string;
}

export function LessonCheckpoints({
  items,
  completedIds,
  defaultCompletedIds = [],
  onCompletedChange,
  title = "Checkpoint của bài học",
  description = "Tự kiểm tra trước khi chuyển sang phần tiếp theo.",
  className,
}: LessonCheckpointsProps) {
  const [internalCompletedIds, setInternalCompletedIds] = useState(defaultCompletedIds);
  const headingId = useId();
  const currentCompletedIds = completedIds ?? internalCompletedIds;
  const completed = useMemo(() => new Set(currentCompletedIds), [currentCompletedIds]);
  const completedCount = items.filter((item) => completed.has(item.id)).length;
  const percent = items.length ? (completedCount / items.length) * 100 : 0;

  const updateItem = (id: string, checked: boolean) => {
    const next = new Set(currentCompletedIds);
    if (checked) next.add(id);
    else next.delete(id);
    const nextIds = items.filter((item) => next.has(item.id)).map((item) => item.id);
    if (completedIds === undefined) setInternalCompletedIds(nextIds);
    onCompletedChange?.(nextIds);
  };

  return (
    <section
      aria-labelledby={headingId}
      className={`border-y border-[#e3ded2] py-7 ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <CheckCircle2 aria-hidden="true" className="size-5 text-[#0e513b]" strokeWidth={1.8} />
            <h2 id={headingId} className="text-xl font-semibold tracking-[-0.02em] text-[#202025]">
              {title}
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#67666b]">{description}</p>
        </div>

        <span className="text-sm font-medium tabular-nums text-[#0e513b]">
          {completedCount}/{items.length} hoàn thành
        </span>
      </div>

      <Progress
        aria-label="Tiến độ checkpoint"
        className="mt-5 h-1.5 bg-[#e6e1d6] [&>div]:bg-[#0e513b]"
        value={percent}
      />

      <ul className="mt-5 space-y-1">
        {items.map((item) => {
          const checkboxId = `checkpoint-${item.id}`;
          const isChecked = completed.has(item.id);

          return (
            <li className="flex gap-3 border-b border-[#efede6] py-3 last:border-b-0" key={item.id}>
              <Checkbox
                aria-describedby={item.description ? `${checkboxId}-description` : undefined}
                checked={isChecked}
                className="mt-0.5 border-[#8f8b81] data-[state=checked]:border-[#0e513b] data-[state=checked]:bg-[#0e513b]"
                id={checkboxId}
                onCheckedChange={(checked) => updateItem(item.id, checked === true)}
              />
              <div>
                <label className="cursor-pointer text-sm font-medium leading-5 text-[#34343a]" htmlFor={checkboxId}>
                  {item.label}
                </label>
                {item.description ? (
                  <p className="mt-1 text-sm leading-5 text-[#737178]" id={`${checkboxId}-description`}>
                    {item.description}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export interface LessonNavigatorProps {
  previous?: LessonNavigationTarget;
  next?: LessonNavigationTarget;
  onPrevious?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  className?: string;
}

function NavigationButton({
  target,
  direction,
  onClick,
  fallbackLabel,
}: {
  target?: LessonNavigationTarget;
  direction: "previous" | "next";
  onClick?: () => void;
  fallbackLabel: string;
}) {
  const isNext = direction === "next";
  const Icon = isNext ? ArrowRight : ArrowLeft;
  const label = target?.label ?? fallbackLabel;
  const content = (
    <>
      {!isNext ? <Icon aria-hidden="true" className="size-4 shrink-0" /> : null}
      <span className="min-w-0 text-left">
        {target?.eyebrow ? <span className="block text-[0.68rem] uppercase tracking-[0.08em] opacity-70">{target.eyebrow}</span> : null}
        <span className="block truncate">{label}</span>
      </span>
      {isNext ? <Icon aria-hidden="true" className="size-4 shrink-0" /> : null}
    </>
  );
  const className = `min-h-12 min-w-0 gap-3 px-4 sm:max-w-[19rem] ${isNext ? "bg-[#0e513b] text-white hover:bg-[#0a402f]" : "border-[#0e513b] text-[#0e513b] hover:bg-[#eef1ec]"}`;

  if (target?.href && !target.disabled) {
    return (
      <Button asChild className={className} variant={isNext ? "default" : "outline"}>
        <a href={target.href} onClick={onClick}>
          {content}
        </a>
      </Button>
    );
  }

  return (
    <Button
      className={className}
      disabled={target?.disabled || (!target && !onClick)}
      onClick={onClick}
      variant={isNext ? "default" : "outline"}
    >
      {content}
    </Button>
  );
}

export function LessonNavigator({
  previous,
  next,
  onPrevious,
  onNext,
  nextLabel = "Tiếp tục bài học",
  className,
}: LessonNavigatorProps) {
  return (
    <nav
      aria-label="Điều hướng bài học"
      className={`flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center ${className ?? ""}`}
    >
      <NavigationButton
        direction="previous"
        fallbackLabel="Bài trước"
        onClick={onPrevious}
        target={previous}
      />
      <NavigationButton direction="next" fallbackLabel={nextLabel} onClick={onNext} target={next} />
    </nav>
  );
}

export const Checkpoints = LessonCheckpoints;

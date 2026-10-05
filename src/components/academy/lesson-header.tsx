import type { ReactNode } from "react";
import { Bookmark, Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface LessonHeaderProps {
  eyebrow: ReactNode;
  title: ReactNode;
  summary: ReactNode;
  durationMinutes?: number;
  saved?: boolean;
  onSavedChange?: (saved: boolean) => void;
  saveLabel?: string;
  meta?: ReactNode;
  className?: string;
}

export function LessonHeader({
  eyebrow,
  title,
  summary,
  durationMinutes,
  saved = false,
  onSavedChange,
  saveLabel = "Lưu bài học",
  meta,
  className,
}: LessonHeaderProps) {
  return (
    <header className={`border-b border-[#e3ded2] pb-8 md:pb-10 ${className ?? ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <p className="text-sm font-semibold text-[#0e513b] md:text-base">{eyebrow}</p>

        <div className="flex flex-wrap items-center gap-2 text-sm text-[#5b5a60]">
          {durationMinutes ? (
            <span className="inline-flex items-center gap-2">
              <Clock3 aria-hidden="true" className="size-4" strokeWidth={1.8} />
              {durationMinutes} phút
            </span>
          ) : null}
          {meta}
          {onSavedChange ? (
            <Button
              aria-pressed={saved}
              className="gap-2 text-[#34343a] hover:bg-[#f2f0e9]"
              onClick={() => onSavedChange(!saved)}
              size="sm"
              variant="ghost"
            >
              <Bookmark
                aria-hidden="true"
                className={`size-4 ${saved ? "fill-[#0e513b] text-[#0e513b]" : ""}`}
                strokeWidth={1.8}
              />
              {saved ? "Đã lưu" : saveLabel}
            </Button>
          ) : null}
        </div>
      </div>

      <h1 className="mt-8 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-[#18181d] sm:text-5xl lg:text-[3.35rem]" id="lesson-title">
        {title}
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-[#37363b] md:text-xl">{summary}</p>
    </header>
  );
}

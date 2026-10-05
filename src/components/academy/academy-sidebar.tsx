"use client";

import { useState } from "react";
import {
  BookOpen,
  Boxes,
  Check,
  HelpCircle,
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import type { AcademyWeekNavItem } from "./types";

export interface AcademySidebarProps {
  weeks: AcademyWeekNavItem[];
  activeWeekId: string;
  progressPercent: number;
  onWeekSelect?: (week: AcademyWeekNavItem) => void;
  onGuideSelect?: () => void;
  courseTitle?: string;
  programLabel?: string;
  guideLabel?: string;
  className?: string;
}

interface SidebarContentProps extends AcademySidebarProps {
  onNavigate?: () => void;
}

function SidebarContent({
  weeks,
  activeWeekId,
  progressPercent,
  onWeekSelect,
  onGuideSelect,
  onNavigate,
  courseTitle = "PropertyOS Academy",
  programLabel = "12 tuần · Domain Atlas",
  guideLabel = "Hướng dẫn học",
}: SidebarContentProps) {
  const clampedProgress = Math.min(100, Math.max(0, progressPercent));

  const selectWeek = (week: AcademyWeekNavItem) => {
    if (week.disabled) return;
    onWeekSelect?.(week);
    onNavigate?.();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#fbfaf6] text-[#202025]">
      <div className="px-5 pb-4 pt-6 xl:px-7 xl:pt-8">
        <div className="flex items-center gap-3 text-[#0e513b]">
          <Boxes aria-hidden="true" className="size-8 shrink-0" strokeWidth={1.8} />
          <span className="text-lg font-semibold tracking-[-0.02em]">{courseTitle}</span>
        </div>

        <div className="mt-9" aria-label={`Tiến độ ${Math.round(clampedProgress)}%`}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>Tiến độ</span>
            <span className="font-medium tabular-nums">{Math.round(clampedProgress)}%</span>
          </div>
          <Progress
            aria-label="Tiến độ khóa học"
            className="h-1.5 bg-[#e6e1d6] [&>div]:bg-[#0e513b]"
            value={clampedProgress}
          />
        </div>

        <p className="mt-7 text-sm font-semibold text-[#0e513b]">{programLabel}</p>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-3 pb-4 xl:px-4">
        <nav aria-label="Các tuần học">
          <ol className="space-y-1">
            {weeks.map((week) => {
              const isActive = week.id === activeWeekId;
              const Icon = week.icon ?? BookOpen;
              const actionClassName = [
                "group flex min-h-12 w-full items-center gap-3 rounded-r-lg border-l-[3px] px-3 py-2.5 text-left text-sm transition-colors",
                isActive
                  ? "border-[#0e513b] bg-[#eef1ec] text-[#0d4735]"
                  : "border-transparent text-[#515158] hover:bg-[#f2f0e9] hover:text-[#202025]",
                week.disabled ? "cursor-not-allowed opacity-45" : "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e513b] focus-visible:ring-offset-2",
              ].join(" ");

              const content = (
                <>
                  <span className="w-6 shrink-0 tabular-nums text-[#56565d]">
                    {String(week.number).padStart(2, "0")}
                  </span>
                  <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.7} />
                  <span className="min-w-0 flex-1 truncate">{week.shortTitle ?? week.title}</span>
                  {week.completed ? (
                    <>
                      <Check aria-hidden="true" className="size-4 shrink-0 text-[#0e513b]" strokeWidth={2.2} />
                      <span className="sr-only">Đã hoàn thành</span>
                    </>
                  ) : null}
                </>
              );

              return (
                <li key={week.id}>
                  {week.href && !week.disabled ? (
                    <a
                      aria-current={isActive ? "page" : undefined}
                      className={actionClassName}
                      href={week.href}
                      onClick={() => selectWeek(week)}
                    >
                      {content}
                    </a>
                  ) : (
                    <button
                      aria-current={isActive ? "page" : undefined}
                      className={actionClassName}
                      disabled={week.disabled}
                      onClick={() => selectWeek(week)}
                      type="button"
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </ScrollArea>

      <div className="border-t border-[#e3ded2] p-4 xl:px-6">
        <Button
          className="w-full justify-start gap-3 text-[#515158] hover:bg-[#f2f0e9] hover:text-[#202025]"
          onClick={() => {
            onGuideSelect?.();
            onNavigate?.();
          }}
          variant="ghost"
        >
          <HelpCircle aria-hidden="true" className="size-5" strokeWidth={1.7} />
          {guideLabel}
        </Button>
      </div>
    </div>
  );
}

export function AcademySidebar(props: AcademySidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-[#e3ded2] bg-[#fbfaf6]/95 px-4 backdrop-blur lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button aria-label="Mở danh sách tuần học" size="icon" variant="ghost">
              <Menu aria-hidden="true" className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[min(88vw,21rem)] border-[#e3ded2] bg-[#fbfaf6] p-0" side="left">
            <SheetHeader className="sr-only">
              <SheetTitle>Điều hướng khóa học</SheetTitle>
              <SheetDescription>Chọn một tuần để mở nội dung học tương ứng.</SheetDescription>
            </SheetHeader>
            <SidebarContent {...props} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 items-center gap-2 text-[#0e513b]">
          <Boxes aria-hidden="true" className="size-6 shrink-0" strokeWidth={1.8} />
          <span className="truncate font-semibold tracking-[-0.02em]">
            {props.courseTitle ?? "PropertyOS Academy"}
          </span>
        </div>
      </div>

      <aside
        aria-label="Điều hướng khóa học"
        className={`hidden h-dvh w-[19rem] shrink-0 border-r border-[#e3ded2] lg:sticky lg:top-0 lg:block ${props.className ?? ""}`}
      >
        <SidebarContent {...props} />
      </aside>
    </>
  );
}

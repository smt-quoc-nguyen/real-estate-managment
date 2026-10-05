import { useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  BarChart3,
  BookOpenCheck,
  Building2,
  CalendarDays,
  ChartPie,
  CircleDollarSign,
  FileSignature,
  Flag,
  Gauge,
  Handshake,
  Landmark,
  Map as MapIcon,
  ReceiptText,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  AcademySidebar,
  DomainGlossaryProvider,
  GlossaryLearningHint,
  InlineGlossaryText,
  LearningPath,
  LessonCheckpoints,
  LessonHeader,
  LessonNavigator,
  RealWorldCase,
  RelationshipMap,
  SoftwareModelPanel,
  WhySection,
  type AcademyWeekNavItem,
  type LearningPathStep,
  type RelationshipMapItem,
} from "@/components/academy";
import { KnowledgeCheck } from "@/components/academy/knowledge-check";
import { LessonDeepDive } from "@/components/academy/lesson-deep-dive";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { curriculum } from "@/data/curriculum";
import { getGlossaryEntriesForDomain } from "@/data/glossary";
import { useAcademyProgress } from "@/hooks/use-academy-progress";
import { readLessonIdFromHash } from "@/lib/lesson-route";
import type { DomainKey, RelationKind } from "@/types/learning";

const DOMAIN_ICONS: Record<DomainKey, LucideIcon> = {
  space: MapIcon,
  lease: FileSignature,
  "billing-ar": ReceiptText,
  "finance-noi": BadgeDollarSign,
  occupancy: Users,
  facility: Wrench,
  "vendor-procurement": Handshake,
  "budget-reporting": ChartPie,
  "asset-investor": Landmark,
  coworking: CalendarDays,
  "flex-metrics": Gauge,
  capstone: Flag,
};

const LEARNING_PATH: LearningPathStep[] = [
  { id: "concept", label: "Concept", description: "Định nghĩa đúng vocabulary nghiệp vụ." },
  { id: "taxonomy", label: "Taxonomy", description: "Phân loại các biến thể và ranh giới." },
  { id: "relationship", label: "Relationship", description: "Đặt concept vào đúng bounded context." },
  { id: "invariant", label: "Invariant", description: "Nêu điều luôn phải đúng trong model." },
  { id: "lifecycle", label: "Lifecycle", description: "Theo dõi state và event làm concept thay đổi." },
  { id: "decision", label: "Business decision", description: "Giải thích actor dùng nó để quyết định gì." },
];

const RELATION_LABELS: Record<RelationKind, string> = {
  contains: "chứa",
  references: "tham chiếu",
  generates: "sinh ra",
  "derived-from": "được suy ra",
  precedes: "đứng trước",
  "classified-as": "được phân loại",
  "fulfilled-by": "được thực hiện bởi",
  "reported-through": "được báo cáo qua",
};

const ICON_RULES: Array<[RegExp, LucideIcon]> = [
  [/lease|contract|hợp đồng/i, FileSignature],
  [/booking|calendar|đặt/i, CalendarDays],
  [/maintenance|work order|facility|bảo trì/i, Wrench],
  [/occupancy|tenant|member|desk|người/i, Users],
  [/revenue|invoice|payment|charge|cash|money|doanh thu|tiền/i, CircleDollarSign],
  [/building|property|space|floor|room|unit/i, Building2],
  [/metric|report|noi|budget/i, BarChart3],
];

function iconFor(label: string) {
  return ICON_RULES.find(([rule]) => rule.test(label))?.[1] ?? BookOpenCheck;
}

export function App() {
  const lessonEntries = useMemo(
    () =>
      curriculum.weeks.flatMap((week) =>
        week.lessons.map((lesson) => ({ lesson, week })),
      ),
    [],
  );
  const allLessonIds = useMemo(
    () => lessonEntries.map(({ lesson }) => lesson.id),
    [lessonEntries],
  );
  const [activeLessonId, setActiveLessonId] = useState(() => {
    const hashLessonId = typeof window === "undefined" ? "" : readLessonIdFromHash(window.location.hash);
    return lessonEntries.some(({ lesson }) => lesson.id === hashLessonId)
      ? hashLessonId
      : lessonEntries[0]?.lesson.id ?? "";
  });
  const [activePathStep, setActivePathStep] = useState("concept");
  const [guideOpen, setGuideOpen] = useState(false);
  const [caseOpen, setCaseOpen] = useState(false);
  const [glossaryHintVisible, setGlossaryHintVisible] = useState(true);
  const progress = useAcademyProgress(allLessonIds);

  const activeIndex = Math.max(
    0,
    lessonEntries.findIndex(({ lesson }) => lesson.id === activeLessonId),
  );
  const activeEntry = lessonEntries[activeIndex] ?? lessonEntries[0];

  useEffect(() => {
    if (activeEntry) {
      document.title = `${activeEntry.lesson.title} · PropertyOS Academy`;
      const nextHash = `#${encodeURIComponent(activeEntry.lesson.id)}`;
      if (window.location.hash !== nextHash) {
        window.history.replaceState(null, "", nextHash);
      }
    }
  }, [activeEntry]);

  useEffect(() => {
    const restoreLessonFromHistory = () => {
      const lessonId = readLessonIdFromHash(window.location.hash);
      if (!lessonEntries.some(({ lesson }) => lesson.id === lessonId)) return;
      setActiveLessonId(lessonId);
      setActivePathStep("concept");
      window.requestAnimationFrame(() => {
        document.getElementById("lesson-content")?.focus({ preventScroll: true });
      });
    };

    window.addEventListener("popstate", restoreLessonFromHistory);
    window.addEventListener("hashchange", restoreLessonFromHistory);
    return () => {
      window.removeEventListener("popstate", restoreLessonFromHistory);
      window.removeEventListener("hashchange", restoreLessonFromHistory);
    };
  }, [lessonEntries]);

  if (!activeEntry) {
    return <main className="grid min-h-dvh place-items-center">Curriculum chưa có bài học.</main>;
  }

  const { lesson: activeLesson, week: activeWeek } = activeEntry;
  const activeGlossaryEntries = getGlossaryEntriesForDomain(activeWeek.domain);
  const previousEntry = activeIndex > 0 ? lessonEntries[activeIndex - 1] : undefined;
  const nextEntry = activeIndex < lessonEntries.length - 1 ? lessonEntries[activeIndex + 1] : undefined;
  const activeExample = activeLesson.examples[0];
  const activeModel = activeLesson.softwareModels[0];
  const activeConcept = activeLesson.concepts[0];
  const isLastLessonOfWeek = activeWeek.lessons.at(-1)?.id === activeLesson.id;
  const validWeekCheckpointIds = activeWeek.checkpointQuestions.map(
    (_, index) => `${activeWeek.id}-checkpoint-${index}`,
  );
  const activeWeekCheckpointIds = progress
    .getWeekCheckpointIds(activeWeek.id)
    .filter((id) => validWeekCheckpointIds.includes(id));
  const weekCheckpointComplete =
    validWeekCheckpointIds.length > 0 &&
    activeWeekCheckpointIds.length === validWeekCheckpointIds.length;
  const canAdvance = !isLastLessonOfWeek || weekCheckpointComplete;

  const relationshipCounts = activeLesson.relations.reduce<Map<string, number>>(
    (counts, relation) => {
      counts.set(relation.from, (counts.get(relation.from) ?? 0) + 1);
      counts.set(relation.to, (counts.get(relation.to) ?? 0) + 1);
      return counts;
    },
    new Map(),
  );
  const relationshipTargetLabel =
    [...relationshipCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
    activeConcept?.term ??
    activeWeek.title;
  const relationshipTargetConcept = activeLesson.concepts.find((concept) =>
    concept.term.toLocaleLowerCase("vi").includes(relationshipTargetLabel.toLocaleLowerCase("vi")),
  );

  const navWeeks: AcademyWeekNavItem[] = curriculum.weeks.map((week) => ({
    id: week.id,
    number: week.number,
    title: week.title,
    shortTitle: week.title,
    icon: DOMAIN_ICONS[week.domain],
    completed: week.lessons.every((lesson) => progress.isComplete(lesson.id)),
  }));
  const bookmarkedEntries = lessonEntries.filter(({ lesson }) =>
    progress.isBookmarked(lesson.id),
  );

  const directRelationships = activeLesson.relations.filter(
    (relation) =>
      relation.from === relationshipTargetLabel || relation.to === relationshipTargetLabel,
  );
  const relatedItems: RelationshipMapItem[] = directRelationships.slice(0, 5).map((relation) => {
    const relatedLabel =
      relation.from === relationshipTargetLabel
        ? relation.to
        : relation.to === relationshipTargetLabel
          ? relation.from
          : relation.to;
    return {
      id: relation.id,
      label: relatedLabel,
      description: relation.explanation,
      explanation: `${relation.from} → ${relation.to}`,
      relation: RELATION_LABELS[relation.kind] ?? relation.kind,
      icon: iconFor(relatedLabel),
    };
  });

  const selectLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setActivePathStep("concept");
    const nextHash = `#${encodeURIComponent(lessonId)}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash);
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    window.requestAnimationFrame(() => {
      document.getElementById("lesson-content")?.focus({ preventScroll: true });
    });
  };

  const selectWeek = (weekNav: AcademyWeekNavItem) => {
    const week = curriculum.weeks.find((item) => item.id === weekNav.id);
    if (!week) return;
    const firstIncomplete = week.lessons.find((lesson) => !progress.isComplete(lesson.id));
    const targetLesson = firstIncomplete ?? week.lessons[0];
    if (targetLesson) selectLesson(targetLesson.id);
  };

  const continueLesson = () => {
    progress.markComplete(activeLesson.id);
    if (nextEntry) selectLesson(nextEntry.lesson.id);
  };

  const startDeepDive = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("lesson-deep-dive")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <DomainGlossaryProvider entries={activeGlossaryEntries} scopeKey={activeLesson.id}>
    <div className="min-h-dvh bg-background lg:flex">
      <AcademySidebar
        activeWeekId={activeWeek.id}
        courseTitle={curriculum.title}
        onGuideSelect={() => setGuideOpen(true)}
        onWeekSelect={selectWeek}
        programLabel={`${curriculum.totalWeeks} tuần · Domain Atlas`}
        progressPercent={progress.progressPercent}
        weeks={navWeeks}
      />

      <div className="min-w-0 flex-1">
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_28rem] 2xl:grid-cols-[minmax(0,1fr)_31rem]">
          <main
            aria-labelledby="lesson-title"
            className="min-w-0 px-5 py-8 outline-none sm:px-8 md:px-12 md:py-11 xl:px-12 2xl:px-16"
            id="lesson-content"
            tabIndex={-1}
          >
            <p aria-live="polite" className="sr-only">
              Đã mở {activeLesson.title}, Tuần {activeWeek.number}.
            </p>
            <div className="mb-7 xl:hidden">
              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-forest" htmlFor="lesson-jump">
                Bài học trong tuần {activeWeek.number}
              </label>
              <select
                className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id="lesson-jump"
                onChange={(event) => selectLesson(event.target.value)}
                value={activeLesson.id}
              >
                {activeWeek.lessons.map((lesson, index) => (
                  <option key={lesson.id} value={lesson.id}>
                    {index + 1}. {lesson.title}
                  </option>
                ))}
              </select>
            </div>

            <LessonHeader
              durationMinutes={activeLesson.durationMinutes}
              eyebrow={`Tuần ${activeWeek.number} · ${activeWeek.title}`}
              onSavedChange={() => progress.toggleBookmark(activeLesson.id)}
              saved={progress.isBookmarked(activeLesson.id)}
              summary={<InlineGlossaryText text={activeLesson.summary} />}
              title={activeLesson.title}
            />

            {glossaryHintVisible ? (
              <GlossaryLearningHint
                className="mt-6"
                onDismiss={() => setGlossaryHintVisible(false)}
              />
            ) : null}

            <LearningPath
              activeStepId={activePathStep}
              completedStepIds={LEARNING_PATH.slice(
                0,
                Math.max(0, LEARNING_PATH.findIndex((step) => step.id === activePathStep)),
              ).map((step) => step.id)}
              onStepSelect={(step) => setActivePathStep(step.id)}
              steps={LEARNING_PATH}
            />
            <p className="border-t border-border pt-5 text-sm leading-6 text-muted-foreground" aria-live="polite">
              <strong className="text-forest">
                {LEARNING_PATH.find((step) => step.id === activePathStep)?.label ? (
                  LEARNING_PATH.find((step) => step.id === activePathStep)?.label
                ) : null}
                :{" "}
              </strong>
              {LEARNING_PATH.find((step) => step.id === activePathStep)?.description ? (
                <InlineGlossaryText
                  text={LEARNING_PATH.find((step) => step.id === activePathStep)?.description ?? ""}
                />
              ) : null}
            </p>

            <div className="mt-8 border-y border-border py-7 xl:hidden">
              <RelationshipMap
                description={`Các khái niệm trong bài cùng quy chiếu về ${relationshipTargetLabel}.`}
                relationships={relatedItems}
                target={{
                  description: relationshipTargetConcept?.definition ?? activeLesson.summary,
                  icon: iconFor(relationshipTargetLabel),
                  id: relationshipTargetConcept?.id ?? `${activeWeek.id}-relationship-target-mobile`,
                  label: relationshipTargetLabel,
                }}
              />
            </div>

            <WhySection
              className="mt-8"
              takeaway={activeLesson.invariants[0]}
            >
              <p><InlineGlossaryText text={activeLesson.why} /></p>
            </WhySection>

            {activeLesson.examples.length ? (
              <div className="mt-9 space-y-7" aria-label="Các ví dụ thực tế của bài học">
                {activeLesson.examples.map((example) => (
                  <RealWorldCase
                    context={<InlineGlossaryText text={example.context} />}
                    facts={example.numbers?.map((number) => ({
                      value: number,
                    }))}
                    key={example.title}
                    outcome={<InlineGlossaryText text={example.outcome} />}
                    scenario={<InlineGlossaryText text={example.scenario} />}
                    title={example.title}
                  />
                ))}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button className="min-h-12 flex-1" onClick={startDeepDive} size="lg">
                Tiếp tục bài học
              </Button>
              <Button
                className="min-h-12 flex-1 border-forest text-forest hover:bg-forest-soft/50"
                disabled={!activeExample}
                onClick={() => setCaseOpen(true)}
                size="lg"
                variant="outline"
              >
                Mở case thực tế
              </Button>
            </div>

            <LessonDeepDive lesson={activeLesson} />

            {activeLesson.softwareModels.map((model) => (
              <SoftwareModelPanel
                className="mt-9"
                code={model.code}
                explanation={<InlineGlossaryText text={model.explanation} />}
                key={model.title}
                language={model.language}
                modelNote={
                  <InlineGlossaryText text="Model là một cách biểu diễn business rule; hãy kiểm tra invariant và lifecycle trước khi chọn class hay table." />
                }
                title={model.title}
              />
            ))}

            <KnowledgeCheck lessonId={activeLesson.id} questions={activeLesson.quiz} />

            {isLastLessonOfWeek ? (
              <LessonCheckpoints
                className="mt-9"
                completedIds={activeWeekCheckpointIds}
                description={`Hoàn tất ${activeWeek.checkpointQuestions.length} câu hỏi để khóa mental model của Tuần ${activeWeek.number}.`}
                items={activeWeek.checkpointQuestions.map((question, index) => ({
                  id: `${activeWeek.id}-checkpoint-${index}`,
                  label: question,
                }))}
                onCompletedChange={(ids) => {
                  progress.setWeekCheckpoints(activeWeek.id, ids);
                  if (ids.length === activeWeek.checkpointQuestions.length) {
                    progress.markComplete(activeLesson.id);
                  } else {
                    progress.markIncomplete(activeLesson.id);
                  }
                }}
                title={`Checkpoint cuối tuần · Tuần ${activeWeek.number}`}
              />
            ) : null}

            <LessonNavigator
              className="mt-8"
              next={
                nextEntry
                  ? {
                      eyebrow: `Tuần ${nextEntry.week.number}`,
                      label:
                        isLastLessonOfWeek && !weekCheckpointComplete
                          ? "Hoàn tất checkpoint để tiếp tục"
                          : nextEntry.lesson.title,
                      disabled: !canAdvance,
                    }
                  : { label: "Bạn đã đi hết Domain Atlas", disabled: true }
              }
              onNext={nextEntry && canAdvance ? continueLesson : undefined}
              onPrevious={previousEntry ? () => selectLesson(previousEntry.lesson.id) : undefined}
              previous={
                previousEntry
                  ? {
                      eyebrow: `Tuần ${previousEntry.week.number}`,
                      label: previousEntry.lesson.title,
                    }
                  : undefined
              }
            />
          </main>

          <aside className="border-t border-border bg-[#fffefa] px-5 py-8 sm:px-8 md:px-12 xl:sticky xl:top-0 xl:h-dvh xl:overflow-y-auto xl:border-l xl:border-t-0 xl:px-8 xl:py-12">
            <div className="hidden xl:block">
              <RelationshipMap
                description={`Các khái niệm trong bài cùng quy chiếu về ${relationshipTargetLabel}.`}
                relationships={relatedItems}
                target={{
                  description: relationshipTargetConcept?.definition ?? activeLesson.summary,
                  icon: iconFor(relationshipTargetLabel),
                  id: relationshipTargetConcept?.id ?? `${activeWeek.id}-relationship-target`,
                  label: relationshipTargetLabel,
                }}
              />
            </div>

            <details className="mt-8 hidden border-t border-border pt-5 xl:block">
              <summary className="cursor-pointer list-none text-sm font-semibold text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Toàn bộ relationship graph ({activeLesson.relations.length})
              </summary>
              <ul className="mt-4 divide-y divide-border text-sm">
                {activeLesson.relations.map((relation) => (
                  <li className="py-3" key={relation.id}>
                    <p className="font-medium text-foreground">
                      {relation.from}{" "}
                      <span className="font-semibold text-amber">
                        → {RELATION_LABELS[relation.kind] ?? relation.kind} →
                      </span>{" "}
                      {relation.to}
                    </p>
                    <p className="mt-1 leading-5 text-muted-foreground">
                      <InlineGlossaryText text={relation.explanation} />
                    </p>
                  </li>
                ))}
              </ul>
            </details>

            <section className="mt-10 border-t border-border pt-7" aria-labelledby="lesson-list-heading">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber">
                Mục tiêu tuần {activeWeek.number} · {activeWeek.estimatedHours} giờ
              </p>
              <h2 className="mt-2 text-lg font-semibold text-forest" id="lesson-list-heading">
                {activeWeek.subtitle}
              </h2>
              <ol className="mt-5 divide-y divide-border">
                {activeWeek.lessons.map((lesson, index) => {
                  const isActive = lesson.id === activeLesson.id;
                  return (
                    <li key={lesson.id}>
                      <button
                        aria-current={isActive ? "step" : undefined}
                        className={`flex w-full gap-3 py-4 text-left text-sm transition-colors ${
                          isActive ? "text-forest" : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => selectLesson(lesson.id)}
                        type="button"
                      >
                        <span className="font-semibold tabular-nums">{activeWeek.number}.{index + 1}</span>
                        <span>
                          <strong className="block font-semibold text-current">{lesson.title}</strong>
                          <span className="mt-1 block leading-5">{lesson.durationMinutes} phút</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-6 border-l-2 border-amber pl-4 text-sm leading-6 text-muted-foreground">
                <strong className="block text-foreground">Deliverable</strong>
                <InlineGlossaryText text={activeWeek.deliverable} />
              </div>

              <details className="group mt-7 border-t border-border pt-5">
                <summary className="cursor-pointer list-none text-sm font-semibold text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Why & mục tiêu tuần
                </summary>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  <InlineGlossaryText text={activeWeek.why} />
                </p>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                  {activeWeek.learningObjectives.map((objective) => (
                    <li className="flex gap-2" key={objective}>
                      <span aria-hidden="true" className="text-amber">•</span>
                      <span><InlineGlossaryText text={objective} /></span>
                    </li>
                  ))}
                </ul>
              </details>

              <details className="group mt-5 border-t border-border pt-5">
                <summary className="cursor-pointer list-none text-sm font-semibold text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Nguồn nên đọc
                </summary>
                <ul className="mt-4 space-y-3 text-sm leading-6">
                  {activeWeek.sourceSuggestions.map((source) => (
                    <li key={source.url}>
                      <a
                        className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-forest hover:decoration-forest"
                        href={source.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </section>
          </aside>
        </div>

        <footer className="flex items-start gap-3 border-t border-border bg-[#fffefa] px-5 py-4 text-sm leading-6 text-muted-foreground sm:px-8 md:px-12">
          <BookOpenCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-forest" />
          <p>
            <strong className="text-foreground">Ghi nhớ:</strong>{" "}
            {activeLesson.invariants[0] ?? activeLesson.why}
          </p>
        </footer>
      </div>

      <Sheet open={guideOpen} onOpenChange={setGuideOpen}>
        <SheetContent className="w-[min(92vw,38rem)] gap-0 overflow-y-auto bg-background sm:max-w-[38rem]" side="right">
          <SheetHeader>
            <SheetTitle>Học domain như một Product Engineer</SheetTitle>
            <SheetDescription>
              {curriculum.description}
            </SheetDescription>
          </SheetHeader>
          <dl className="mx-6 grid gap-4 border-l-2 border-amber pl-4 text-sm leading-6 sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-forest">Dành cho ai?</dt>
              <dd className="mt-1 text-muted-foreground">{curriculum.audience}</dd>
            </div>
            <div>
              <dt className="font-semibold text-forest">Học xong làm được gì?</dt>
              <dd className="mt-1 text-muted-foreground">{curriculum.outcome}</dd>
            </div>
          </dl>
          <section className="mx-6 border-t border-border pt-5" aria-labelledby="bookmarks-heading">
            <h3 className="font-semibold text-forest" id="bookmarks-heading">Bài học đã lưu</h3>
            {bookmarkedEntries.length ? (
              <ul className="mt-3 divide-y divide-border">
                {bookmarkedEntries.map(({ lesson, week }) => (
                  <li key={lesson.id}>
                    <button
                      className="w-full py-3 text-left text-sm transition-colors hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => {
                        selectLesson(lesson.id);
                        setGuideOpen(false);
                      }}
                      type="button"
                    >
                      <span className="block font-semibold">{lesson.title}</span>
                      <span className="mt-1 block text-muted-foreground">Tuần {week.number} · {week.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Dùng “Lưu bài học” ở đầu lesson để tạo danh sách quay lại nhanh.
              </p>
            )}
          </section>
          <ol className="mx-6 mt-8 divide-y divide-border border-y border-border">
            {curriculum.learningLoop.map((step, index) => (
              <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 py-3 text-sm leading-6" key={step}>
                <span className="font-semibold tabular-nums text-amber">{String(index + 1).padStart(2, "0")}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <ol className="mx-6 mt-8 space-y-6">
            {curriculum.modules.map((module) => (
              <li className="border-t border-border pt-5" key={module.id}>
                <h3 className="font-semibold text-forest">{module.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.description}</p>
                <p className="mt-3 text-sm font-medium">
                  Tuần {module.weekIds.map((id) => curriculum.weeks.find((week) => week.id === id)?.number).join(" · ")}
                </p>
              </li>
            ))}
          </ol>
          <div className="mx-6 mb-8 mt-8 border-l-2 border-amber pl-4 text-sm leading-6 text-muted-foreground">
            Mỗi tuần kết thúc bằng một deliverable. Why: tạo artifact buộc bạn biến vocabulary thành decision và model có thể review.
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={caseOpen} onOpenChange={setCaseOpen}>
        <SheetContent className="w-[min(96vw,44rem)] gap-0 overflow-y-auto bg-background sm:max-w-[44rem]" side="right">
          <SheetHeader>
            <SheetTitle>{activeExample?.title ?? "Case thực tế"}</SheetTitle>
            <SheetDescription>{activeExample?.context}</SheetDescription>
          </SheetHeader>
          {activeExample ? (
            <div className="mx-6 mb-8 mt-8 space-y-7">
              <section>
                <h3 className="font-semibold text-forest">Tình huống</h3>
                <p className="mt-2 leading-7 text-foreground/80">{activeExample.scenario}</p>
              </section>
              <section className="border-l-2 border-amber pl-4">
                <h3 className="font-semibold">Kết quả nghiệp vụ</h3>
                <p className="mt-2 leading-7 text-muted-foreground">{activeExample.outcome}</p>
              </section>
              {activeModel ? (
                <SoftwareModelPanel
                  code={activeModel.code}
                  explanation={activeModel.explanation}
                  language={activeModel.language}
                  title={activeModel.title}
                />
              ) : null}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
    </DomainGlossaryProvider>
  );
}

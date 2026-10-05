"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BookOpenText, X } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { GlossaryEntry } from "@/types/glossary";

export type { GlossaryEntry } from "@/types/glossary";

export type InlineGlossaryEntry = GlossaryEntry;

interface GlossaryDetailsContextValue {
  claimSegments: (
    instanceId: string,
    text: string,
    segments: InlineGlossarySegment[],
    group: GlossaryHighlightGroupName,
  ) => InlineGlossarySegment[];
  consumeRestoredFocus: (trigger: HTMLButtonElement | null) => boolean;
  openEntry: (entry: GlossaryEntry, trigger: HTMLButtonElement | null) => void;
  entries: readonly GlossaryEntry[];
  releaseSegments: (instanceId: string) => void;
}

const GlossaryDetailsContext = createContext<GlossaryDetailsContextValue | null>(null);
const GlossaryHighlightGroupContext = createContext<GlossaryHighlightGroupName>("overview");
const useCommittedLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export type GlossaryHighlightGroupName =
  | "overview"
  | "concept-headings"
  | "concept-details"
  | "lifecycle"
  | "metrics"
  | "edge-cases";

export interface GlossaryHighlightGroupProps {
  children: ReactNode;
  name: GlossaryHighlightGroupName;
}

export function GlossaryHighlightGroup({ children, name }: GlossaryHighlightGroupProps) {
  return (
    <GlossaryHighlightGroupContext.Provider value={name}>
      {children}
    </GlossaryHighlightGroupContext.Provider>
  );
}

export interface DomainGlossaryProviderProps {
  children: ReactNode;
  entries: readonly GlossaryEntry[];
  maxHighlightedTerms?: number;
  scopeKey?: string;
}

/**
 * One provider owns tooltip timing and a single touch/keyboard-friendly detail
 * sheet. Keeping the sheet global prevents one dialog instance per keyword.
 */
export function DomainGlossaryProvider({
  children,
  entries,
  maxHighlightedTerms = 15,
  scopeKey,
}: DomainGlossaryProviderProps) {
  const [activeEntry, setActiveEntry] = useState<GlossaryEntry | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const restoredFocusRef = useRef<HTMLButtonElement | null>(null);
  const highlightBudgetRef = useRef({
    allocator: createGlossaryHighlightBudget(maxHighlightedTerms),
    maxHighlightedTerms,
    scopeKey,
  });

  if (
    highlightBudgetRef.current.scopeKey !== scopeKey ||
    highlightBudgetRef.current.maxHighlightedTerms !== maxHighlightedTerms
  ) {
    highlightBudgetRef.current = {
      allocator: createGlossaryHighlightBudget(maxHighlightedTerms),
      maxHighlightedTerms,
      scopeKey,
    };
  }
  const highlightAllocator = highlightBudgetRef.current.allocator;

  useEffect(() => {
    setDetailsOpen(false);
    setActiveEntry(null);
  }, [scopeKey]);

  const openEntry = useCallback((entry: GlossaryEntry, trigger: HTMLButtonElement | null) => {
    lastTriggerRef.current = trigger;
    setActiveEntry(entry);
    setDetailsOpen(true);
  }, []);

  const consumeRestoredFocus = useCallback((trigger: HTMLButtonElement | null) => {
    if (!trigger || restoredFocusRef.current !== trigger) return false;
    restoredFocusRef.current = null;
    return true;
  }, []);

  const claimSegments = useCallback(
    (
      instanceId: string,
      text: string,
      segments: InlineGlossarySegment[],
      group: GlossaryHighlightGroupName,
    ) => highlightAllocator.apply(instanceId, text, segments, group),
    [highlightAllocator],
  );
  const releaseSegments = useCallback(
    (instanceId: string) => highlightAllocator.release(instanceId),
    [highlightAllocator],
  );
  const contextValue = useMemo(
    () => ({ claimSegments, consumeRestoredFocus, entries, openEntry, releaseSegments }),
    [claimSegments, consumeRestoredFocus, entries, openEntry, releaseSegments],
  );

  return (
    <GlossaryDetailsContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={220} skipDelayDuration={120}>
        {children}
      </TooltipProvider>

      <Sheet
        onOpenChange={setDetailsOpen}
        open={detailsOpen}
      >
        <SheetContent
          className="w-[min(92vw,29rem)] gap-0 overflow-y-auto bg-background sm:max-w-[29rem]"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const trigger = lastTriggerRef.current;
            if (!trigger?.isConnected) return;

            // Radix restores focus when the sheet closes. Suppress the tooltip
            // opened by that synthetic focus so the learner returns to a clean page.
            restoredFocusRef.current = trigger;
            trigger.focus();
            window.requestAnimationFrame(() => {
              if (restoredFocusRef.current === trigger) restoredFocusRef.current = null;
            });
          }}
          side="right"
        >
          <SheetHeader className="border-b border-border pr-12">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber">
              Từ điển Property Management
            </p>
            <SheetTitle className="text-2xl text-forest">{activeEntry?.label}</SheetTitle>
            <SheetDescription>
              {activeEntry?.vietnameseLabel ?? "Giải thích bằng tiếng Việt, theo đúng ngữ cảnh bài học."}
            </SheetDescription>
          </SheetHeader>

          {activeEntry ? (
            <div className="space-y-7 px-5 py-6">
              <section aria-labelledby="glossary-definition-heading">
                <h3 className="font-semibold text-forest" id="glossary-definition-heading">
                  Hiểu đơn giản
                </h3>
                <p className="mt-2 leading-7 text-foreground/80">{activeEntry.definition}</p>
              </section>

              {activeEntry.example ? (
                <section
                  aria-labelledby="glossary-example-heading"
                  className="border border-[#edc983] bg-[#fffaf0] px-4 py-4"
                >
                  <h3 className="font-semibold text-[#8f4605]" id="glossary-example-heading">
                    Ví dụ để dễ hình dung
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#514b43]">{activeEntry.example}</p>
                </section>
              ) : null}

              <p className="border-l-2 border-forest pl-4 text-sm leading-6 text-muted-foreground">
                Why: cùng một từ có thể mang nghĩa khác ngoài đời; phần giải thích này chỉ dùng nghĩa trong domain Property Management.
              </p>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </GlossaryDetailsContext.Provider>
  );
}

export interface GlossaryLearningHintProps {
  className?: string;
  onDismiss?: () => void;
}

export function GlossaryLearningHint({ className, onDismiss }: GlossaryLearningHintProps) {
  return (
    <aside
      className={`flex gap-3 border border-[#ead6a9] bg-amber-soft/40 px-4 py-3 text-sm leading-6 text-foreground/75 ${className ?? ""}`}
      aria-label="Hướng dẫn sử dụng chú giải thuật ngữ"
    >
      <BookOpenText aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber" strokeWidth={1.8} />
      <p className="min-w-0 flex-1">
        <strong className="text-forest">Hỗ trợ người mới:</strong> từ khóa màu xanh có gạch chấm. Rê chuột hoặc nhấn Tab để xem nhanh; chạm hay nhấn Enter để mở giải thích đầy đủ.
      </p>
      {onDismiss ? (
        <button
          aria-label="Ẩn hướng dẫn chú giải"
          className="-mr-1 grid size-8 shrink-0 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/70"
          onClick={onDismiss}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      ) : null}
    </aside>
  );
}

export interface InlineGlossaryTermProps {
  entry: InlineGlossaryEntry;
  children?: string;
  className?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * One accessible glossary term. Radix handles hover, focus, Escape and outside
 * dismissal; the explicit click handler makes the same explanation available
 * on touch devices where hover does not exist.
 */
export function InlineGlossaryTerm({
  entry,
  children,
  className,
  open,
  defaultOpen = false,
  onOpenChange,
}: InlineGlossaryTermProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const glossaryDetails = useContext(GlossaryDetailsContext);
  const isOpen = open ?? internalOpen;
  const visibleTerm = children ?? entry.label;

  const setOpen = (nextOpen: boolean) => {
    if (nextOpen && glossaryDetails?.consumeRestoredFocus(triggerRef.current)) return;
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <Tooltip open={isOpen} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            aria-haspopup="dialog"
            aria-label={`${visibleTerm}. Mở giải thích tiếng Việt`}
            className={`inline cursor-help rounded-[0.18rem] border-0 bg-transparent p-0 align-baseline text-forest underline decoration-amber decoration-dotted decoration-2 underline-offset-[3px] transition-colors hover:bg-amber-soft/55 hover:text-[#7a3c05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/70 focus-visible:ring-offset-2 ${className ?? ""}`}
            onClick={() => {
              if (glossaryDetails) {
                setOpen(false);
                glossaryDetails.openEntry(entry, triggerRef.current);
              } else {
                setOpen(true);
              }
            }}
            ref={triggerRef}
            type="button"
          >
            {visibleTerm}
          </button>
        </TooltipTrigger>

        <TooltipContent
          align="center"
          collisionPadding={12}
          className="max-h-[min(24rem,calc(100dvh-1.5rem))] max-w-[min(20rem,calc(100vw-1.5rem))] overflow-y-auto rounded-sm border border-forest/20 bg-background p-0 text-foreground shadow-xl"
          side="top"
          sideOffset={8}
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-amber">
              Thuật ngữ
            </p>
            <p className="mt-1 text-sm font-semibold leading-5 text-forest">{entry.label}</p>
            {entry.vietnameseLabel ? (
              <p className="mt-1 text-xs font-medium text-foreground/75">{entry.vietnameseLabel}</p>
            ) : null}
          </div>

          <dl className="px-4 py-3 text-[0.8125rem] leading-5">
            <div>
              <dt className="font-semibold text-foreground">Định nghĩa</dt>
              <dd className="mt-0.5 text-muted-foreground">{summarizeForTooltip(entry.definition)}</dd>
            </div>
          </dl>
          {entry.example ? (
            <p className="border-t border-border px-4 py-2 text-xs font-medium text-amber">
              Nhấp, chạm hoặc nhấn Enter để xem ví dụ thực tế.
            </p>
          ) : null}
        </TooltipContent>
      </Tooltip>
  );
}

function summarizeForTooltip(definition: string, maxLength = 180) {
  const normalized = definition.trim();
  if (normalized.length <= maxLength) return normalized;

  const sentence = normalized.match(/^.*?[.!?](?:\s|$)/u)?.[0]?.trim();
  if (sentence && sentence.length <= maxLength) return sentence;

  const clipped = normalized.slice(0, maxLength - 1);
  const lastWordBoundary = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, Math.max(lastWordBoundary, maxLength - 24)).trimEnd()}…`;
}

interface GlossaryCandidate {
  entry: InlineGlossaryEntry;
  alias: string;
  normalizedAlias: string;
  entryOrder: number;
  aliasOrder: number;
  caseSensitive: boolean;
}

interface PlainTextSegment {
  kind: "text";
  value: string;
}

interface GlossaryTermSegment {
  kind: "term";
  value: string;
  entry: InlineGlossaryEntry;
}

export type InlineGlossarySegment = PlainTextSegment | GlossaryTermSegment;

export interface GlossaryHighlightBudget {
  apply: (
    instanceId: string,
    text: string,
    segments: InlineGlossarySegment[],
    group?: GlossaryHighlightGroupName,
  ) => InlineGlossarySegment[];
  release: (instanceId: string) => void;
}

function mergePlainTextSegments(segments: InlineGlossarySegment[]) {
  return segments.reduce<InlineGlossarySegment[]>((merged, segment) => {
    const previous = merged.at(-1);
    if (segment.kind === "text" && previous?.kind === "text") {
      merged[merged.length - 1] = {
        kind: "text",
        value: previous.value + segment.value,
      };
    } else {
      merged.push(segment.kind === "text" ? { ...segment } : segment);
    }
    return merged;
  }, []);
}

/**
 * Allocates a small, deterministic set of glossary triggers for one lesson.
 * Incidental terms are interactive only at their first teaching occurrence.
 * Concept headings keep a small reserved budget, so every lesson's core terms
 * remain discoverable without creating dozens of extra keyboard tab stops.
 */
export function createGlossaryHighlightBudget(maxTerms = 15): GlossaryHighlightBudget {
  const safeMaxTerms = Math.max(0, Math.floor(maxTerms));
  const entryClaimCounts = new Map<string, number>();
  const headingEntryClaimCounts = new Map<string, number>();
  let totalClaimCount = 0;
  const assignments = new Map<
    string,
    { text: string; entryIds: Set<string>; group: GlossaryHighlightGroupName }
  >();
  const groupCounts = new Map<GlossaryHighlightGroupName, number>();
  const groupLimits: Record<GlossaryHighlightGroupName, number> = {
    overview: 6,
    "concept-headings": 5,
    "concept-details": 1,
    lifecycle: 1,
    metrics: 1,
    "edge-cases": 1,
  };

  const release = (instanceId: string) => {
    const assignment = assignments.get(instanceId);
    if (!assignment) return;

    assignment.entryIds.forEach((entryId) => {
      const nextClaimCount = Math.max(0, (entryClaimCounts.get(entryId) ?? 0) - 1);
      if (nextClaimCount) entryClaimCounts.set(entryId, nextClaimCount);
      else entryClaimCounts.delete(entryId);

      if (assignment.group === "concept-headings") {
        const nextHeadingCount = Math.max(
          0,
          (headingEntryClaimCounts.get(entryId) ?? 0) - 1,
        );
        if (nextHeadingCount) headingEntryClaimCounts.set(entryId, nextHeadingCount);
        else headingEntryClaimCounts.delete(entryId);
      }
    });
    totalClaimCount = Math.max(0, totalClaimCount - assignment.entryIds.size);
    groupCounts.set(
      assignment.group,
      Math.max(0, (groupCounts.get(assignment.group) ?? 0) - assignment.entryIds.size),
    );
    assignments.delete(instanceId);
  };

  return {
    apply(instanceId, text, segments, group = "overview") {
      const previousAssignment = assignments.get(instanceId);
      let allowedEntryIds: Set<string>;

      if (previousAssignment?.text === text && previousAssignment.group === group) {
        allowedEntryIds = previousAssignment.entryIds;
      } else {
        release(instanceId);
        allowedEntryIds = new Set<string>();
        let groupCount = groupCounts.get(group) ?? 0;

        for (const segment of segments) {
          if (segment.kind !== "term") continue;
          const isConceptHeading = group === "concept-headings";
          const entryAlreadyClaimed = isConceptHeading
            ? (headingEntryClaimCounts.get(segment.entry.id) ?? 0) > 0
            : (entryClaimCounts.get(segment.entry.id) ?? 0) > 0;
          if (
            entryAlreadyClaimed ||
            totalClaimCount >= safeMaxTerms ||
            groupCount >= groupLimits[group]
          ) {
            continue;
          }

          entryClaimCounts.set(
            segment.entry.id,
            (entryClaimCounts.get(segment.entry.id) ?? 0) + 1,
          );
          if (isConceptHeading) {
            headingEntryClaimCounts.set(
              segment.entry.id,
              (headingEntryClaimCounts.get(segment.entry.id) ?? 0) + 1,
            );
          }
          allowedEntryIds.add(segment.entry.id);
          groupCount += 1;
          totalClaimCount += 1;
        }

        groupCounts.set(group, groupCount);
        assignments.set(instanceId, { entryIds: allowedEntryIds, group, text });
      }

      return mergePlainTextSegments(
        segments.map((segment) =>
          segment.kind === "term" && !allowedEntryIds.has(segment.entry.id)
            ? { kind: "text", value: segment.value }
            : segment,
        ),
      );
    },
    release,
  };
}

const WORD_CHARACTER = /[\p{L}\p{M}\p{N}_]/u;

function normalizeForMatch(value: string, caseSensitive: boolean) {
  return caseSensitive ? value : value.toLocaleLowerCase("vi-VN");
}

function previousCharacter(value: string, index: number) {
  if (index <= 0) return "";
  return Array.from(value.slice(0, index)).at(-1) ?? "";
}

function nextCharacter(value: string, index: number) {
  if (index >= value.length) return "";
  return Array.from(value.slice(index))[0] ?? "";
}

function hasWordBoundaries(text: string, start: number, alias: string) {
  const aliasCharacters = Array.from(alias);
  const firstAliasCharacter = aliasCharacters[0] ?? "";
  const lastAliasCharacter = aliasCharacters.at(-1) ?? "";
  const before = previousCharacter(text, start);
  const after = nextCharacter(text, start + alias.length);

  if (WORD_CHARACTER.test(firstAliasCharacter) && WORD_CHARACTER.test(before)) return false;
  if (WORD_CHARACTER.test(lastAliasCharacter) && WORD_CHARACTER.test(after)) return false;
  return true;
}

const insensitiveCandidateCache = new WeakMap<readonly InlineGlossaryEntry[], GlossaryCandidate[]>();
const sensitiveCandidateCache = new WeakMap<readonly InlineGlossaryEntry[], GlossaryCandidate[]>();

function createCandidates(entries: readonly InlineGlossaryEntry[], caseSensitive: boolean) {
  const cache = caseSensitive ? sensitiveCandidateCache : insensitiveCandidateCache;
  const cached = cache.get(entries);
  if (cached) return cached;

  const seenAliases = new Set<string>();
  const candidates: GlossaryCandidate[] = [];

  entries.forEach((entry, entryOrder) => {
    const aliases = [
      { value: entry.label, caseSensitive: caseSensitive || Boolean(entry.labelCaseSensitive) },
      ...(entry.aliases ?? []).map((value) => ({ value, caseSensitive })),
      ...(entry.caseSensitiveAliases ?? []).map((value) => ({ value, caseSensitive: true })),
    ];

    aliases.forEach(({ value: rawAlias, caseSensitive: aliasCaseSensitive }, aliasOrder) => {
      const alias = rawAlias.trim();
      if (!alias) return;

      const normalizedAlias = normalizeForMatch(alias, aliasCaseSensitive);
      const aliasIdentity = `${aliasCaseSensitive ? "s" : "i"}:${normalizedAlias}`;
      if (seenAliases.has(aliasIdentity)) return;

      seenAliases.add(aliasIdentity);
      candidates.push({
        entry,
        alias,
        normalizedAlias,
        entryOrder,
        aliasOrder,
        caseSensitive: aliasCaseSensitive,
      });
    });
  });

  const sortedCandidates = candidates.sort(
    (left, right) =>
      right.alias.length - left.alias.length ||
      left.entryOrder - right.entryOrder ||
      left.aliasOrder - right.aliasOrder,
  );
  cache.set(entries, sortedCandidates);
  return sortedCandidates;
}

/**
 * Converts lesson copy into stable text/term segments without rewriting the
 * original characters. This keeps whitespace and punctuation byte-for-byte in
 * the output while preferring the longest alias at every position.
 */
export function segmentInlineGlossaryText(
  text: string,
  entries: readonly InlineGlossaryEntry[],
  caseSensitive = false,
): InlineGlossarySegment[] {
  if (!text || entries.length === 0) return text ? [{ kind: "text", value: text }] : [];

  const candidates = createCandidates(entries, caseSensitive);
  if (candidates.length === 0) return [{ kind: "text", value: text }];

  const normalizedText = normalizeForMatch(text, false);
  const segments: InlineGlossarySegment[] = [];
  const matchedEntryIds = new Set<string>();
  let plainTextStart = 0;
  let cursor = 0;

  while (cursor < text.length) {
    const match = candidates.find(
      (candidate) =>
        !matchedEntryIds.has(candidate.entry.id) &&
        (candidate.caseSensitive ? text : normalizedText).startsWith(candidate.normalizedAlias, cursor) &&
        hasWordBoundaries(text, cursor, candidate.alias),
    );

    if (!match) {
      const codePoint = text.codePointAt(cursor) ?? 0;
      cursor += codePoint > 0xffff ? 2 : 1;
      continue;
    }

    if (plainTextStart < cursor) {
      segments.push({ kind: "text", value: text.slice(plainTextStart, cursor) });
    }

    const matchEnd = cursor + match.alias.length;
    segments.push({
      kind: "term",
      value: text.slice(cursor, matchEnd),
      entry: match.entry,
    });
    matchedEntryIds.add(match.entry.id);
    cursor = matchEnd;
    plainTextStart = matchEnd;
  }

  if (plainTextStart < text.length) {
    segments.push({ kind: "text", value: text.slice(plainTextStart) });
  }

  return segments;
}

export interface InlineGlossaryTextProps {
  text: string;
  entries?: readonly InlineGlossaryEntry[];
  caseSensitive?: boolean;
  termClassName?: string;
}

/** Render inside an existing paragraph, list item, heading, or table cell. */
export function InlineGlossaryText({
  text,
  entries: providedEntries,
  caseSensitive = false,
  termClassName,
}: InlineGlossaryTextProps) {
  const glossaryDetails = useContext(GlossaryDetailsContext);
  const highlightGroup = useContext(GlossaryHighlightGroupContext);
  const entries = providedEntries ?? glossaryDetails?.entries ?? [];
  const instanceId = useId();
  const matchedSegments = useMemo(
    () => segmentInlineGlossaryText(text, entries, caseSensitive),
    [caseSensitive, entries, text],
  );
  const plainSegments = useMemo(
    () => (text ? [{ kind: "text" as const, value: text }] : []),
    [text],
  );
  const allocationSource = useMemo(
    () => ({ glossaryDetails, highlightGroup, matchedSegments, plainSegments, text }),
    [glossaryDetails, highlightGroup, matchedSegments, plainSegments, text],
  );
  const [committedAllocation, setCommittedAllocation] = useState(() => ({
    segments: glossaryDetails ? plainSegments : matchedSegments,
    source: allocationSource,
  }));

  useCommittedLayoutEffect(() => {
    const details = allocationSource.glossaryDetails;
    if (!details) return;

    const allocatedSegments = details.claimSegments(
      instanceId,
      allocationSource.text,
      allocationSource.matchedSegments,
      allocationSource.highlightGroup,
    );
    setCommittedAllocation({ segments: allocatedSegments, source: allocationSource });

    return () => details.releaseSegments(instanceId);
  }, [allocationSource, instanceId]);

  const segments = !glossaryDetails
    ? matchedSegments
    : committedAllocation.source === allocationSource
      ? committedAllocation.segments
      : plainSegments;

  return (
    <>
      {segments.map((segment, index) =>
        segment.kind === "text" ? (
          segment.value
        ) : (
          <InlineGlossaryTerm
            className={termClassName}
            entry={segment.entry}
            key={`${segment.entry.id}-${index}`}
          >
            {segment.value}
          </InlineGlossaryTerm>
        ),
      )}
    </>
  );
}

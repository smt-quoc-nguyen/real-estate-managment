import assert from "node:assert/strict";
import test from "node:test";

import {
  createGlossaryHighlightBudget,
  segmentInlineGlossaryText,
} from "../src/components/academy/inline-glossary";
import { courseWeeks } from "../src/data/curriculum";
import {
  getGlossaryEntriesForDomain,
  glossaryById,
  glossaryEntries,
} from "../src/data/glossary";
import type { DomainKey } from "../src/types/learning";
import type { GlossaryEntry } from "../src/types/glossary";

const termValues = (text: string, entries: readonly GlossaryEntry[]) =>
  segmentInlineGlossaryText(text, entries)
    .filter((segment) => segment.kind === "term")
    .map((segment) => segment.value);

const normalize = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLocaleLowerCase("vi-VN");

test("longest glossary alias wins and raw punctuation is preserved", () => {
  const entries: GlossaryEntry[] = [
    { id: "lease", label: "Lease", definition: "Hợp đồng thuê" },
    { id: "lease-charge", label: "Lease Charge", definition: "Quy tắc khoản thu" },
  ];
  const text = "Lease Charge, rồi mới tới Lease.";
  const segments = segmentInlineGlossaryText(text, entries);

  assert.deepEqual(
    segments.filter((segment) => segment.kind === "term").map((segment) => segment.value),
    ["Lease Charge", "Lease"],
  );
  assert.equal(segments.map((segment) => segment.value).join(""), text);
});

test("whole-word matching does not highlight acronyms inside longer tokens", () => {
  const ar = glossaryById.get("core-ar");
  assert.ok(ar);
  assert.deepEqual(termValues("AR khác AROpenItem và PART.", [ar]), ["AR"]);
});

test("Vietnamese words do not trigger case-sensitive English acronyms", () => {
  const cam = glossaryById.get("core-cam");
  assert.ok(cam);
  assert.deepEqual(termValues("cam kết khác CAM và CAM recovery.", [cam]), ["CAM"]);
  assert.deepEqual(termValues("cam recovery không đúng casing.", [cam]), []);
  assert.deepEqual(termValues("CAM recovery đúng casing.", [cam]), ["CAM recovery"]);

  const estimatedCamOwner = glossaryEntries.find((entry) =>
    entry.caseSensitiveAliases?.includes("Estimated CAM with true-up"),
  );
  assert.ok(estimatedCamOwner);
  assert.deepEqual(termValues("estimated cam with true-up", [estimatedCamOwner]), []);
  assert.deepEqual(termValues("Estimated CAM with true-up", [estimatedCamOwner]), [
    "Estimated CAM with true-up",
  ]);
});

test("one semantic text block highlights each entry only once", () => {
  const lease = glossaryById.get("core-lease");
  assert.ok(lease);
  assert.deepEqual(termValues("Lease đầu tiên; lease thứ hai giữ plain text.", [lease]), ["Lease"]);
});

test("lesson budget keeps only the first occurrence of a small set of terms", () => {
  const lease = glossaryById.get("core-lease");
  const domain = glossaryById.get("core-domain");
  const taxonomy = glossaryById.get("core-taxonomy");
  assert.ok(lease && domain && taxonomy);

  const budget = createGlossaryHighlightBudget(2);
  const first = budget.apply(
    "summary",
    "Lease thuộc Domain.",
    segmentInlineGlossaryText("Lease thuộc Domain.", [lease, domain, taxonomy]),
  );
  const second = budget.apply(
    "details",
    "Lease và Taxonomy.",
    segmentInlineGlossaryText("Lease và Taxonomy.", [lease, domain, taxonomy]),
  );

  assert.deepEqual(first.filter((segment) => segment.kind === "term").map((segment) => segment.value), [
    "Lease",
    "Domain",
  ]);
  assert.deepEqual(second.filter((segment) => segment.kind === "term"), []);
  assert.equal(second.map((segment) => segment.value).join(""), "Lease và Taxonomy.");
});

test("budget filtering never mutates matcher segments or duplicates lesson copy", () => {
  const lease = glossaryById.get("core-lease");
  assert.ok(lease);
  const budget = createGlossaryHighlightBudget(1);
  budget.apply(
    "first",
    "Lease",
    segmentInlineGlossaryText("Lease", [lease]),
  );

  const text = "Trước Lease, sau Lease.";
  const matchedSegments = segmentInlineGlossaryText(text, [lease]);
  const snapshot = structuredClone(matchedSegments);
  const filteredSegments = budget.apply("second", text, matchedSegments);

  assert.deepEqual(matchedSegments, snapshot);
  assert.equal(filteredSegments.map((segment) => segment.value).join(""), text);
});

test("concept headings keep reserved glossary slots after every other group is opened", () => {
  for (const week of courseWeeks) {
    const scopedEntries = getGlossaryEntriesForDomain(week.domain);

    for (const lesson of week.lessons) {
      const budget = createGlossaryHighlightBudget(15);
      const occupy = (
        group: "overview" | "concept-details" | "lifecycle" | "metrics" | "edge-cases",
        count: number,
      ) => {
        const entries: GlossaryEntry[] = Array.from({ length: count }, (_, index) => ({
          id: `${lesson.id}-${group}-${index}`,
          label: `Dummy${group}${index}`,
          definition: "Test allocation",
        }));
        const text = entries.map((entry) => entry.label).join(" ");
        budget.apply(
          `${lesson.id}-${group}`,
          text,
          segmentInlineGlossaryText(text, entries),
          group,
        );
      };

      occupy("overview", 6);
      occupy("lifecycle", 1);
      occupy("metrics", 1);
      occupy("edge-cases", 1);

      lesson.concepts.forEach((concept, index) => {
        const segments = segmentInlineGlossaryText(concept.term, scopedEntries);
        const allocated = budget.apply(
          `${lesson.id}-concept-heading-${concept.id}`,
          concept.term,
          segments,
          "concept-headings",
        );
        assert.ok(
          allocated.some(
            (segment) => segment.kind === "term" && segment.value === concept.term,
          ),
          `${lesson.id}.${concept.id} must keep its exact concept-heading tooltip`,
        );

        if (index === 0) occupy("concept-details", 1);
      });
    }
  }
});

test("glossary aliases only overlap across disjoint domains and every concept is covered in its domain", () => {
  assert.equal(new Set(glossaryEntries.map((entry) => entry.id)).size, glossaryEntries.length);

  const aliasOwners = new Map<
    string,
    Array<{ domains: readonly DomainKey[] | undefined; entryId: string }>
  >();
  const scopesOverlap = (
    left: readonly DomainKey[] | undefined,
    right: readonly DomainKey[] | undefined,
  ) => !left?.length || !right?.length || left.some((domain) => right.includes(domain));

  for (const entry of glossaryEntries) {
    assert.ok(entry.definition.trim(), `${entry.id} needs a Vietnamese definition`);
    for (const alias of [entry.label, ...(entry.aliases ?? []), ...(entry.caseSensitiveAliases ?? [])]) {
      const normalized = normalize(alias);
      const owners = aliasOwners.get(normalized) ?? [];
      assert.ok(
        !owners.some((owner) => scopesOverlap(owner.domains, entry.domains)),
        `${alias} is owned by two glossary entries in overlapping domains`,
      );
      owners.push({ domains: entry.domains, entryId: entry.id });
      aliasOwners.set(normalized, owners);
    }
  }

  const uncovered = courseWeeks.flatMap((week) => {
    const scopedAliases = new Set(
      getGlossaryEntriesForDomain(week.domain).flatMap((entry) =>
        [entry.label, ...(entry.aliases ?? []), ...(entry.caseSensitiveAliases ?? [])].map(normalize),
      ),
    );
    return week.lessons.flatMap((lesson) =>
      lesson.concepts.filter((concept) => !scopedAliases.has(normalize(concept.term))),
    );
  });
  assert.deepEqual(uncovered, []);

  assert.deepEqual(
    termValues("Revenue occupancy", getGlossaryEntriesForDomain("flex-metrics")),
    ["Revenue occupancy"],
  );
  assert.deepEqual(termValues("Unit economics", getGlossaryEntriesForDomain("flex-metrics")), [
    "Unit economics",
  ]);
  const memberMatch = segmentInlineGlossaryText(
    "member đổi plan",
    getGlossaryEntriesForDomain("flex-metrics"),
  ).find((segment) => segment.kind === "term");
  assert.equal(memberMatch?.entry.id, "core-member");
});

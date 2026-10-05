import assert from "node:assert/strict";
import { transform } from "esbuild";

import {
  allLessons,
  courseStats,
  courseWeeks,
  curriculum,
  getAdjacentLesson,
  getLessonById,
  getLessonContext,
  getWeekById,
  getWeekByNumber,
  relationNodes,
  searchLessons,
} from "../src/data/curriculum";
import { getGlossaryEntriesForDomain, glossaryEntries } from "../src/data/glossary";
import type { DomainKey } from "../src/types/learning";

function assertNonBlank(value: string | undefined, path: string): asserts value is string {
  assert.ok(typeof value === "string" && value.trim().length > 0, `${path} must not be blank`);
}

assert.equal(courseStats.weeks, 12, "curriculum must contain 12 weeks");
assert.equal(courseStats.lessons, 36, "curriculum must contain 36 lessons");
assert.equal(curriculum.totalWeeks, courseWeeks.length, "declared totalWeeks must match actual weeks");
assertNonBlank(curriculum.title, "curriculum.title");
assertNonBlank(curriculum.description, "curriculum.description");
assertNonBlank(curriculum.audience, "curriculum.audience");
assertNonBlank(curriculum.outcome, "curriculum.outcome");
curriculum.learningLoop.forEach((step, index) => assertNonBlank(step, `curriculum.learningLoop[${index}]`));
assert.deepEqual(
  courseWeeks.map((week) => week.number),
  Array.from({ length: 12 }, (_, index) => index + 1),
  "week numbers must be sequential",
);

const lessonIds = new Set<string>();
const weekIds = new Set<string>();
const moduleIds = new Set<string>();
const conceptIds = new Set<string>();
const quizIds = new Set<string>();
const relationIds = new Set<string>();
const sourceUrls = new Set<string>();
const relationNodeIds = new Set(relationNodes.map((node) => node.id));
const relationNodeLabels = new Set(relationNodes.map((node) => node.label));
const relationKinds = new Set([
  "contains",
  "references",
  "generates",
  "derived-from",
  "precedes",
  "classified-as",
  "fulfilled-by",
  "reported-through",
]);
const moduleWeekIds = curriculum.modules.flatMap((module) => module.weekIds);

for (const module of curriculum.modules) {
  assert.ok(!moduleIds.has(module.id), `duplicate module id: ${module.id}`);
  moduleIds.add(module.id);
  assertNonBlank(module.id, "module.id");
  assertNonBlank(module.title, `${module.id}.title`);
  assertNonBlank(module.description, `${module.id}.description`);
}

assert.equal(relationNodeIds.size, relationNodes.length, "relation node IDs must be unique");
assert.equal(relationNodeLabels.size, relationNodes.length, "relation node labels must be unique");
const relationNodeById = new Map(relationNodes.map((node) => [node.id, node]));
for (const node of relationNodes) {
  assert.match(node.id, /^concept:[a-z0-9-]+$/, `invalid canonical relation node ID: ${node.id}`);
  assertNonBlank(node.label, `${node.id}.label`);
}

assert.equal(moduleWeekIds.length, courseWeeks.length, "modules must cover every week exactly once");
assert.equal(new Set(moduleWeekIds).size, courseWeeks.length, "module week references must be unique");
assert.deepEqual(
  moduleWeekIds,
  courseWeeks.map((week) => week.id),
  "module coverage and order must match the curriculum weeks",
);

for (const module of curriculum.modules) {
  for (const weekId of module.weekIds) {
    assert.ok(courseWeeks.some((week) => week.id === weekId), `dangling module week reference: ${weekId}`);
  }
}

for (const [weekIndex, week] of courseWeeks.entries()) {
  assert.ok(!weekIds.has(week.id), `duplicate week id: ${week.id}`);
  weekIds.add(week.id);
  assert.equal(week.id, `week-${String(weekIndex + 1).padStart(2, "0")}`, "week ID must match its order");
  assert.equal(getWeekById(week.id), week, `${week.id} must be retrievable by ID`);
  assert.equal(getWeekByNumber(week.number), week, `${week.id} must be retrievable by number`);
  assertNonBlank(week.title, `${week.id}.title`);
  assertNonBlank(week.subtitle, `${week.id}.subtitle`);
  assertNonBlank(week.why, `${week.id}.why`);
  assertNonBlank(week.deliverable, `${week.id}.deliverable`);
  assert.ok(week.estimatedHours > 0, `${week.id}.estimatedHours must be positive`);
  assert.equal(week.lessons.length, 3, `${week.id} must contain exactly three lessons`);
  assert.ok(week.learningObjectives.length > 0, `${week.id} needs learning objectives`);
  assert.ok(week.checkpointQuestions.length > 0, `${week.id} needs checkpoint questions`);
  week.learningObjectives.forEach((objective, index) =>
    assertNonBlank(objective, `${week.id}.learningObjectives[${index}]`),
  );
  week.checkpointQuestions.forEach((question, index) =>
    assertNonBlank(question, `${week.id}.checkpointQuestions[${index}]`),
  );

  for (const source of week.sourceSuggestions) {
    assertNonBlank(source.label, `${week.id}.source.label`);
    assert.doesNotThrow(() => new URL(source.url), `invalid source URL: ${source.url}`);
    assert.match(source.url, /^https:\/\//, `source must use HTTPS: ${source.url}`);
    sourceUrls.add(source.url);
  }

  for (const [lessonIndex, lesson] of week.lessons.entries()) {
    assert.equal(
      lesson.id,
      `w${String(week.number).padStart(2, "0")}-l${String(lessonIndex + 1).padStart(2, "0")}`,
      `${lesson.id} must match its week and order`,
    );
    assert.ok(!lessonIds.has(lesson.id), `duplicate lesson id: ${lesson.id}`);
    lessonIds.add(lesson.id);
    assert.equal(getLessonById(lesson.id), lesson, `${lesson.id} must be retrievable by ID`);
    assert.equal(getLessonContext(lesson.id)?.lesson, lesson, `${lesson.id} must expose lesson context`);
    assert.equal(getLessonContext(lesson.id)?.week, week, `${lesson.id} must expose its parent week`);
    assertNonBlank(lesson.title, `${lesson.id}.title`);
    assertNonBlank(lesson.summary, `${lesson.id}.summary`);
    assertNonBlank(lesson.why, `${lesson.id}.why`);
    assert.ok(lesson.durationMinutes > 0, `${lesson.id}.durationMinutes must be positive`);

    const requiredCollections = {
      concepts: lesson.concepts,
      examples: lesson.examples,
      relations: lesson.relations,
      invariants: lesson.invariants,
      lifecycle: lesson.lifecycle,
      metrics: lesson.metrics,
      edgeCases: lesson.edgeCases,
      softwareModels: lesson.softwareModels,
      quiz: lesson.quiz,
    };

    for (const [field, values] of Object.entries(requiredCollections)) {
      assert.ok(values.length > 0, `${lesson.id}.${field} must not be empty`);
    }

    for (const concept of lesson.concepts) {
      assert.ok(!conceptIds.has(concept.id), `duplicate concept id: ${concept.id}`);
      conceptIds.add(concept.id);
      assertNonBlank(concept.term, `${lesson.id}.${concept.id}.term`);
      assertNonBlank(concept.definition, `${lesson.id}.${concept.id}.definition`);
      assertNonBlank(concept.why, `${lesson.id}.${concept.id}.why`);
      concept.actors.forEach((actor, index) =>
        assertNonBlank(actor, `${lesson.id}.${concept.id}.actors[${index}]`),
      );
      concept.variants?.forEach((variant, index) => {
        assertNonBlank(variant.name, `${lesson.id}.${concept.id}.variants[${index}].name`);
        assertNonBlank(variant.definition, `${lesson.id}.${concept.id}.variants[${index}].definition`);
        assertNonBlank(variant.useWhen, `${lesson.id}.${concept.id}.variants[${index}].useWhen`);
        if (variant.contrastWith !== undefined) {
          assertNonBlank(variant.contrastWith, `${lesson.id}.${concept.id}.variants[${index}].contrastWith`);
        }
      });
      if (concept.commonMistake !== undefined) {
        assertNonBlank(concept.commonMistake, `${lesson.id}.${concept.id}.commonMistake`);
      }
    }

    lesson.examples.forEach((example, index) => {
      assertNonBlank(example.title, `${lesson.id}.examples[${index}].title`);
      assertNonBlank(example.context, `${lesson.id}.examples[${index}].context`);
      assertNonBlank(example.scenario, `${lesson.id}.examples[${index}].scenario`);
      assertNonBlank(example.outcome, `${lesson.id}.examples[${index}].outcome`);
      example.numbers?.forEach((number, numberIndex) =>
        assertNonBlank(number, `${lesson.id}.examples[${index}].numbers[${numberIndex}]`),
      );
    });

    lesson.invariants.forEach((invariant, index) =>
      assertNonBlank(invariant, `${lesson.id}.invariants[${index}]`),
    );
    lesson.lifecycle.forEach((step, index) => {
      assertNonBlank(step.state, `${lesson.id}.lifecycle[${index}].state`);
      assertNonBlank(step.trigger, `${lesson.id}.lifecycle[${index}].trigger`);
      assertNonBlank(step.businessMeaning, `${lesson.id}.lifecycle[${index}].businessMeaning`);
    });
    lesson.metrics.forEach((metric, index) => {
      assertNonBlank(metric.name, `${lesson.id}.metrics[${index}].name`);
      assertNonBlank(metric.interpretation, `${lesson.id}.metrics[${index}].interpretation`);
      assertNonBlank(metric.decision, `${lesson.id}.metrics[${index}].decision`);
      if (metric.formula !== undefined) assertNonBlank(metric.formula, `${lesson.id}.metrics[${index}].formula`);
      if (metric.caution !== undefined) assertNonBlank(metric.caution, `${lesson.id}.metrics[${index}].caution`);
    });
    lesson.edgeCases.forEach((edgeCase, index) => {
      assertNonBlank(edgeCase.case, `${lesson.id}.edgeCases[${index}].case`);
      assertNonBlank(edgeCase.risk, `${lesson.id}.edgeCases[${index}].risk`);
      assertNonBlank(edgeCase.handling, `${lesson.id}.edgeCases[${index}].handling`);
    });
    lesson.softwareModels.forEach((model, index) => {
      assertNonBlank(model.title, `${lesson.id}.softwareModels[${index}].title`);
      assertNonBlank(model.code, `${lesson.id}.softwareModels[${index}].code`);
      assertNonBlank(model.explanation, `${lesson.id}.softwareModels[${index}].explanation`);
    });

    for (const question of lesson.quiz) {
      assert.ok(!quizIds.has(question.id), `duplicate quiz id: ${question.id}`);
      quizIds.add(question.id);
      assertNonBlank(question.prompt, `${lesson.id}.${question.id}.prompt`);
      assertNonBlank(question.correctAnswer, `${lesson.id}.${question.id}.correctAnswer`);
      assertNonBlank(question.explanation, `${lesson.id}.${question.id}.explanation`);
      question.options?.forEach((option, index) => {
        assertNonBlank(option.id, `${lesson.id}.${question.id}.options[${index}].id`);
        assertNonBlank(option.label, `${lesson.id}.${question.id}.options[${index}].label`);
      });
    }

    for (const relation of lesson.relations) {
      assert.ok(!relationIds.has(relation.id), `duplicate relation id: ${relation.id}`);
      relationIds.add(relation.id);
      assert.match(relation.fromId, /^concept:[a-z0-9-]+$/, `invalid from node id: ${relation.fromId}`);
      assert.match(relation.toId, /^concept:[a-z0-9-]+$/, `invalid to node id: ${relation.toId}`);
      assert.ok(relationNodeIds.has(relation.fromId), `dangling from node: ${relation.fromId}`);
      assert.ok(relationNodeIds.has(relation.toId), `dangling to node: ${relation.toId}`);
      assert.equal(relationNodeById.get(relation.fromId)?.label, relation.from, `from node label mismatch: ${relation.id}`);
      assert.equal(relationNodeById.get(relation.toId)?.label, relation.to, `to node label mismatch: ${relation.id}`);
      assert.ok(relationKinds.has(relation.kind), `unknown relation kind: ${relation.kind}`);
      assertNonBlank(relation.explanation, `${relation.id}.explanation`);
    }

    for (const model of lesson.softwareModels.filter((item) => item.language === "typescript")) {
      try {
        await transform(model.code, {
          loader: "ts",
          target: "es2022",
          logLevel: "silent",
        });
      } catch (error) {
        assert.fail(`${lesson.id} has invalid TypeScript snippet: ${String(error)}`);
      }
    }
  }
}

assert.equal(lessonIds.size, allLessons.length, "allLessons must contain every lesson exactly once");
assert.equal(conceptIds.size, courseStats.concepts, "concept IDs must be globally unique");
assert.ok(searchLessons("dieu khoan").length > 0, "Vietnamese accent-insensitive search must map đ to d");
allLessons.forEach((lesson, index) => {
  const adjacent = getAdjacentLesson(lesson.id);
  assert.equal(adjacent.previous, allLessons[index - 1], `${lesson.id} predecessor must preserve course order`);
  assert.equal(adjacent.next, allLessons[index + 1], `${lesson.id} successor must preserve course order`);
});
assert.deepEqual(getAdjacentLesson("unknown"), {}, "unknown lessons cannot have adjacency");

const glossaryIds = new Set<string>();
const glossaryAliasOwners = new Map<
  string,
  Array<{ domains: readonly DomainKey[] | undefined; entryId: string }>
>();
const normalizeGlossaryAlias = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLocaleLowerCase("vi-VN");
const glossaryScopesOverlap = (
  left: readonly DomainKey[] | undefined,
  right: readonly DomainKey[] | undefined,
) => !left?.length || !right?.length || left.some((domain) => right.includes(domain));

for (const entry of glossaryEntries) {
  assert.ok(!glossaryIds.has(entry.id), `duplicate glossary id: ${entry.id}`);
  glossaryIds.add(entry.id);
  assertNonBlank(entry.label, `${entry.id}.label`);
  if (entry.vietnameseLabel !== undefined) {
    assertNonBlank(entry.vietnameseLabel, `${entry.id}.vietnameseLabel`);
  }
  assertNonBlank(entry.definition, `${entry.id}.definition`);
  if (entry.example !== undefined) assertNonBlank(entry.example, `${entry.id}.example`);

  for (const alias of [entry.label, ...(entry.aliases ?? []), ...(entry.caseSensitiveAliases ?? [])]) {
    assertNonBlank(alias, `${entry.id}.alias`);
    const normalizedAlias = normalizeGlossaryAlias(alias);
    const owners = glossaryAliasOwners.get(normalizedAlias) ?? [];
    const conflictingOwner = owners.find((owner) =>
      glossaryScopesOverlap(owner.domains, entry.domains),
    );
    assert.ok(
      !conflictingOwner,
      `glossary alias collision: ${alias} belongs to ${entry.id} and ${conflictingOwner?.entryId} in overlapping domains`,
    );
    owners.push({ domains: entry.domains, entryId: entry.id });
    glossaryAliasOwners.set(normalizedAlias, owners);
  }
}

for (const week of courseWeeks) {
  assert.ok(getGlossaryEntriesForDomain(week.domain).length > 0, `${week.domain} needs glossary coverage`);
  const scopedAliases = new Set(
    getGlossaryEntriesForDomain(week.domain).flatMap((entry) =>
      [entry.label, ...(entry.aliases ?? []), ...(entry.caseSensitiveAliases ?? [])].map(
        normalizeGlossaryAlias,
      ),
    ),
  );
  for (const lesson of week.lessons) {
    for (const concept of lesson.concepts) {
      assert.ok(
        scopedAliases.has(normalizeGlossaryAlias(concept.term)),
        `${lesson.id}.${concept.id} is missing from the glossary`,
      );
    }
  }
}

console.log(
  JSON.stringify(
    {
      weeks: courseStats.weeks,
      lessons: courseStats.lessons,
      concepts: courseStats.concepts,
      relations: relationIds.size,
      relationNodes: relationNodes.length,
      glossaryEntries: glossaryEntries.length,
      glossaryAliases: Array.from(glossaryAliasOwners.values()).reduce(
        (total, owners) => total + owners.length,
        0,
      ),
      quizQuestions: courseStats.quizQuestions,
      uniqueSourceUrls: sourceUrls.size,
      result: "passed",
    },
    null,
    2,
  ),
);

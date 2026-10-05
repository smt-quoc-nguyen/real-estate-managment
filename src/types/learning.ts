/**
 * Domain-first learning taxonomy.
 *
 * The structure deliberately keeps business concepts separate from their
 * presentation. A web lesson, printable workbook, quiz engine, or search
 * index can all consume the same data without changing the domain content.
 */

export type DomainKey =
  | "space"
  | "lease"
  | "billing-ar"
  | "finance-noi"
  | "occupancy"
  | "facility"
  | "vendor-procurement"
  | "budget-reporting"
  | "asset-investor"
  | "coworking"
  | "flex-metrics"
  | "capstone";

export type RelationKind =
  | "contains"
  | "references"
  | "generates"
  | "derived-from"
  | "precedes"
  | "classified-as"
  | "fulfilled-by"
  | "reported-through";

export interface LearningRelation {
  id: string;
  fromId: string;
  from: string;
  toId: string;
  to: string;
  kind: RelationKind;
  explanation: string;
}

export interface RelationNode {
  id: string;
  label: string;
}

export interface ConceptVariant {
  name: string;
  definition: string;
  useWhen: string;
  contrastWith?: string;
}

export interface Concept {
  id: string;
  term: string;
  definition: string;
  why: string;
  actors: string[];
  variants?: ConceptVariant[];
  commonMistake?: string;
}

export interface PracticalExample {
  title: string;
  context: string;
  scenario: string;
  outcome: string;
  numbers?: string[];
}

export interface LifecycleStep {
  state: string;
  trigger: string;
  businessMeaning: string;
}

export interface MetricDefinition {
  name: string;
  formula?: string;
  interpretation: string;
  decision: string;
  caution?: string;
}

export interface EdgeCase {
  case: string;
  risk: string;
  handling: string;
}

export type SoftwareModelLanguage = "typescript" | "sql" | "pseudo" | "formula";

export interface SoftwareModel {
  title: string;
  language: SoftwareModelLanguage;
  code: string;
  explanation: string;
}

export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options?: QuizOption[];
  correctAnswer: string;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  summary: string;
  why: string;
  concepts: Concept[];
  examples: PracticalExample[];
  relations: LearningRelation[];
  invariants: string[];
  lifecycle: LifecycleStep[];
  metrics: MetricDefinition[];
  edgeCases: EdgeCase[];
  softwareModels: SoftwareModel[];
  quiz: QuizQuestion[];
}

export interface LearningWeek {
  id: string;
  number: number;
  domain: DomainKey;
  title: string;
  subtitle: string;
  estimatedHours: number;
  learningObjectives: string[];
  why: string;
  lessons: Lesson[];
  checkpointQuestions: string[];
  deliverable: string;
  sourceSuggestions: LearningSource[];
}

export interface LearningSource {
  label: string;
  url: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  weekIds: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  audience: string;
  outcome: string;
  totalWeeks: number;
  learningLoop: string[];
  modules: CourseModule[];
  weeks: LearningWeek[];
}

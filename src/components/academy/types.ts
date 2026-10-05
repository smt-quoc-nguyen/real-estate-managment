import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface AcademyWeekNavItem {
  id: string;
  number: number;
  title: string;
  shortTitle?: string;
  href?: string;
  icon?: LucideIcon;
  completed?: boolean;
  disabled?: boolean;
}

export interface LearningPathStep {
  id: string;
  label: string;
  description?: string;
}

export interface RelationshipMapNode {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

export interface RelationshipMapItem extends RelationshipMapNode {
  relation: string;
  explanation?: string;
}

export interface LessonCheckpointItem {
  id: string;
  label: string;
  description?: string;
}

export interface LessonNavigationTarget {
  label: string;
  eyebrow?: string;
  href?: string;
  disabled?: boolean;
}

export interface RealWorldFact {
  label?: string;
  value: ReactNode;
}

import type { DomainKey } from "./learning";

export interface GlossaryEntry {
  /** Stable identity shared by matching, rendering, testing, and analytics. */
  id: string;
  /** Canonical English business term and the default matching phrase. */
  label: string;
  /** Optional short Vietnamese name shown before the longer explanation. */
  vietnameseLabel?: string;
  /** Beginner-friendly explanation written in Vietnamese. */
  definition: string;
  /** A concrete property-management scenario written in Vietnamese. */
  example?: string;
  /** Alternative English spellings, abbreviations, or plural forms. */
  aliases?: readonly string[];
  /** Acronym aliases that must keep their exact case to avoid Vietnamese false matches. */
  caseSensitiveAliases?: readonly string[];
  /** Match the canonical label with exact case, useful for CAM/NOI/AR-like acronyms. */
  labelCaseSensitive?: boolean;
  /** Optional domain scopes for terms whose meaning is ambiguous outside one context. */
  domains?: readonly DomainKey[];
}

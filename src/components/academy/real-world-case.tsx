import { useId, type ReactNode } from "react";
import { Building2, CheckCircle2 } from "lucide-react";

import type { RealWorldFact } from "./types";

export interface RealWorldCaseProps {
  title: ReactNode;
  scenario: ReactNode;
  context?: ReactNode;
  outcome?: ReactNode;
  facts?: RealWorldFact[];
  numbers?: ReactNode[];
  label?: string;
  className?: string;
}

export function RealWorldCase({
  title,
  scenario,
  context,
  outcome,
  facts = [],
  numbers = [],
  label = "Trong thực tế",
  className,
}: RealWorldCaseProps) {
  const headingId = useId();
  const displayedFacts: RealWorldFact[] = [
    ...facts,
    ...numbers.map((value) => ({ value })),
  ];

  return (
    <article
      className={`border border-[#edc983] bg-[#fffaf0] px-5 py-6 sm:px-7 ${className ?? ""}`}
      aria-labelledby={headingId}
    >
      <div className="grid gap-5 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:items-start">
        <span className="grid size-16 place-items-center rounded-full border-2 border-[#efd59f] text-[#8f4605]">
          <Building2 aria-hidden="true" className="size-8" strokeWidth={1.7} />
        </span>

        <div>
          <p className="text-sm font-semibold text-[#8f4605]">{label}</p>
          <h2 id={headingId} className="mt-1 text-xl font-semibold tracking-[-0.02em] text-[#29282d]">
            {title}
          </h2>
          {context ? <div className="mt-3 text-sm leading-6 text-[#676057]">{context}</div> : null}
          <div className="mt-3 text-base leading-7 text-[#343137]">{scenario}</div>

          {displayedFacts.length ? (
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {displayedFacts.map((fact, index) => (
                <div className="flex gap-2 text-sm" key={`${fact.label ?? "fact"}-${index}`}>
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#8f4605]" strokeWidth={1.8} />
                  <div>
                    <dt className={fact.label ? "font-semibold text-[#343137]" : "sr-only"}>
                      {fact.label ?? `Dữ kiện ${index + 1}`}
                    </dt>
                    <dd className="leading-5 text-[#676057]">{fact.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          ) : null}

          {outcome ? (
            <div className="mt-5 border-t border-[#ecd9b4] pt-4 text-sm leading-6 text-[#514b43]">
              <span className="font-semibold text-[#343137]">Kết quả: </span>
              {outcome}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

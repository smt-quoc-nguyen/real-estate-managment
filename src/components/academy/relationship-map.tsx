import { useId } from "react";
import { ArrowDown, ArrowRight, Box } from "lucide-react";

import type { RelationshipMapItem, RelationshipMapNode } from "./types";

export interface RelationshipMapProps {
  target: RelationshipMapNode;
  relationships: RelationshipMapItem[];
  title?: string;
  description?: string;
  className?: string;
}

export function RelationshipMap({
  target,
  relationships,
  title = "Mối quan hệ cốt lõi",
  description,
  className,
}: RelationshipMapProps) {
  const TargetIcon = target.icon ?? Box;
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={className}>
      <header>
        <h2 id={headingId} className="text-xl font-semibold tracking-[-0.02em] text-[#0e513b]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-[#67666b]">
            {description}
          </p>
        ) : null}
      </header>

      <div className="mt-7 grid items-stretch gap-5 md:grid-cols-[minmax(0,1fr)_auto_minmax(9rem,0.62fr)] md:gap-4">
        <ul className="divide-y divide-[#e3ded2]" aria-label={`Các khái niệm liên quan tới ${target.label}`}>
          {relationships.map((item) => {
            const Icon = item.icon ?? Box;

            return (
              <li className="flex gap-3 py-4 first:pt-0 last:pb-0" key={item.id}>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#f0f1ea] text-[#0e513b]">
                  <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <h3 className="font-semibold text-[#202025]">
                      {item.label}
                    </h3>
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-amber">
                      {item.relation}
                    </span>
                  </div>
                  {item.description ? (
                    <p className="mt-1 text-sm leading-5 text-[#67666b]">
                      {item.description}
                    </p>
                  ) : null}
                  {item.explanation ? (
                    <p className="mt-2 text-xs leading-5 text-[#65636a]">
                      {item.explanation}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-center text-[#0e513b]" aria-hidden="true">
          <ArrowDown className="size-6 md:hidden" strokeWidth={1.6} />
          <ArrowRight className="hidden size-7 md:block" strokeWidth={1.6} />
        </div>

        <article className="flex min-h-44 flex-col items-center justify-center border-y border-[#cfd8cc] py-6 text-center md:border-y-0 md:border-l md:pl-5">
          <span className="grid size-16 place-items-center rounded-full border-4 border-[#c9dcc4] bg-[#f7f7f2] text-[#0e513b] shadow-sm">
            <TargetIcon aria-hidden="true" className="size-8" strokeWidth={1.7} />
          </span>
          <h3 className="mt-4 text-xl font-semibold text-[#0e513b]">
            {target.label}
          </h3>
          {target.description ? (
            <p className="mt-2 max-w-40 text-sm leading-5 text-[#67666b]">
              {target.description}
            </p>
          ) : null}
        </article>
      </div>
    </section>
  );
}

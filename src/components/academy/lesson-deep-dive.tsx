import {
  BookOpenText,
  ChartNoAxesCombined,
  Route,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Lesson } from "@/types/learning";
import { GlossaryHighlightGroup, InlineGlossaryText } from "./inline-glossary";

interface LessonDeepDiveProps {
  lesson: Lesson;
}

export function LessonDeepDive({ lesson }: LessonDeepDiveProps) {
  const sections = [
    lesson.concepts.length ? "concepts" : null,
    lesson.lifecycle.length || lesson.invariants.length ? "lifecycle" : null,
    lesson.metrics.length ? "metrics" : null,
    lesson.edgeCases.length ? "edge-cases" : null,
  ].filter((section): section is string => Boolean(section));

  if (!sections.length) return null;

  return (
    <section aria-labelledby="deep-dive-heading" className="scroll-mt-6 border-t border-border pt-8" id="lesson-deep-dive">
      <div className="flex items-start gap-3">
        <BookOpenText aria-hidden="true" className="mt-0.5 size-5 text-forest" strokeWidth={1.8} />
        <div>
          <h2 id="deep-dive-heading" className="text-xl font-semibold tracking-[-0.02em]">
            Đào sâu domain
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Đi từ định nghĩa đến constraint và business decision, thay vì học từng thuật ngữ rời rạc.
          </p>
        </div>
      </div>

      <Accordion className="mt-5 border-y border-border" type="multiple">
        {lesson.concepts.length ? (
          <AccordionItem value="concepts">
            <AccordionTrigger className="gap-3 text-left hover:no-underline">
              <span className="flex items-center gap-3">
                <BookOpenText aria-hidden="true" className="size-4 text-forest" />
                Concept & taxonomy
              </span>
            </AccordionTrigger>
            <GlossaryHighlightGroup name="concept-details">
            <AccordionContent>
              <div className="divide-y divide-border">
                {lesson.concepts.map((concept) => (
                  <article className="py-5 first:pt-1" key={concept.id}>
                    <h3 className="font-semibold text-foreground">
                      <GlossaryHighlightGroup name="concept-headings">
                        <InlineGlossaryText text={concept.term} />
                      </GlossaryHighlightGroup>
                    </h3>
                    <p className="mt-2 leading-7 text-foreground/80">
                      <InlineGlossaryText text={concept.definition} />
                    </p>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="font-semibold text-forest">Why</dt>
                        <dd className="mt-1 leading-6 text-muted-foreground">
                          <InlineGlossaryText text={concept.why} />
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-forest">Actors</dt>
                        <dd className="mt-1 leading-6 text-muted-foreground">
                          {concept.actors.join(" · ")}
                        </dd>
                      </div>
                    </dl>

                    {concept.variants?.length ? (
                      <div className="mt-4 border-l-2 border-amber pl-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber">
                          Các biến thể
                        </p>
                        <ul className="mt-2 space-y-3">
                          {concept.variants.map((variant) => (
                            <li className="text-sm leading-6" key={variant.name}>
                              <span className="font-semibold">
                                {variant.name}:
                              </span>{" "}
                              <span className="text-muted-foreground">
                                <InlineGlossaryText text={variant.definition} />
                              </span>
                              <span className="block text-foreground/75">
                                Dùng khi: <InlineGlossaryText text={variant.useWhen} />
                              </span>
                              {variant.contrastWith ? (
                                <span className="block text-foreground/75">
                                  Phân biệt với: <InlineGlossaryText text={variant.contrastWith} />
                                </span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {concept.commonMistake ? (
                      <p className="mt-4 flex gap-2 text-sm leading-6 text-[#8b4a08]">
                        <TriangleAlert aria-hidden="true" className="mt-1 size-4 shrink-0" />
                        <span>
                          <strong>Sai lầm thường gặp:</strong>{" "}
                          <InlineGlossaryText text={concept.commonMistake} />
                        </span>
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </AccordionContent>
            </GlossaryHighlightGroup>
          </AccordionItem>
        ) : null}

        {lesson.lifecycle.length || lesson.invariants.length ? (
          <AccordionItem value="lifecycle">
            <AccordionTrigger className="gap-3 text-left hover:no-underline">
              <span className="flex items-center gap-3">
                <Route aria-hidden="true" className="size-4 text-forest" />
                Lifecycle & invariants
              </span>
            </AccordionTrigger>
            <GlossaryHighlightGroup name="lifecycle">
            <AccordionContent>
              {lesson.lifecycle.length ? (
                <ol className="divide-y divide-border" aria-label="Lifecycle của concept">
                  {lesson.lifecycle.map((step, index) => (
                    <li className="grid gap-2 py-4 sm:grid-cols-[2rem_10rem_minmax(0,1fr)]" key={`${step.state}-${index}`}>
                      <span className="font-semibold tabular-nums text-amber">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-semibold">
                        {step.state}
                      </span>
                      <span className="text-sm leading-6 text-muted-foreground">
                        <strong className="text-foreground/80">
                          {step.trigger}:
                        </strong>{" "}
                        <InlineGlossaryText text={step.businessMeaning} />
                      </span>
                    </li>
                  ))}
                </ol>
              ) : null}

              {lesson.invariants.length ? (
                <div className="mt-5 border-l-2 border-forest pl-4">
                  <h3 className="flex items-center gap-2 font-semibold text-forest">
                    <ShieldCheck aria-hidden="true" className="size-4" />
                    Điều luôn phải đúng
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                    {lesson.invariants.map((invariant) => (
                      <li key={invariant}>
                        • <InlineGlossaryText text={invariant} />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </AccordionContent>
            </GlossaryHighlightGroup>
          </AccordionItem>
        ) : null}

        {lesson.metrics.length ? (
          <AccordionItem value="metrics">
            <AccordionTrigger className="gap-3 text-left hover:no-underline">
              <span className="flex items-center gap-3">
                <ChartNoAxesCombined aria-hidden="true" className="size-4 text-forest" />
                Metrics & business decisions
              </span>
            </AccordionTrigger>
            <GlossaryHighlightGroup name="metrics">
            <AccordionContent>
              <div
                aria-label="Bảng metric và business decision; dùng phím mũi tên để cuộn ngang khi cần"
                className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                role="region"
                tabIndex={0}
              >
                <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-forest">
                      <th className="py-3 pr-4 font-semibold">Metric</th>
                      <th className="px-4 py-3 font-semibold">Cách đọc</th>
                      <th className="px-4 py-3 font-semibold">Quyết định hỗ trợ</th>
                      <th className="py-3 pl-4 font-semibold">Cẩn trọng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lesson.metrics.map((metric) => (
                      <tr className="align-top" key={metric.name}>
                        <th className="py-4 pr-4 font-semibold">
                          {metric.name}
                          {metric.formula ? (
                            <code className="mt-1 block whitespace-normal font-mono text-xs font-normal text-amber">
                              {metric.formula}
                            </code>
                          ) : null}
                        </th>
                        <td className="px-4 py-4 leading-6 text-muted-foreground">
                          <InlineGlossaryText text={metric.interpretation} />
                        </td>
                        <td className="px-4 py-4 leading-6 text-muted-foreground">
                          <InlineGlossaryText text={metric.decision} />
                        </td>
                        <td className="py-4 pl-4 leading-6 text-muted-foreground">
                          {metric.caution ? <InlineGlossaryText text={metric.caution} /> : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
            </GlossaryHighlightGroup>
          </AccordionItem>
        ) : null}

        {lesson.edgeCases.length ? (
          <AccordionItem value="edge-cases">
            <AccordionTrigger className="gap-3 text-left hover:no-underline">
              <span className="flex items-center gap-3">
                <TriangleAlert aria-hidden="true" className="size-4 text-amber" />
                Edge cases cần model
              </span>
            </AccordionTrigger>
            <GlossaryHighlightGroup name="edge-cases">
            <AccordionContent>
              <ul className="divide-y divide-border">
                {lesson.edgeCases.map((edgeCase) => (
                  <li className="grid gap-2 py-4 sm:grid-cols-[12rem_minmax(0,1fr)]" key={edgeCase.case}>
                    <strong>{edgeCase.case}</strong>
                    <div className="space-y-1 text-sm leading-6 text-muted-foreground">
                      <p>
                        <span className="font-semibold text-foreground/80">Rủi ro:</span>{" "}
                        <InlineGlossaryText text={edgeCase.risk} />
                      </p>
                      <p>
                        <span className="font-semibold text-forest">Xử lý:</span>{" "}
                        <InlineGlossaryText text={edgeCase.handling} />
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </AccordionContent>
            </GlossaryHighlightGroup>
          </AccordionItem>
        ) : null}
      </Accordion>
    </section>
  );
}

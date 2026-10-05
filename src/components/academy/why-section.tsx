import { useId, type ReactNode } from "react";
import { CircleHelp, Lightbulb } from "lucide-react";

export interface WhySectionProps {
  title?: string;
  children: ReactNode;
  takeaway?: ReactNode;
  className?: string;
}

export function WhySection({
  title = "Tại sao điều này quan trọng?",
  children,
  takeaway,
  className,
}: WhySectionProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={`border-l-2 border-[#0e513b] py-1 pl-5 sm:pl-7 ${className ?? ""}`}
    >
      <div className="flex items-center gap-3">
        <CircleHelp aria-hidden="true" className="size-5 text-[#0e513b]" strokeWidth={1.8} />
        <h2 id={headingId} className="text-xl font-semibold tracking-[-0.02em] text-[#173f33]">
          {title}
        </h2>
      </div>
      <div className="mt-4 max-w-3xl text-base leading-8 text-[#37363b] md:text-lg">{children}</div>

      {takeaway ? (
        <div className="mt-5 flex gap-3 border-t border-[#e3ded2] pt-4 text-sm leading-6 text-[#5b5a60]">
          <Lightbulb aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#d2740a]" strokeWidth={1.8} />
          <div>
            <span className="font-semibold text-[#34343a]">Ghi nhớ: </span>
            {takeaway}
          </div>
        </div>
      ) : null}
    </section>
  );
}

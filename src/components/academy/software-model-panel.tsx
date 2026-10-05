"use client";

import { useId, useState, type ReactNode } from "react";
import { Check, Clipboard, Code2, CircleAlert } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import type { SoftwareModelLanguage } from "@/types/learning";

export interface SoftwareModelPanelProps {
  title: string;
  language: SoftwareModelLanguage;
  code: string;
  explanation: ReactNode;
  modelNote?: ReactNode;
  className?: string;
}

export function SoftwareModelPanel({
  title,
  language,
  code,
  explanation,
  modelNote,
  className,
}: SoftwareModelPanelProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const headingId = useId();

  const copyCode = async () => {
    const fallbackCopy = () => {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      return copied;
    };

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else if (!fallbackCopy()) {
        throw new Error("Clipboard API unavailable");
      }
      setCopyStatus("copied");
    } catch {
      try {
        setCopyStatus(fallbackCopy() ? "copied" : "error");
      } catch {
        setCopyStatus("error");
      }
    }
    window.setTimeout(() => setCopyStatus("idle"), 2200);
  };

  return (
    <section aria-labelledby={headingId} className={className}>
      <div className="flex flex-wrap items-center justify-between gap-3 border border-[#d8d3c8] border-b-0 bg-[#f4f2eb] px-4 py-3">
        <div className="flex items-center gap-3">
          <Code2 aria-hidden="true" className="size-5 text-[#0e513b]" strokeWidth={1.8} />
          <h2 id={headingId} className="font-semibold text-[#29282d]">
            {title}
          </h2>
          <span className="rounded-full border border-[#d8d3c8] bg-[#fbfaf6] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-[#67666b]">
            {language}
          </span>
        </div>

        <Button
          aria-label={copyStatus === "copied" ? "Đã sao chép code" : "Sao chép code"}
          className="gap-2"
          onClick={copyCode}
          size="sm"
          variant="ghost"
        >
          {copyStatus === "copied" ? (
            <Check aria-hidden="true" className="size-4" />
          ) : copyStatus === "error" ? (
            <CircleAlert aria-hidden="true" className="size-4" />
          ) : (
            <Clipboard aria-hidden="true" className="size-4" />
          )}
          {copyStatus === "copied" ? "Đã chép" : copyStatus === "error" ? "Không thể chép" : "Sao chép"}
        </Button>
      </div>

      <pre
        className="max-h-[32rem] overflow-auto border border-[#d8d3c8] bg-[#17221e] p-5 text-sm leading-6 text-[#e9eee9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d2740a]"
        tabIndex={0}
      >
        <code>{code}</code>
      </pre>

      <p className="sr-only" aria-live="polite">
        {copyStatus === "copied"
          ? "Đã sao chép đoạn code vào clipboard."
          : copyStatus === "error"
            ? "Không thể truy cập clipboard. Hãy chọn và sao chép code thủ công."
            : ""}
      </p>

      <Accordion className="border-x border-b border-[#d8d3c8] px-4" collapsible defaultValue="explanation" type="single">
        <AccordionItem className="border-0" value="explanation">
          <AccordionTrigger className="text-left text-sm font-semibold text-[#0e513b] hover:no-underline">
            Tại sao model như vậy?
          </AccordionTrigger>
          <AccordionContent className="space-y-3 text-sm leading-6 text-[#5b5a60]">
            <p>{explanation}</p>
            {modelNote ? (
              <p className="border-l-2 border-[#d2740a] pl-3 text-[#514b43]">
                <span className="font-semibold text-[#343137]">Lưu ý: </span>
                {modelNote}
              </p>
            ) : null}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

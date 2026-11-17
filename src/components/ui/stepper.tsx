import { Fragment } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type StepState = "done" | "current" | "todo";

/** Horizontal stepper (Publier un avis, Générer un rapport IA). */
export function Stepper({ steps, connector = "short" }: { steps: { label: string; state: StepState }[]; connector?: "short" | "fill" }) {
  return (
    <ol className="flex items-center gap-3 rounded-xl border border-line bg-card px-5 py-4">
      {steps.map((s, i) => (
        <Fragment key={s.label}>
          <li className="flex items-center gap-2.5" aria-current={s.state === "current" ? "step" : undefined}>
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full type-label",
                s.state === "done" && "bg-success text-on-brand",
                s.state === "current" && "bg-brand text-on-brand",
                s.state === "todo" && "bg-muted text-ink-3",
              )}
            >
              {s.state === "done" ? <Check className="size-4" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn(s.state === "current" ? "type-body-strong text-ink" : s.state === "todo" ? "type-body text-ink-3" : "type-body text-ink")}>
              {s.label}
            </span>
          </li>
          {i < steps.length - 1 && (
            <li aria-hidden className={cn("h-0.5", connector === "fill" ? "flex-1" : "w-12", s.state === "done" ? "bg-success" : "bg-line-strong")} />
          )}
        </Fragment>
      ))}
    </ol>
  );
}

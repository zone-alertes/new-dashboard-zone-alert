import { cn } from "@/lib/utils/cn";

/** Figma component "Badge" — Ton=Danger | Avertissement | Succès | Info | Neutre | Marque. */
export type Tone = "danger" | "warning" | "success" | "info" | "neutral" | "brand";

const tones: Record<Tone, { bg: string; fg: string; dot: string }> = {
  danger: { bg: "bg-danger-soft", fg: "text-danger", dot: "bg-danger" },
  warning: { bg: "bg-warning-soft", fg: "text-warning", dot: "bg-warning" },
  success: { bg: "bg-success-soft", fg: "text-success", dot: "bg-success" },
  info: { bg: "bg-info-soft", fg: "text-info", dot: "bg-info" },
  neutral: { bg: "bg-neutral-soft", fg: "text-neutral", dot: "bg-neutral" },
  brand: { bg: "bg-brand-soft", fg: "text-brand-strong", dot: "bg-brand-strong" },
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  const t = tones[tone];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-[3px] type-label whitespace-nowrap", t.bg, t.fg, className)}>
      <span className={cn("size-1.5 rounded-full", t.dot)} aria-hidden />
      {children}
    </span>
  );
}

/** Small counter pill used in tabs and in the sidebar. */
export function CountPill({ children, active, tone }: { children: React.ReactNode; active?: boolean; tone?: "danger" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-px type-label",
        tone === "danger" ? "bg-danger-soft text-danger" : active ? "bg-brand-soft text-brand-strong" : "bg-muted text-ink-2",
      )}
    >
      {children}
    </span>
  );
}

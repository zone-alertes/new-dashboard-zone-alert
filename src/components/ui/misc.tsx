import type { ReactNode } from "react";
import Image from "next/image";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/format";

type CalloutTone = "info" | "warning" | "neutral" | "danger";

const calloutTones: Record<CalloutTone, string> = {
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  neutral: "bg-muted text-ink-2",
  danger: "bg-danger-soft text-danger",
};

/** Inline message box with an icon (info, privacy, warnings…). */
export function Callout({
  tone = "info",
  icon,
  children,
  action,
  className,
}: {
  tone?: CalloutTone;
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-2.5 rounded-lg px-3.5 py-2.5 type-small", calloutTones[tone], action && "items-center py-3", className)}>
      <span className="mt-px shrink-0 [&>svg]:size-[18px]">{icon ?? <Info aria-hidden />}</span>
      <div className="min-w-0 flex-1">{children}</div>
      {action}
    </div>
  );
}

/** Rounded filter chip (with trailing chevron or remove icon). */
export function Chip({
  children,
  trailing,
  active,
  onClick,
  className,
}: {
  children: ReactNode;
  trailing?: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 type-small",
        active ? "border-brand bg-brand-soft text-brand-strong" : "border-line-strong bg-card text-ink",
        className,
      )}
    >
      {children}
      {trailing}
    </Tag>
  );
}

export function Avatar({ name, src, size = 32, className }: { name: string; src?: string; size?: number; className?: string }) {
  return src ? (
    <Image src={src} alt="" width={size} height={size} className={cn("shrink-0 rounded-full object-cover", className)} style={{ width: size, height: size }} />
  ) : (
    <span
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center rounded-full bg-muted type-label text-ink-2", className)}
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </span>
  );
}

export function ProgressBar({
  value,
  max = 100,
  tone = "info",
  className,
  label,
}: {
  value: number;
  max?: number;
  tone?: "info" | "danger" | "warning" | "brand";
  className?: string;
  label?: string;
}) {
  const color = { info: "bg-info", danger: "bg-danger", warning: "bg-warning", brand: "bg-brand" }[tone];
  return (
    <div
      className={cn("h-2 w-full rounded bg-muted", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div className={cn("h-2 rounded", color)} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} aria-hidden />;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <p className="type-h3 text-ink">{title}</p>
      {description && <p className="max-w-sm type-small text-ink-2">{description}</p>}
      {action}
    </div>
  );
}

export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="type-caption text-ink-3">{label}</dt>
      <dd className="type-body-strong text-ink">{value}</dd>
    </div>
  );
}

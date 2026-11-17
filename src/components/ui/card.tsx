import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** White 12-radius bordered container with an optional H2 header (Figma "card"). */
export function Card({
  title,
  action,
  children,
  className,
  bodyClassName,
  as: Tag = "section",
}: {
  title?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <Tag className={cn("flex flex-col gap-4 rounded-xl border border-line bg-card p-5", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4">
          {title && <h2 className="type-h2 text-ink">{title}</h2>}
          {action}
        </header>
      )}
      {bodyClassName ? <div className={bodyClassName}>{children}</div> : children}
    </Tag>
  );
}

/** Figma component "Carte KPI". */
export function KpiCard({ label, value, trend, className }: { label: string; value: string; trend?: string; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-1.5 rounded-xl border border-line bg-card p-5", className)}>
      <p className="type-small text-ink-2">{label}</p>
      <p className="type-kpi text-ink">{value}</p>
      {trend && <p className="type-caption text-ink-3">{trend}</p>}
    </div>
  );
}

export function KpiRow({ children }: { children: ReactNode }) {
  return <div className="flex gap-4">{children}</div>;
}

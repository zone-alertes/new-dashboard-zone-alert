"use client";

import { cn } from "@/lib/utils/cn";
import { CountPill } from "./badge";

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number | string;
}

/** Pill tabs with counters (Alertes, Avis, Publications). */
export function CountTabs<T extends string>({ items, value, onChange, label }: { items: TabItem<T>[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-1">
      {items.map((t) => {
        const on = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={on}
            onClick={() => onChange(t.value)}
            className={cn(
              "flex h-9 items-center gap-2 rounded-lg px-3.5",
              on ? "border border-line bg-card type-body-strong text-ink" : "type-body text-ink-2 hover:text-ink",
            )}
          >
            {t.label}
            {t.count !== undefined && <CountPill active={on}>{t.count}</CountPill>}
          </button>
        );
      })}
    </div>
  );
}

/** Segmented tabs on a muted track (Notifications, Paramètres). */
export function SegmentTabs<T extends string>({ items, value, onChange, label }: { items: TabItem<T>[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex w-fit gap-1 rounded-[10px] bg-muted p-1">
      {items.map((t) => {
        const on = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={on}
            onClick={() => onChange(t.value)}
            className={cn("rounded-lg px-3.5 py-[7px]", on ? "bg-card type-body-strong text-ink" : "type-small text-ink-2 hover:text-ink")}
          >
            {t.label}
            {t.count !== undefined ? ` (${t.count})` : ""}
          </button>
        );
      })}
    </div>
  );
}

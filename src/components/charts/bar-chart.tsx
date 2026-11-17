import { cn } from "@/lib/utils/cn";

/** Daily bars (dashboard "Alertes reçues — 30 derniers jours"): peak in brand red, today in info blue. */
export function DailyBars({
  values,
  peakIndex,
  todayIndex,
  labels,
  height = 160,
}: {
  values: number[];
  peakIndex?: number;
  todayIndex?: number;
  labels: [string, string, string];
  height?: number;
}) {
  const max = Math.max(...values);
  return (
    <figure className="flex flex-col gap-2">
      <div className="flex items-end gap-1" style={{ height }} role="img" aria-label={`Histogramme de ${values.length} jours, maximum ${max}`}>
        {values.map((v, i) => (
          <div
            key={i}
            title={`${v} alertes`}
            className={cn("flex-1 rounded-[3px]", i === peakIndex ? "bg-brand" : i === todayIndex ? "bg-info" : "bg-line-strong")}
            style={{ height: `${(v / max) * 100}%` }}
          />
        ))}
      </div>
      <figcaption className="flex justify-between type-caption text-ink-3">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </figcaption>
    </figure>
  );
}

/** Grouped vertical bars (Statistiques: current vs previous period). */
export function GroupedBars({
  data,
  height = 200,
  legend,
}: {
  data: { label: string; current: number; previous: number }[];
  height?: number;
  legend: [string, string];
}) {
  const max = Math.max(...data.flatMap((d) => [d.current, d.previous]));
  return (
    <figure className="flex flex-col gap-3">
      <div className="flex items-end justify-around gap-6 border-b border-line" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="flex h-full flex-1 items-end justify-center gap-1.5">
            <div className="flex w-7 flex-col items-center justify-end gap-1" style={{ height: "100%" }}>
              <span className="type-caption text-ink-3">{d.previous}</span>
              <div className="w-full rounded-t bg-line-strong" style={{ height: `${(d.previous / max) * 85}%` }} />
            </div>
            <div className="flex w-7 flex-col items-center justify-end gap-1" style={{ height: "100%" }}>
              <span className="type-caption text-ink">{d.current}</span>
              <div className="w-full rounded-t bg-brand" style={{ height: `${(d.current / max) * 85}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-around">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center type-caption text-ink-3">
            {d.label}
          </span>
        ))}
      </div>
      <figcaption className="flex gap-4 type-caption text-ink-2">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-brand" /> {legend[0]}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-line-strong" /> {legend[1]}
        </span>
      </figcaption>
    </figure>
  );
}

/** Horizontal score bars (zones at risk, AI factors). */
export function ScoreBar({
  label,
  value,
  max = 100,
  tone,
  suffix,
}: {
  label: string;
  value: number;
  max?: number;
  tone: "danger" | "warning" | "info" | "brand";
  suffix: string;
}) {
  const color = { danger: "bg-danger", warning: "bg-warning", info: "bg-info", brand: "bg-brand" }[tone];
  const text = { danger: "text-danger", warning: "text-warning", info: "text-info", brand: "text-brand-strong" }[tone];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between">
        <span className="type-body-strong text-ink">{label}</span>
        <span className={cn("type-small", text)}>{suffix}</span>
      </div>
      <div className="h-2 rounded bg-muted">
        <div className={cn("h-2 rounded", color)} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

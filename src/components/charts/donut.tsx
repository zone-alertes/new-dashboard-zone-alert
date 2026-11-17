/** Ring chart with total in the centre (Statistiques · répartition par gravité). */
export function Donut({
  parts,
  total,
  unit,
  size = 180,
}: {
  parts: { label: string; value: number; pct: number; color: string }[];
  total: string;
  unit: string;
  size?: number;
}) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const offsets = parts.map((_, i) => parts.slice(0, i).reduce((sum, p) => sum + (c * p.pct) / 100, 0));
  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 180 180" width={size} height={size} role="img" aria-label={parts.map((p) => `${p.label} ${p.pct} %`).join(", ")}>
          {parts.map((p, i) => (
            <circle
              key={p.label}
              cx={90}
              cy={90}
              r={r}
              fill="none"
              stroke={p.color}
              strokeWidth={22}
              strokeDasharray={`${(c * p.pct) / 100 - 2} ${c}`}
              strokeDashoffset={-offsets[i]!}
              transform="rotate(-90 90 90)"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="type-kpi text-ink">{total}</span>
          <span className="type-caption text-ink-2">{unit}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: p.color }} />
            <span className="type-small text-ink">{p.label}</span>
            <span className="type-body-strong text-ink">
              {p.value} · {p.pct} %
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

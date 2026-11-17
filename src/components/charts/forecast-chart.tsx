/**
 * Forecast line chart (Prédictions IA): predicted line, observed dashed line,
 * confidence band. Pure SVG, scales to its container width.
 */
export function ForecastChart({
  days,
  predicted,
  observed,
  band,
  height = 200,
}: {
  days: string[];
  predicted: number[];
  observed: number[];
  band: number;
  height?: number;
}) {
  const W = 640;
  const max = Math.max(...predicted.map((v) => v + band), ...observed) * 1.05;
  const x = (i: number) => 20 + (i * (W - 40)) / (days.length - 1);
  const y = (v: number) => height - 10 - (v / max) * (height - 20);
  const line = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const area = `${predicted.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v + band)}`).join(" ")} ${[...predicted]
    .reverse()
    .map((v, i) => `L${x(predicted.length - 1 - i)},${y(Math.max(v - band, 0))}`)
    .join(" ")} Z`;
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex gap-4 type-caption text-ink-2">
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-3.5 rounded bg-brand" /> Prévu
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-3.5 rounded bg-ink-2" /> Observé
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-3.5 rounded bg-brand-soft" /> Intervalle de confiance
        </span>
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${height}`}
        className="w-full"
        role="img"
        aria-label={`Prévision : ${predicted.join(", ")} incidents ; observé : ${observed.join(", ")}`}
      >
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M0 ${10 + k * ((height - 20) / 3)} H${W}`} stroke="var(--za-border-default)" />
        ))}
        <path d={area} fill="var(--za-brand-soft)" />
        <path d={line(predicted)} stroke="var(--za-brand-primary)" strokeWidth={2.5} fill="none" />
        <path d={line(observed)} stroke="var(--za-text-secondary)" strokeWidth={2} strokeDasharray="5 4" fill="none" />
        {predicted.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={3} fill="var(--za-brand-primary)">
            <title>
              {days[i]} : {v} incidents prévus
            </title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between type-caption text-ink-3">
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </figure>
  );
}

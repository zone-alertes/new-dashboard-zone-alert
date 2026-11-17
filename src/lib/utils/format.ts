/**
 * Formatting helpers (fr-CD). The demo dataset is frozen on
 * Sunday 8 November 2026, 18:45 (Kinshasa, UTC+1) — see `DEMO_NOW`.
 */
export const DEMO_NOW = new Date("2026-11-08T18:45:00+01:00");

const nf = new Intl.NumberFormat("fr-FR");

export function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatInt(value: number) {
  return nf.format(value).replace(/ /g, " ");
}

export function formatPercent(value: number, digits = 1) {
  return `${formatNumber(value, digits)} %`;
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Kinshasa",
  }).format(new Date(iso));
}

export function formatShortDate(iso: string) {
  const d = new Date(iso);
  const day = d.getUTCDate();
  const month = new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "Africa/Kinshasa" }).format(d);
  return `${day === 1 ? "1er" : day} ${month}`;
}

/** "il y a 6 min", "il y a 2 h" relative to the demo clock. */
export function timeAgo(iso: string, now: Date = DEMO_NOW) {
  const diffMin = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60000));
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

export function initials(name: string) {
  return name
    .replace(/^(Sgt|Dr|M\.|Mme)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

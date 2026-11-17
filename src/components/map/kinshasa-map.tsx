"use client";

import { useEffect } from "react";
import { Circle, MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import type { Alert, Severity, Team, ZoneRisk } from "@/types/domain";
import { KINSHASA_CENTER, COMMUNES } from "@/lib/mock/data/geo";

const SEVERITY_COLOR: Record<Severity, string> = { grave: "#b42318", serieuse: "#b54708", moderee: "#175cd3" };
const SEVERITY_TEXT: Record<Severity, string> = { grave: "Grave", serieuse: "Sérieuse", moderee: "Modérée" };

/** Incident marker: colour + text label so severity is never conveyed by colour alone (WCAG 1.4.1). */
const incidentIcon = (a: Alert, highlighted: boolean) =>
  L.divIcon({
    className: "",
    iconSize: [0, 0],
    html: `<span style="transform:translate(-50%,-50%);display:inline-flex;align-items:center;gap:4px;white-space:nowrap;padding:2px 8px;border-radius:999px;background:${SEVERITY_COLOR[a.severity]};color:#fff;font:500 11px/16px var(--font-poppins),sans-serif;box-shadow:0 0 0 ${highlighted ? 4 : 2}px ${highlighted ? "rgba(227,6,19,.35)" : "#fff"}">${SEVERITY_TEXT[a.severity]} · ${a.ref.slice(4)}</span>`,
  });

/** Compact dot for small previews (dashboard), label available as tooltip. */
const dotIcon = (a: Alert) =>
  L.divIcon({
    className: "",
    iconSize: [0, 0],
    html: `<span style="transform:translate(-50%,-50%);display:block;width:12px;height:12px;border-radius:999px;background:${SEVERITY_COLOR[a.severity]};box-shadow:0 0 0 2px #fff"></span>`,
  });

const patrolIcon = (t: Team) =>
  L.divIcon({
    className: "",
    iconSize: [0, 0],
    html: `<span style="transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:999px;background:#101828;color:#fff;box-shadow:0 0 0 2px #fff" aria-label="Patrouille ${t.name}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14v-5l-2-5H7l-2 5z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg></span>`,
  });

function FlyTo({ target }: { target?: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 14, { duration: 0.6 });
  }, [map, target]);
  return null;
}

export interface KinshasaMapProps {
  alerts?: Alert[];
  teams?: Team[];
  risks?: ZoneRisk[];
  highlight?: string;
  focus?: { lat: number; lng: number };
  zoom?: number;
  interactive?: boolean;
  /** Dots instead of labelled pills (small previews). */
  compact?: boolean;
  onSelectAlert?: (ref: string) => void;
}

/** Leaflet map of Kinshasa (OpenStreetMap tiles). Loaded client-side only, see `./index.tsx`. */
export default function KinshasaMap({
  alerts = [],
  teams = [],
  risks = [],
  highlight,
  focus,
  zoom = 12,
  interactive = true,
  compact = false,
  onSelectAlert,
}: KinshasaMapProps) {
  const center = focus ?? KINSHASA_CENTER;
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      scrollWheelZoom={interactive}
      dragging={interactive}
      zoomControl={interactive}
      doubleClickZoom={interactive}
      attributionControl={interactive}
      className="size-full bg-muted"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {risks.map((r) => {
        const c = COMMUNES[r.commune];
        if (!c) return null;
        const color = r.score >= 70 ? "#b42318" : "#b54708";
        return (
          <Circle
            key={r.commune}
            center={[c.lat, c.lng]}
            radius={900 + r.score * 12}
            pathOptions={{ color, weight: 1, fillColor: color, fillOpacity: 0.12, dashArray: "4 4" }}
          >
            <Tooltip>
              {r.commune} · risque {r.score}/100
            </Tooltip>
          </Circle>
        );
      })}
      {alerts.map((a) =>
        a.location ? (
          <Marker
            key={a.ref}
            position={[a.location.lat, a.location.lng]}
            icon={compact ? dotIcon(a) : incidentIcon(a, a.ref === highlight)}
            eventHandlers={{ click: () => onSelectAlert?.(a.ref) }}
            keyboard
            title={`${a.ref} ${a.type}`}
          >
            {compact && <Tooltip>{`${SEVERITY_TEXT[a.severity]} · ${a.ref} · ${a.type}`}</Tooltip>}
          </Marker>
        ) : null,
      )}
      {teams.map((t) => (
        <Marker key={t.id} position={[t.position.lat, t.position.lng]} icon={patrolIcon(t)} title={`Patrouille ${t.name}`} />
      ))}
      <FlyTo target={focus} />
    </MapContainer>
  );
}

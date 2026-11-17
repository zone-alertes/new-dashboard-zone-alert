"use client";

import Link from "next/link";
import { useState } from "react";
import { Car, Check, Maximize2 } from "lucide-react";
import { Button, Card, Chip, KpiCard } from "@/components/ui";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { KinshasaMap } from "@/components/map";
import { SeverityBadge, StatusBadge } from "@/features/alerts/components/alert-badges";
import { useActiveAlerts, useAlertCounts, useTeams } from "@/features/alerts/queries";
import { useZoneRisks } from "@/features/dashboard/queries";
import { timeAgo } from "@/lib/utils/format";
import { toast } from "@/stores/ui-store";
import { cn } from "@/lib/utils/cn";

type Layer = "incidents" | "patrols" | "risks" | "stations";

const TRACKING = [
  { label: "Assignée à Alpha-3", meta: "18:47", state: "done" },
  { label: "En route", meta: "18:48", state: "done" },
  { label: "Sur place", meta: "arrivée estimée 18:53", state: "now" },
  { label: "Résolue, rapport envoyé", meta: "—", state: "todo" },
] as const;

/** Screen 2.6 — Carte en direct · suivi (layer toggles are local UI state). */
export function LiveMapView() {
  const { data: alerts = [] } = useActiveAlerts();
  const { data: teams = [] } = useTeams();
  const { data: risks } = useZoneRisks();
  const counts = useAlertCounts();
  const [layers, setLayers] = useState<Record<Layer, boolean>>({ incidents: true, patrols: true, risks: true, stations: false });
  const [focusRef, setFocusRef] = useState<string>("ALT-2481");
  const focus = alerts.find((a) => a.ref === focusRef);
  const team = teams.find((t) => t.id === focus?.assignedTeamId);
  const toggle = (l: Layer) => setLayers((s) => ({ ...s, [l]: !s[l] }));

  const chips: { key: Layer; label: string }[] = [
    { key: "incidents", label: `Incidents (${counts?.actives ?? alerts.length})` },
    { key: "patrols", label: "Patrouilles (24)" },
    { key: "risks", label: "Zones à risque IA" },
    { key: "stations", label: "Commissariats" },
  ];

  return (
    <PageContent>
      <PageHeader
        title="Carte en direct"
        subtitle={`Mise à jour il y a 4 s · ${counts?.intervention ?? 9} interventions en cours · 24 patrouilles en service`}
        actions={
          <Button
            variant="secondary"
            icon={<Maximize2 className="size-[18px]" aria-hidden />}
            onClick={() => document.getElementById("live-map")?.requestFullscreen?.()}
          >
            Plein écran
          </Button>
        }
      />
      <div className="flex gap-2" role="group" aria-label="Couches de la carte">
        {chips.map((c) => (
          <Chip key={c.key} active={layers[c.key]} onClick={() => toggle(c.key)} className={cn(!layers[c.key] && "text-ink-2")}>
            {layers[c.key] && <Check className="size-3.5" aria-hidden />}
            {c.label}
          </Chip>
        ))}
      </div>

      <div className="flex items-start gap-6">
        <section
          id="live-map"
          className="relative h-[600px] min-w-0 flex-1 overflow-hidden rounded-xl border border-line bg-card"
          aria-label="Carte de Kinshasa"
        >
          <KinshasaMap
            alerts={layers.incidents ? alerts : []}
            teams={layers.patrols ? teams : []}
            risks={layers.risks ? risks?.zones : []}
            highlight={focusRef}
            onSelectAlert={setFocusRef}
          />
          <div className="absolute bottom-4 left-4 z-[400] flex flex-col gap-2 rounded-lg border border-line bg-card p-3.5">
            <p className="type-label text-ink-2">Légende</p>
            {[
              ["Grave", "bg-danger"],
              ["Sérieuse", "bg-warning"],
              ["Modérée", "bg-info"],
            ].map(([l, c]) => (
              <p key={l} className="flex items-center gap-2 type-small text-ink">
                <span className={cn("size-2.5 rounded-full", c)} /> Incident {l!.toLowerCase()} (libellé + couleur)
              </p>
            ))}
            <p className="flex items-center gap-2 type-small text-ink">
              <Car className="size-3.5" aria-hidden /> Patrouille
            </p>
          </div>
        </section>

        <div className="flex w-[360px] shrink-0 flex-col gap-6">
          <Card title={`Suivi · ${focus?.ref ?? "ALT-2481"}`} action={focus && <StatusBadge status={focus.status} />}>
            <p className="-mt-2 type-small text-ink-2">
              {focus ? `${focus.type} · ${focus.commune}` : "Braquage armé · Gombe"} {team ? ` · équipe ${team.name}` : ""}
            </p>
            {focus && focus.status !== "intervention" ? (
              <p className="type-small text-ink-2">
                {focus.status === "validee"
                  ? "Alerte validée : aucune équipe n'est encore assignée."
                  : "Alerte en cours de qualification : elle doit être validée avant l'envoi d'une équipe."}
              </p>
            ) : (
              <ol className="flex flex-col gap-3">
                {TRACKING.map((s) => (
                  <li key={s.label} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-[22px] items-center justify-center rounded-full",
                        s.state === "done" && "bg-success text-on-brand",
                        s.state === "now" && "border-2 border-info bg-info-soft",
                        s.state === "todo" && "bg-muted",
                      )}
                    >
                      {s.state === "done" && <Check className="size-3" strokeWidth={3} aria-hidden />}
                    </span>
                    <span className="flex flex-col">
                      <span className={s.state === "todo" ? "type-body text-ink-3" : "type-body-strong text-ink"}>
                        {s.label.replace("Alpha-3", team?.name ?? "Alpha-3")}
                      </span>
                      <span className="type-caption text-ink-3">{s.meta}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={focus?.status !== "intervention"}
                onClick={() => toast(`Appel radio vers l'équipe ${team?.name ?? ""}…`, { tone: "info" })}
              >
                Contacter l&apos;équipe
              </Button>
              <Link
                href={`/alertes/${focus?.ref ?? "ALT-2481"}`}
                className="inline-flex h-10 items-center rounded-lg px-4 type-body-strong text-ink-2 hover:bg-muted"
              >
                Voir l&apos;alerte
              </Link>
            </div>
          </Card>

          <Card title="Flux en direct">
            <ul className="flex flex-col gap-3">
              {alerts.slice(0, 4).map((a) => (
                <li key={a.ref}>
                  <button type="button" onClick={() => setFocusRef(a.ref)} className="flex w-full flex-col gap-1 rounded-lg py-1 text-left hover:bg-page">
                    <span className="flex w-full items-center justify-between">
                      <SeverityBadge severity={a.severity} />
                      <span className="type-caption text-ink-3">{timeAgo(a.receivedAt)}</span>
                    </span>
                    <span className="type-body-strong text-ink">
                      {a.type} · {a.commune}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Incidents actifs" value={String(counts?.actives ?? 18)} trend={`${counts?.en_qualification ?? 7} à qualifier`} />
        <KpiCard
          label="Patrouilles en service"
          value="24"
          trend={`${counts?.intervention ?? 9} en intervention · ${24 - (counts?.intervention ?? 9)} disponibles`}
        />
        <KpiCard label="Communes couvertes" value="24 / 24" trend="Ville de Kinshasa" />
        <KpiCard label="Temps de réponse moyen" value="8,4 min" trend="Objectif : moins de 10 min" />
      </div>
    </PageContent>
  );
}

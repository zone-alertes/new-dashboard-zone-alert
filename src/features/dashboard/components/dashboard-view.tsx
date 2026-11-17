"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Sparkles } from "lucide-react";
import { Button, ButtonLink, Card, KpiCard, Skeleton, Table, Td, Th, THead, Tr } from "@/components/ui";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { DailyBars, ScoreBar } from "@/components/charts/bar-chart";
import { KinshasaMap } from "@/components/map";
import { SeverityBadge } from "@/features/alerts/components/alert-badges";
import { useActiveAlerts, useAlertCounts } from "@/features/alerts/queries";
import { timeAgo } from "@/lib/utils/format";
import { toast } from "@/stores/ui-store";
import { useDashboardSummary, useZoneRisks } from "../queries";

/** Screen 2.1 — Tableau de bord. */
export function DashboardView() {
  const router = useRouter();
  const { data: summary } = useDashboardSummary();
  const { data: alerts } = useActiveAlerts();
  const counts = useAlertCounts();
  const { data: risks } = useZoneRisks();
  const priority = (alerts ?? []).filter((a) => a.status === "en_qualification" || a.status === "validee").slice(0, 5);

  return (
    <PageContent>
      <PageHeader
        title="Tableau de bord"
        subtitle={summary?.subtitle ?? " "}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Download className="size-[18px]" aria-hidden />}
              onClick={() => toast("Export PDF du tableau de bord en préparation", { tone: "info" })}
            >
              Exporter
            </Button>
            <ButtonLink href="/ia/rapports/nouveau" icon={<Sparkles className="size-[18px]" aria-hidden />}>
              Générer un rapport IA
            </ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        {summary ? summary.kpis.map((k) => <KpiCard key={k.label} {...k} />) : Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[118px]" />)}
      </div>

      <div className="flex items-start gap-6">
        <Card
          title="Alertes à traiter en priorité"
          className="min-w-0 flex-1"
          action={
            <ButtonLink href="/alertes" variant="ghost">
              Voir les {counts?.actives ?? 18} alertes
            </ButtonLink>
          }
        >
          <Table>
            <THead>
              <tr>
                <Th width={112}>Gravité</Th>
                <Th>Type</Th>
                <Th width={150}>Lieu</Th>
                <Th width={90}>Reçue</Th>
                <Th width={110} />
              </tr>
            </THead>
            <tbody>
              {priority.map((a) => (
                <Tr key={a.ref} onClick={() => router.push(`/alertes/${a.ref}`)}>
                  <Td>
                    <SeverityBadge severity={a.severity} />
                  </Td>
                  <Td strong>{a.type}</Td>
                  <Td>{a.commune}</Td>
                  <Td>{timeAgo(a.receivedAt)}</Td>
                  <Td className="text-right">
                    <Link
                      href={a.status === "validee" ? `/alertes/${a.ref}?action=assigner` : `/alertes/${a.ref}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex h-10 items-center rounded-lg border border-line-strong px-4 type-body-strong text-ink hover:bg-muted"
                    >
                      {a.status === "validee" ? "Assigner" : "Traiter"}
                    </Link>
                  </Td>
                </Tr>
              ))}
              {!alerts &&
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="py-2">
                      <Skeleton className="h-10" />
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Card>

        <Card
          title="Situation en direct"
          className="w-[400px] shrink-0"
          action={
            <Link href="/carte" className="type-body-strong text-brand-strong hover:underline">
              Ouvrir la carte
            </Link>
          }
        >
          <div className="h-[300px] overflow-hidden rounded-lg">
            <KinshasaMap alerts={alerts} interactive={false} zoom={11} compact />
          </div>
          {counts && (
            <div className="flex gap-2">
              <SeverityBadge severity="grave" count={counts.bySeverity.grave} />
              <SeverityBadge severity="serieuse" count={counts.bySeverity.serieuse} />
              <SeverityBadge severity="moderee" count={counts.bySeverity.moderee} />
            </div>
          )}
        </Card>
      </div>

      <div className="flex items-start gap-6">
        <Card
          title="Alertes reçues — 30 derniers jours"
          className="min-w-0 flex-1"
          action={<span className="type-small text-ink-3">{summary?.dailyCaption}</span>}
        >
          {summary ? (
            <DailyBars values={summary.daily} peakIndex={19} todayIndex={29} labels={["10 oct.", "1er nov.", "8 nov. (aujourd'hui)"]} />
          ) : (
            <Skeleton className="h-[184px]" />
          )}
        </Card>
        <Card title="Zones à surveiller · prédiction IA" className="w-[400px] shrink-0">
          {risks?.zones.map((z) => (
            <ScoreBar key={z.commune} label={z.commune} value={z.score} tone={z.score >= 70 ? "danger" : "warning"} suffix={`Risque ${z.score}/100`} />
          ))}
          {risks && (
            <p className="type-caption text-ink-3">
              Modèle {risks.model} · données au {risks.dataAt} · confiance moyenne {String(risks.confidence).replace(".", ",")}
            </p>
          )}
        </Card>
      </div>
    </PageContent>
  );
}

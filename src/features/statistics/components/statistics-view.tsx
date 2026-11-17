"use client";

import { CalendarDays, Download } from "lucide-react";
import { Badge, Button, Card, KpiCard, Skeleton, Table, Td, Th, THead, Tr } from "@/components/ui";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { GroupedBars } from "@/components/charts/bar-chart";
import { Donut } from "@/components/charts/donut";
import { toast } from "@/stores/ui-store";
import { useStatistics } from "../queries";

const SEVERITY_COLORS = { grave: "var(--za-status-danger)", serieuse: "var(--za-status-warning)", moderee: "var(--za-status-info)" } as const;

function downloadCsv(rows: readonly { commune: string; alerts: number; serious: number; response: string; resolution: string; trend: string }[]) {
  const header = "Commune;Alertes;Graves;Temps de réponse;Taux de résolution;Évolution";
  const body = rows.map((r) => [r.commune, r.alerts, r.serious, r.response, r.resolution, r.trend].join(";")).join("\n");
  const url = URL.createObjectURL(new Blob(["﻿" + header + "\n" + body], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "zone-alerte-statistiques-octobre-2026.csv" });
  a.click();
  URL.revokeObjectURL(url);
}

/** Screen 5.4 — Statistiques. */
export function StatisticsView() {
  const { data } = useStatistics("2026-10");
  return (
    <PageContent>
      <PageHeader
        title="Statistiques"
        subtitle={data?.subtitle ?? " "}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<CalendarDays className="size-[18px]" aria-hidden />}
              onClick={() => toast("Sélecteur de période : octobre 2026 (seule période de la démo)", { tone: "info" })}
            >
              Octobre 2026
            </Button>
            <Button
              variant="secondary"
              icon={<Download className="size-[18px]" aria-hidden />}
              disabled={!data}
              onClick={() => data && downloadCsv(data.byCommune)}
            >
              Exporter en CSV
            </Button>
          </>
        }
      />
      {!data ? (
        <Skeleton className="h-[700px]" />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {data.kpis.map((k) => (
              <KpiCard key={k.label} {...k} />
            ))}
          </div>
          <div className="flex items-start gap-6">
            <Card title="Alertes par semaine" className="min-w-0 flex-1">
              <GroupedBars data={data.weekly.map((w) => ({ label: w.week, current: w.current, previous: w.previous }))} legend={["Octobre", "Septembre"]} />
            </Card>
            <Card title="Répartition par gravité" className="w-[420px] shrink-0">
              <Donut
                total="412"
                unit="alertes"
                parts={data.severity.map((s) => ({ label: s.label, value: s.count, pct: s.pct, color: SEVERITY_COLORS[s.key] }))}
              />
            </Card>
          </div>
          <Card title="Par commune" action={<Button variant="ghost">Voir les 24 communes</Button>}>
            <Table>
              <THead>
                <tr>
                  <Th width={180}>Commune</Th>
                  <Th width={110}>Alertes</Th>
                  <Th width={110}>Graves</Th>
                  <Th width={160}>Temps de réponse</Th>
                  <Th width={170}>Taux de résolution</Th>
                  <Th>Évolution</Th>
                </tr>
              </THead>
              <tbody>
                {data.byCommune.map((c) => (
                  <Tr key={c.commune}>
                    <Td strong height={52}>
                      {c.commune}
                    </Td>
                    <Td height={52}>{c.alerts}</Td>
                    <Td height={52}>{c.serious}</Td>
                    <Td height={52}>{c.response}</Td>
                    <Td height={52}>{c.resolution}</Td>
                    <Td height={52}>
                      <Badge tone={c.tone}>{c.trend}</Badge>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </>
      )}
    </PageContent>
  );
}

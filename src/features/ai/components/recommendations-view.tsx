"use client";

import { Check, Download } from "lucide-react";
import { Badge, Button, Card, Skeleton, Table, Td, Th, THead, Tr } from "@/components/ui";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { useCan } from "@/stores/session-store";
import { toast } from "@/stores/ui-store";
import type { Recommendation } from "@/types/domain";
import { useDecideRecommendation, useRecommendations } from "../queries";

/** Screen 5.2 — Recommandations IA (human decision on each AI suggestion). */
export function RecommendationsView() {
  const { data } = useRecommendations();
  const pending = data?.byDanger.filter((r) => r.decision === "pending").length;

  return (
    <PageContent>
      <PageHeader
        title="Recommandations IA"
        subtitle={`${pending ?? "…"} recommandation${pending === 1 ? "" : "s"} en attente de décision · semaine du 9 au 15 nov. 2026`}
        actions={
          <Button
            variant="secondary"
            icon={<Download className="size-[18px]" aria-hidden />}
            onClick={() => toast("Export des recommandations en préparation", { tone: "info" })}
          >
            Exporter
          </Button>
        }
      />
      <Card title="Par type de danger">
        {!data ? (
          <Skeleton className="h-[300px]" />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th width={170}>Type de danger</Th>
                <Th width={130}>Tendance</Th>
                <Th width={130}>Prévision 2 sem.</Th>
                <Th>Recommandation</Th>
                <Th width={170}>Zones</Th>
                <Th width={230}>Décision</Th>
              </tr>
            </THead>
            <tbody>
              {data.byDanger.map((r) => (
                <Tr key={r.id}>
                  <Td strong height={68}>
                    {r.danger}
                  </Td>
                  <Td height={68}>
                    <Badge tone={r.trendTone}>{r.trend}</Badge>
                  </Td>
                  <Td height={68}>
                    <Badge tone={r.forecastTone}>{r.forecast}</Badge>
                  </Td>
                  <Td height={68}>{r.action}</Td>
                  <Td height={68}>{r.zones}</Td>
                  <Td height={68}>
                    <Decision rec={r} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
      <div className="flex items-start gap-6">
        <Card title="Par zone" className="min-w-0 flex-1">
          {data && (
            <Table>
              <THead>
                <tr>
                  <Th width={130}>Zone</Th>
                  <Th>Risques majeurs</Th>
                  <Th width={130}>Tendance</Th>
                  <Th width={130}>Créneau critique</Th>
                  <Th width={220}>Recommandation</Th>
                </tr>
              </THead>
              <tbody>
                {data.byZone.map((z) => (
                  <Tr key={z.zone}>
                    <Td strong height={60}>
                      {z.zone}
                    </Td>
                    <Td height={60}>{z.risks}</Td>
                    <Td height={60}>
                      <Badge tone={z.tone}>{z.trend}</Badge>
                    </Td>
                    <Td height={60}>{z.slot}</Td>
                    <Td height={60}>{z.action}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
        <Card title="Pourquoi « Délinquance urbaine » ?" className="w-[340px] shrink-0">
          <ul className="flex flex-col gap-3">
            {data?.rationale.points.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                <span className="type-small text-ink">{p}</span>
              </li>
            ))}
          </ul>
          <p className="type-caption text-ink-3">{data?.rationale.footnote}</p>
        </Card>
      </div>
    </PageContent>
  );
}

function Decision({ rec }: { rec: Recommendation }) {
  const decide = useDecideRecommendation();
  const canDecide = useCan("alert.assign");
  if (rec.decision === "accepted") return <Badge tone="success">Acceptée par {rec.decidedBy}</Badge>;
  if (rec.decision === "ignored") return <Badge tone="neutral">Ignorée par {rec.decidedBy}</Badge>;
  return (
    <div className="flex gap-2">
      <Button disabled={!canDecide || decide.isPending} onClick={() => decide.mutate({ id: rec.id, decision: "accepted" })}>
        Accepter
      </Button>
      <Button variant="secondary" disabled={!canDecide || decide.isPending} onClick={() => decide.mutate({ id: rec.id, decision: "ignored" })}>
        Ignorer
      </Button>
    </div>
  );
}

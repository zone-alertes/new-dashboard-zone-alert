"use client";

import { useState } from "react";
import { Shield, TriangleAlert } from "lucide-react";
import { Badge, Button, ButtonLink, Callout, Card, Modal, Skeleton, TextArea } from "@/components/ui";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { ForecastChart } from "@/components/charts/forecast-chart";
import { usePredictions, useReportPrediction } from "../queries";

/** Screen 5.1 — Prédictions IA. */
export function PredictionsView() {
  const { data } = usePredictions();
  const [reporting, setReporting] = useState(false);
  const [comment, setComment] = useState("");
  const report = useReportPrediction();

  return (
    <PageContent>
      <PageHeader
        title="Prédictions IA"
        subtitle={`Risque d'incidents sur 7 jours par commune · modèle ${data?.model ?? "v1.3"} · données au ${data?.dataAt ?? "…"}`}
        actions={
          <Button variant="secondary" onClick={() => setReporting(true)}>
            Signaler une prédiction erronée
          </Button>
        }
      />
      {!data ? (
        <Skeleton className="h-[640px]" />
      ) : (
        <>
          <div className="flex items-start gap-3.5 rounded-xl bg-warning-soft px-[18px] py-3.5 text-warning">
            <TriangleAlert className="size-[22px] shrink-0" aria-hidden />
            <div className="flex flex-1 flex-col gap-1">
              <p className="type-h3">{data.banner.title}</p>
              <p className="max-w-[820px] type-small">{data.banner.body}</p>
            </div>
            <ButtonLink href="/ia/recommandations" variant="secondary">
              Voir la recommandation
            </ButtonLink>
          </div>

          <div className="flex items-start gap-6">
            <Card title="Incidents prévus et observés · Gombe" className="min-w-0 flex-1">
              <ForecastChart {...data.forecast} />
              <p className="type-caption text-ink-3">{data.forecast.note}</p>
            </Card>
            <Card title="Facteurs de risque · Gombe" className="w-[400px] shrink-0">
              {data.factors.map((f) => (
                <div key={f.label} className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="type-small text-ink">{f.label}</span>
                    <span className="type-body-strong text-ink">{f.value} %</span>
                  </div>
                  <div className="h-2 rounded bg-muted">
                    <div className="h-2 rounded bg-info" style={{ width: `${f.value}%` }} />
                  </div>
                </div>
              ))}
              <p className="type-caption text-ink-3">Contribution relative de chaque facteur au score, pas une probabilité.</p>
            </Card>
          </div>

          <h2 className="type-h2 text-ink">Zones à surveiller en priorité</h2>
          <div className="grid grid-cols-4 gap-4">
            {data.zones.map((z) => (
              <Card key={z.commune} className="gap-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="type-h2 text-ink">{z.commune}</h3>
                  <Badge tone={z.score >= 70 ? "danger" : "warning"}>Risque {z.score}/100</Badge>
                </div>
                <p className="type-small text-ink-2">Incidents prévus : {z.expectedIncidents}</p>
                <p className="type-small text-ink-2">Patrouilles recommandées : {z.patrols}</p>
                <div className="flex flex-wrap gap-1.5">
                  {z.tags.map((t) => (
                    <span key={t} className="rounded-md bg-muted px-2 py-0.5 type-caption text-ink-2">
                      {t}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          <Callout tone="neutral" icon={<Shield aria-hidden />}>
            Les prédictions orientent la présence préventive par zone. Elles ne désignent jamais des personnes et sont toujours revues par un agent.
          </Callout>
        </>
      )}
      <Modal
        open={reporting}
        onClose={() => setReporting(false)}
        title="Signaler une prédiction erronée"
        description="Décrivez l'écart constaté. Votre retour sert à évaluer et réentraîner le modèle."
        footer={
          <>
            <Button variant="secondary" onClick={() => setReporting(false)}>
              Annuler
            </Button>
            <Button
              disabled={comment.trim().length < 10}
              loading={report.isPending}
              onClick={() => report.mutate(comment, { onSuccess: () => (setReporting(false), setComment("")) })}
            >
              Envoyer
            </Button>
          </>
        }
      >
        <TextArea
          label="Commentaire"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          hint="10 caractères minimum"
          placeholder="Ex. : aucun incident observé samedi soir à Gombe malgré un risque de 86/100."
        />
      </Modal>
    </PageContent>
  );
}

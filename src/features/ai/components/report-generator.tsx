"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { Badge, Button, Callout, Card, Checkbox, Skeleton, Stepper, TextArea, TextField } from "@/components/ui";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/stores/ui-store";
import { REPORT_SECTIONS, reportParamsSchema, type ReportParams } from "../schemas";
import { aiKeys, useReportDraft } from "../queries";

const DEFAULTS: ReportParams = {
  type: "Hebdomadaire de sécurité",
  period: "Du 1er au 7 nov. 2026",
  zone: "Kinshasa · 24 communes",
  recipients: "Direction PNC, Hôtel de ville",
  sections: ["Synthèse", "Indicateurs clés", "Incidents marquants", "Prévisions et recommandations"],
};

/** Screen 5.3 — Générer un rapport IA (AI drafts, a human reviews and validates). */
export function ReportGenerator() {
  const router = useRouter();
  const qc = useQueryClient();
  const [params, setParams] = useState<ReportParams>(DEFAULTS);
  const [step, setStep] = useState<2 | 3>(2);
  const [editing, setEditing] = useState(false);
  const { data: draft, isFetching, refetch } = useReportDraft(params);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const { control, register, handleSubmit, formState } = useForm<ReportParams>({ resolver: zodResolver(reportParamsSchema), defaultValues: DEFAULTS });

  const regenerate = handleSubmit((p) => {
    setOverrides({});
    if (JSON.stringify(p) === JSON.stringify(params)) refetch();
    else setParams(p);
  });

  return (
    <PageContent>
      <PageHeader
        title="Générer un rapport IA"
        subtitle="Le brouillon est rédigé par l’IA puis relu et validé par un agent avant diffusion"
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                qc.removeQueries({ queryKey: aiKeys.reports() });
                router.push("/tableau-de-bord");
              }}
            >
              Annuler
            </Button>
            <Button variant="secondary" onClick={() => toast("Brouillon du rapport enregistré", { tone: "info" })}>
              Enregistrer le brouillon
            </Button>
          </>
        }
      />
      <Stepper
        connector="fill"
        steps={[
          { label: "Paramètres", state: "done" },
          { label: "Brouillon généré", state: step === 2 ? "current" : "done" },
          { label: "Relecture et validation", state: step === 3 ? "current" : "todo" },
        ]}
      />
      <div className="flex items-start gap-6">
        <Card title="Paramètres" className="w-[380px] shrink-0">
          <form onSubmit={regenerate} className="flex flex-col gap-4" noValidate>
            <TextField label="Type de rapport" {...register("type")} />
            <TextField label="Période" {...register("period")} />
            <TextField label="Zone" {...register("zone")} />
            <TextField label="Destinataires" error={formState.errors.recipients?.message} {...register("recipients")} />
            <Controller
              control={control}
              name="sections"
              render={({ field }) => (
                <fieldset className="flex flex-col gap-2.5">
                  <legend className="mb-2.5 type-label text-ink-2">Sections incluses</legend>
                  {REPORT_SECTIONS.map((s) => {
                    const on = field.value.includes(s);
                    return (
                      <Checkbox
                        key={s}
                        checked={on}
                        onChange={(v) => field.onChange(v ? [...field.value, s] : field.value.filter((x) => x !== s))}
                        label={<span className={on ? "type-small text-ink" : "type-small text-ink-3"}>{s}</span>}
                      />
                    );
                  })}
                  {formState.errors.sections && <p className="type-caption text-danger">{formState.errors.sections.message}</p>}
                </fieldset>
              )}
            />
            <p className="type-caption text-ink-3">Les données personnelles sont exclues par défaut (anonymisation).</p>
            <Button type="submit" variant="secondary" loading={isFetching} className="w-full">
              Régénérer le brouillon
            </Button>
          </form>
        </Card>

        <Card
          title={draft?.title ?? "Génération du brouillon…"}
          action={<Badge tone="warning">Généré par IA · à relire</Badge>}
          className="min-w-0 flex-1 gap-[18px]"
        >
          {!draft || isFetching ? (
            <div className="flex flex-col gap-3" aria-busy>
              <Skeleton className="h-16" />
              <Skeleton className="h-24" />
              <Skeleton className="h-20" />
              <p className="type-small text-ink-3">L&apos;IA rédige le brouillon à partir des données validées…</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-3">
                {draft.kpis.map((k) => (
                  <div key={k.label} className="flex flex-col gap-0.5 rounded-lg bg-muted px-3.5 py-3">
                    <span className="type-caption text-ink-2">{k.label}</span>
                    <span className="type-h2 text-ink">{k.value}</span>
                  </div>
                ))}
              </div>
              {draft.sections
                .filter((s, i) => params.sections.includes((["Synthèse", "Incidents marquants", "Prévisions et recommandations"] as const)[i]!))
                .map((s) => (
                  <section key={s.title} className="flex flex-col gap-1.5">
                    <h3 className="type-h3 text-ink">{s.title}</h3>
                    {editing ? (
                      <TextArea
                        aria-label={s.title}
                        value={overrides[s.title] ?? s.body}
                        onChange={(e) => setOverrides((o) => ({ ...o, [s.title]: e.target.value }))}
                      />
                    ) : (
                      <p className="type-body text-ink-2">{overrides[s.title] ?? s.body}</p>
                    )}
                  </section>
                ))}
              <Callout tone="info" icon={<Info aria-hidden />}>
                {draft.sources}
              </Callout>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setEditing((e) => !e)}>
                  {editing ? "Terminer la modification" : "Modifier le texte"}
                </Button>
                <Button
                  disabled={step === 3}
                  onClick={() => {
                    setStep(3);
                    setEditing(false);
                    toast("Rapport envoyé en relecture · un analyste doit le valider avant diffusion");
                  }}
                >
                  {step === 3 ? "En relecture" : "Envoyer en relecture"}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </PageContent>
  );
}

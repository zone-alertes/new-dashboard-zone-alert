"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, GitMerge, Shield, Users } from "lucide-react";
import { Badge, Button, Callout, Card, EmptyState, Segmented, Skeleton, TextField } from "@/components/ui";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { KinshasaMap } from "@/components/map";
import { useCan } from "@/stores/session-store";
import { toast } from "@/stores/ui-store";
import { formatNumber, formatTime, timeAgo } from "@/lib/utils/format";
import type { Severity } from "@/types/domain";
import { SEVERITY_LABEL } from "../constants";
import { useAlert, useValidateAlert } from "../queries";
import { SeverityBadge, StatusBadge } from "./alert-badges";
import { AssignDrawer } from "./assign-drawer";
import { RejectDialog } from "./reject-dialog";

const SEVERITY_ON: Record<Severity, string> = {
  grave: "border-2 border-danger bg-danger-soft text-danger",
  serieuse: "border-2 border-warning bg-warning-soft text-warning",
  moderee: "border-2 border-info bg-info-soft text-info",
};

/**
 * Screens 2.3 → 2.5. The open dialog is part of the URL (`?action=rejeter|assigner`)
 * so it can be deep-linked from the dashboard, the list or a notification.
 */
export function AlertDetail({ alertRef }: { alertRef: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const action = useSearchParams().get("action");
  const { data: alert, isPending, error } = useAlert(alertRef);
  const validate = useValidateAlert(alertRef);
  const canQualify = useCan("alert.qualify");
  const canAssign = useCan("alert.assign");
  const [revealed, setRevealed] = useState<number[]>([]);
  const [severity, setSeverity] = useState<Severity | null>(null);

  const setAction = (a: "rejeter" | "assigner" | null) => router.replace(a ? `${pathname}?action=${a}` : pathname, { scroll: false });

  if (error)
    return (
      <EmptyState
        title="Alerte introuvable"
        description={error.message}
        action={
          <Link href="/alertes" className="type-body-strong text-brand-strong">
            Retour aux alertes
          </Link>
        }
      />
    );
  if (isPending || !alert)
    return (
      <PageContent>
        <Skeleton className="h-16 w-1/2" />
        <Skeleton className="h-[480px]" />
      </PageContent>
    );

  const qualifying = alert.status === "en_qualification" || alert.status === "recue";
  const toAssign = alert.status === "validee";
  const currentSeverity = severity ?? alert.severity;

  return (
    <PageContent>
      <title>{`${alert.ref} · ${alert.type} · Zone Alerte`}</title>
      <PageHeader
        title={`${alert.ref} · ${alert.type}`}
        subtitle={`Reçue ${timeAgo(alert.receivedAt)} (${formatTime(alert.receivedAt)}) · ${alert.place.replace(" · ", ", ")} · ${alert.reportsCount} signalement${alert.reportsCount > 1 ? "s" : ""}`}
        actions={
          qualifying && canQualify ? (
            <>
              <Button variant="secondary" onClick={() => setAction("rejeter")}>
                Rejeter
              </Button>
              <Button onClick={() => validate.mutate()} loading={validate.isPending}>
                Valider l&apos;alerte
              </Button>
            </>
          ) : toAssign && canAssign ? (
            <Button onClick={() => setAction("assigner")}>Assigner une équipe</Button>
          ) : alert.status === "intervention" ? (
            <Button variant="secondary" onClick={() => router.push("/carte")}>
              Suivre sur la carte
            </Button>
          ) : null
        }
      />
      <div className="-mt-2 flex gap-2">
        <SeverityBadge severity={currentSeverity} />
        <StatusBadge status={alert.status} label={toAssign ? "Validée · à assigner" : undefined} />
        {alert.aiConfidence && <Badge tone="neutral">Proposé par IA · confiance {formatNumber(alert.aiConfidence, 2)}</Badge>}
      </div>

      <Callout tone="info" icon={<Shield aria-hidden />}>
        L&apos;identité des signaleurs est masquée. Seul le rôle « Service de sécurité » peut la consulter, et chaque consultation est journalisée.
      </Callout>

      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Card title="Description">
            <p className="max-w-[640px] type-body text-ink">
              {alert.description ?? `${alert.type} signalé à ${alert.place}. Aucune description complémentaire fournie par le signaleur.`}
            </p>
          </Card>

          <Card title="Médias (2)" action={<span className="type-small text-ink-3">Floutés par défaut</span>}>
            <div className="flex gap-3">
              {["Photo · 18:39", "Vidéo 0:24 · 18:41"].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setRevealed((r) => (r.includes(i) ? r : [...r, i]))}
                  className="flex h-[140px] flex-1 flex-col items-center justify-center gap-2 rounded-lg bg-muted p-4 hover:bg-line"
                >
                  <Eye className="size-[22px] text-ink-3" aria-hidden />
                  <span className="type-small text-ink-2">{label}</span>
                  <span className="type-caption text-ink-3">{revealed.includes(i) ? "Média non disponible en démo" : "Cliquer pour afficher"}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card title={`Signalements liés (${alert.reports?.length ?? alert.reportsCount})`}>
            {(alert.reports ?? []).map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-1">
                <span className="flex size-9 items-center justify-center rounded-full bg-muted text-ink-3">
                  <Users className="size-4" aria-hidden />
                </span>
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="type-body-strong text-ink">{r.reporter}</span>
                  <span className="type-small text-ink-3">
                    {r.at} · {r.channel}
                  </span>
                </span>
                <span className="type-small text-ink-2">{r.reliability}</span>
              </div>
            ))}
            {!alert.reports && <p className="type-small text-ink-3">Détail des signalements disponible pour les comptes Service de sécurité.</p>}
            {alert.duplicateOf && qualifying && (
              <Callout
                tone="warning"
                icon={<GitMerge aria-hidden />}
                action={
                  <Button
                    variant="secondary"
                    onClick={() => toast(`Comparaison ${alert.ref} / ${alert.duplicateOf!.ref} : même commerce, mêmes suspects`, { tone: "info" })}
                  >
                    Comparer
                  </Button>
                }
              >
                Doublon probable : {alert.duplicateOf.ref} ({alert.duplicateOf.summary}). Vérifiez avant de valider.
              </Callout>
            )}
          </Card>
        </div>

        <div className="flex w-[380px] shrink-0 flex-col gap-6">
          <Card title="Localisation">
            <div className="h-[200px] overflow-hidden rounded-lg">
              {alert.location && <KinshasaMap alerts={[alert]} focus={alert.location} zoom={15} interactive={false} highlight={alert.ref} />}
            </div>
            <div className="flex flex-col gap-1">
              <p className="type-body-strong text-ink">{alert.location?.label}</p>
              <p className="type-small text-ink-3">{alert.location?.precision}</p>
            </div>
          </Card>

          <Card title="Qualification">
            <p className="-mb-2 type-label text-ink-2">Gravité</p>
            <Segmented<Severity>
              label="Gravité"
              value={currentSeverity}
              onChange={(s) => qualifying && setSeverity(s)}
              options={(["grave", "serieuse", "moderee"] as const).map((s) => ({ value: s, label: SEVERITY_LABEL[s] }))}
              toneFor={(s) => ({ on: SEVERITY_ON[s] })}
            />
            <TextField label="Type d'incident" defaultValue={alert.type} readOnly={!qualifying} />
          </Card>

          <Card title="Historique">
            <ol className="flex flex-col gap-4">
              {(alert.history ?? [{ at: formatTime(alert.receivedAt), label: "Reçue · application citoyenne" }]).map((h, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-line-strong" aria-hidden />
                  <span className="type-body-strong text-ink">{h.at}</span>
                  <span className="type-small text-ink-2">{h.label}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      <RejectDialog alert={alert} open={action === "rejeter" && qualifying} onClose={() => setAction(null)} />
      <AssignDrawer alert={alert} open={action === "assigner" && toAssign} onClose={() => setAction(null)} />
    </PageContent>
  );
}

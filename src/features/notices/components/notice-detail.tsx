"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Clock } from "lucide-react";
import { Badge, Button, ButtonLink, Card, EmptyState, KeyValue, Skeleton } from "@/components/ui";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { KinshasaMap } from "@/components/map";
import { useCan } from "@/stores/session-store";
import { toast } from "@/stores/ui-store";
import { initials } from "@/lib/utils/format";
import { NOTICE_STATUS_TONE, noticeStatusLabel } from "../constants";
import { useMarkFound, useNotice } from "../queries";

/** Screen 3.2 — Détail d'un avis. */
export function NoticeDetail({ noticeRef }: { noticeRef: string }) {
  const { data, isPending, error } = useNotice(noticeRef);
  const markFound = useMarkFound(noticeRef);
  const canPublish = useCan("notice.publish");
  const [showPhone, setShowPhone] = useState(false);

  if (error)
    return (
      <EmptyState
        title="Avis introuvable"
        description={error.message}
        action={
          <Link href="/avis-de-recherche" className="type-body-strong text-brand-strong">
            Retour aux avis
          </Link>
        }
      />
    );
  if (isPending || !data)
    return (
      <PageContent>
        <Skeleton className="h-16 w-1/2" />
        <Skeleton className="h-[520px]" />
      </PageContent>
    );

  const { notice, detail } = data;
  const found = notice.status === "retrouvee";
  const feminine = notice.sex === "Féminin";

  return (
    <PageContent>
      <title>{`${notice.ref} · ${notice.name} · Zone Alerte`}</title>
      <PageHeader
        title={`${notice.name} · ${found ? (feminine ? "retrouvée" : "retrouvé") : `${feminine ? "disparue" : "disparu"} depuis ${detail?.daysMissing ?? "plusieurs"} jours`}`}
        subtitle={detail ? `Avis ${notice.ref} · publié le ${detail.publishedAt} par ${detail.publishedBy} · ${detail.shares} partages` : `Avis ${notice.ref}`}
        actions={
          canPublish && (
            <>
              <Button variant="secondary" onClick={() => toast("Modification de l'avis : formulaire en 3 étapes", { tone: "info" })}>
                Modifier
              </Button>
              {!found && (
                <Button onClick={() => markFound.mutate()} loading={markFound.isPending}>
                  Marquer comme {feminine ? "retrouvée" : "retrouvé"}
                </Button>
              )}
            </>
          )
        }
      />
      <div className="-mt-2 flex gap-2">
        <Badge tone={NOTICE_STATUS_TONE[notice.status]}>{noticeStatusLabel(notice)}</Badge>
        <Badge tone="info">Diffusé : application + SMS</Badge>
        {detail && <Badge tone="neutral">Expire le {detail.expiresAt}</Badge>}
      </div>

      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Card title="Identité et signalement">
            <div className="flex items-start gap-6">
              {notice.photo ? (
                <Image src={notice.photo} alt={`Photo de ${notice.name}`} width={200} height={250} className="h-[250px] w-[200px] rounded-xl object-cover" />
              ) : (
                <div className="flex h-[250px] w-[200px] items-center justify-center rounded-xl bg-muted type-display text-ink-3">{initials(notice.name)}</div>
              )}
              <dl className="flex flex-col gap-4">
                <div className="flex gap-8">
                  {(
                    detail?.identity ?? [
                      ["Âge", `${notice.age} ans`],
                      ["Sexe", notice.sex],
                    ]
                  ).map(([k, v]) => (
                    <KeyValue key={k} label={k} value={v} />
                  ))}
                </div>
                {detail?.details.map(([k, v]) => (
                  <KeyValue key={k} label={k} value={v} />
                ))}
              </dl>
            </div>
          </Card>

          <Card title="Circonstances">
            <p className="max-w-[640px] type-body text-ink">{detail?.circumstances ?? `Dernier lieu connu : ${notice.lastPlace}.`}</p>
            <div className="h-[180px] overflow-hidden rounded-lg">
              <KinshasaMap focus={detail?.position} zoom={14} interactive={false} />
            </div>
            <p className="type-small text-ink-2">{detail?.lastKnown ?? `Dernier lieu connu : ${notice.lastPlace}`}</p>
          </Card>

          {detail && (
            <Card title={`Témoignages reçus (${detail.testimoniesCount})`} action={<Button variant="ghost">Tout voir</Button>}>
              {detail.testimonies.map((t) => (
                <div key={t.title} className="flex items-center gap-3 py-1">
                  <div className="flex flex-1 flex-col gap-0.5">
                    <p className="type-body-strong text-ink">{t.title}</p>
                    <p className="type-small text-ink-3">{t.meta}</p>
                  </div>
                  <Badge tone={t.tone}>{t.status}</Badge>
                </div>
              ))}
            </Card>
          )}
        </div>

        {detail && (
          <div className="flex w-[380px] shrink-0 flex-col gap-6">
            <Card title="Contact de la famille">
              <div className="flex flex-col gap-1">
                <p className="type-body-strong text-ink">{detail.family.name}</p>
                <p className="type-small text-ink-2">{showPhone ? detail.family.phone : detail.family.phoneMasked} · visible par les agents uniquement</p>
              </div>
              <Button
                variant="secondary"
                className="w-fit"
                onClick={() => {
                  setShowPhone(true);
                  toast("Consultation du numéro consignée dans le journal d'audit", { tone: "info" });
                }}
                disabled={showPhone}
              >
                Afficher le numéro
              </Button>
            </Card>
            <Card title="Consentement et diffusion">
              <ul className="flex flex-col gap-4">
                {detail.consent.map((c) => (
                  <li key={c.label} className="flex items-start gap-2.5">
                    <span
                      className={
                        c.ok
                          ? "flex size-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success"
                          : "flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-ink-3"
                      }
                    >
                      {c.ok ? <Check className="size-3" strokeWidth={3} aria-hidden /> : <Clock className="size-3" aria-hidden />}
                    </span>
                    <span className="type-small text-ink">{c.label}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Historique">
              <ol className="flex flex-col gap-4">
                {detail.history.map(([t, e]) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="shrink-0 type-body-strong text-ink">{t}</span>
                    <span className="type-small text-ink-2">{e}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        )}
      </div>
      {!detail && (
        <ButtonLink href="/avis-de-recherche" variant="secondary" className="w-fit">
          Retour aux avis
        </ButtonLink>
      )}
    </PageContent>
  );
}

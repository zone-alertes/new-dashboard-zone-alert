"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import type { LucideIcon } from "lucide-react";
import { Check, Shield, TrendingUp, TriangleAlert, Users } from "lucide-react";
import { Button, Card, EmptyState, SegmentTabs, Skeleton, Toggle } from "@/components/ui";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { useUrlState } from "@/hooks/use-url-state";
import type { AppNotification, NotificationKind } from "@/types/domain";
import { cn } from "@/lib/utils/cn";
import { useMarkRead, useNotifications, usePreferences, useSetPreference } from "../queries";

const KIND: Record<NotificationKind, { icon: LucideIcon; cls: string }> = {
  alerte: { icon: TriangleAlert, cls: "bg-danger-soft text-danger" },
  assignation: { icon: Users, cls: "bg-info-soft text-info" },
  prediction: { icon: TrendingUp, cls: "bg-warning-soft text-warning" },
  cloture: { icon: Check, cls: "bg-success-soft text-success" },
  avis: { icon: Users, cls: "bg-success-soft text-success" },
  systeme: { icon: Shield, cls: "bg-neutral-soft text-neutral" },
};

const filtersSchema = z.object({ filtre: z.enum(["toutes", "non_lues", "alertes", "avis", "systeme"]).catch("toutes") });
type Filter = z.infer<typeof filtersSchema>["filtre"];
const MATCH: Record<Filter, (n: AppNotification) => boolean> = {
  toutes: () => true,
  non_lues: (n) => !n.read,
  alertes: (n) => ["alerte", "assignation", "cloture", "prediction"].includes(n.kind),
  avis: (n) => n.kind === "avis",
  systeme: (n) => n.kind === "systeme",
};

/** Screen 6.1 — Notifications. */
export function NotificationsView() {
  const router = useRouter();
  const [{ filtre }, setFilters] = useUrlState(filtersSchema);
  const { data } = useNotifications();
  const markRead = useMarkRead();
  const unread = data?.filter((n) => !n.read).length ?? 0;
  const list = data?.filter(MATCH[filtre]) ?? [];
  const groups = [
    { label: "AUJOURD'HUI · 8 NOV.", items: list.filter((n) => n.day === "today") },
    { label: "HIER · 7 NOV.", items: list.filter((n) => n.day === "yesterday") },
  ].filter((g) => g.items.length);

  const open = (n: AppNotification) => {
    if (!n.read) markRead.mutate([n.id]);
    if (n.href) router.push(n.href);
  };

  return (
    <PageContent>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} non lue${unread > 1 ? "s" : ""} · les alertes graves sont aussi envoyées par SMS à l’équipe de garde`}
        actions={
          <Button variant="secondary" disabled={!unread} onClick={() => markRead.mutate("all")}>
            Tout marquer comme lu
          </Button>
        }
      />
      <SegmentTabs<Filter>
        label="Filtrer les notifications"
        value={filtre}
        onChange={(v) => setFilters({ filtre: v === "toutes" ? null : v })}
        items={[
          { value: "toutes", label: "Toutes" },
          { value: "non_lues", label: `Non lues (${unread})` },
          { value: "alertes", label: "Alertes" },
          { value: "avis", label: "Avis de recherche" },
          { value: "systeme", label: "Système" },
        ]}
      />
      <div className="flex items-start gap-6">
        <section className="min-w-0 flex-1 overflow-hidden rounded-xl border border-line bg-card" aria-label="Liste des notifications">
          {!data && <Skeleton className="m-5 h-80" />}
          {data && groups.length === 0 && <EmptyState title="Aucune notification" description="Vous êtes à jour." />}
          {groups.map((g) => (
            <div key={g.label}>
              <p className="bg-muted px-5 py-2.5 type-label text-ink-3">{g.label}</p>
              <ul>
                {g.items.map((n) => {
                  const { icon: Icon, cls } = KIND[n.kind];
                  return (
                    <li key={n.id} className={cn("flex items-start gap-3.5 border-b border-line px-5 py-4", !n.read && "bg-brand-soft")}>
                      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", cls)}>
                        <Icon className="size-[18px]" aria-hidden />
                      </span>
                      <button type="button" onClick={() => open(n)} className="flex flex-1 flex-col gap-1 text-left">
                        <span className="type-body-strong text-ink">{n.title}</span>
                        <span className="type-small text-ink-2">{n.body}</span>
                      </button>
                      {n.cta && (
                        <Button variant="secondary" className="self-center" onClick={() => open(n)}>
                          {n.cta}
                        </Button>
                      )}
                      <span className="flex flex-col items-end gap-1.5">
                        <span className="type-caption text-ink-3">{n.at}</span>
                        {!n.read && <span className="size-2 rounded-full bg-brand" aria-label="Non lue" />}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
        <PreferencesCard />
      </div>
    </PageContent>
  );
}

function PreferencesCard() {
  const { data } = usePreferences();
  const setPref = useSetPreference();
  return (
    <Card title="Mes préférences" className="w-[380px] shrink-0">
      <div className="flex items-center gap-2 type-label text-ink-3">
        <span className="flex-1">Événement</span>
        {["App", "SMS", "E-mail"].map((h) => (
          <span key={h} className="w-11 text-center">
            {h}
          </span>
        ))}
      </div>
      {data?.map((p) => (
        <div key={p.event} className="flex items-center gap-2">
          <span className="flex-1 type-small text-ink">{p.event}</span>
          {(["app", "sms", "email"] as const).map((ch) => (
            <span key={ch} className="flex w-11 justify-center">
              <Toggle
                label={`${p.event} · ${ch}`}
                checked={p[ch]}
                // Grave alerts stay on in-app for the on-duty team.
                disabled={p.event === "Alerte grave" && ch === "app"}
                onChange={(value) => setPref.mutate({ event: p.event, channel: ch, value })}
              />
            </span>
          ))}
        </div>
      ))}
      <p className="type-caption text-ink-3">Les alertes graves restent toujours actives dans l’application pour l’équipe de garde.</p>
    </Card>
  );
}

"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { TriangleAlert } from "lucide-react";
import { Badge, Button, Callout, Card, SegmentTabs, Skeleton, Table, Td, Th, THead, Toggle, Tr } from "@/components/ui";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { toast } from "@/stores/ui-store";
import type { SecuritySettings } from "../api";
import { useAuditLog, useRevokeSession, useSaveSecurity, useSecuritySettings, useSessions } from "../queries";

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 border-b border-line py-3 last:border-0">
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="type-body-strong text-ink">{title}</p>
        <p className="type-small text-ink-2">{desc}</p>
      </div>
      {children}
    </div>
  );
}

type Tab = "general" | "securite" | "notifications" | "integrations" | "audit";

/** Screen 6.3 — Paramètres · Sécurité. The form is dirty-tracked: "Enregistrer" is enabled only on change. */
export function SecuritySettingsView() {
  const { data: settings } = useSecuritySettings();
  const save = useSaveSecurity();
  const { control, handleSubmit, reset, formState } = useForm<SecuritySettings>();

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  return (
    <PageContent>
      <PageHeader
        title="Paramètres"
        subtitle="Configuration de la plateforme Zone Alerte"
        actions={
          <Button disabled={!formState.isDirty} loading={save.isPending} onClick={handleSubmit((v) => save.mutate(v))}>
            Enregistrer
          </Button>
        }
      />
      <SegmentTabs<Tab>
        label="Sections des paramètres"
        value="securite"
        onChange={(t) => t !== "securite" && toast("Seule la section Sécurité est maquettée en V2", { tone: "info" })}
        items={[
          { value: "general", label: "Général" },
          { value: "securite", label: "Sécurité" },
          { value: "notifications", label: "Notifications" },
          { value: "integrations", label: "Intégrations" },
          { value: "audit", label: "Journal d’audit" },
        ]}
      />
      <div className="flex items-start gap-6">
        <Card title="Authentification" className="min-w-0 flex-1 gap-0">
          {!settings ? (
            <Skeleton className="mt-4 h-60" />
          ) : (
            <div className="mt-4">
              <Row title="Double authentification obligatoire" desc="Pour tous les rôles. Code par application ou SMS.">
                <Controller
                  control={control}
                  name="enforce2fa"
                  render={({ field }) => <Toggle label="Double authentification obligatoire" checked={!!field.value} onChange={field.onChange} />}
                />
              </Row>
              <Row title="Expiration de session" desc="Déconnexion après une période d’inactivité">
                <Controller
                  control={control}
                  name="sessionTimeout"
                  render={({ field }) => (
                    <select
                      aria-label="Expiration de session"
                      value={field.value}
                      onChange={field.onChange}
                      className="h-10 rounded-lg border border-line-strong bg-card px-3 type-body text-ink"
                    >
                      {["15", "30", "60", "120"].map((m) => (
                        <option key={m} value={m}>
                          {m} min
                        </option>
                      ))}
                    </select>
                  )}
                />
              </Row>
              <Row title="Politique de mot de passe" desc="12 caractères minimum, renouvellement tous les 90 jours">
                <Button variant="ghost" onClick={() => toast("Politique de mot de passe : édition réservée à l'administrateur principal", { tone: "info" })}>
                  Modifier
                </Button>
              </Row>
              <Row title="Restriction par réseau" desc="Accès administrateur limité aux réseaux PNC et Hôtel de ville">
                <Controller
                  control={control}
                  name="networkRestriction"
                  render={({ field }) => <Toggle label="Restriction par réseau" checked={!!field.value} onChange={field.onChange} />}
                />
              </Row>
            </div>
          )}
        </Card>
        <SessionsCard />
      </div>
      <AuditCard />
    </PageContent>
  );
}

function SessionsCard() {
  const { data } = useSessions();
  const revoke = useRevokeSession();
  const unusual = data?.find((s) => "unusual" in s && s.unusual);
  return (
    <Card
      title="Sessions actives"
      className="w-[560px] shrink-0"
      action={
        <Button variant="danger" disabled={!data || data.length <= 1} onClick={() => revoke.mutate("others")}>
          Tout déconnecter
        </Button>
      }
    >
      <Table>
        <THead>
          <tr>
            <Th>Appareil</Th>
            <Th width={110}>Lieu</Th>
            <Th width={100}>Activité</Th>
            <Th width={120} />
          </tr>
        </THead>
        <tbody>
          {data?.map((s) => (
            <Tr key={s.id}>
              <Td className="text-ink">{s.device}</Td>
              <Td>{s.place}</Td>
              <Td>{s.activity}</Td>
              <Td>
                {s.current ? (
                  <Badge tone="success">Actuelle</Badge>
                ) : (
                  <Button variant="ghost" onClick={() => revoke.mutate(s.id)}>
                    Déconnecter
                  </Button>
                )}
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      {unusual && (
        <Callout tone="warning" icon={<TriangleAlert aria-hidden />}>
          Connexion inhabituelle depuis {unusual.place}. Vérifiez-la ou déconnectez la session.
        </Callout>
      )}
    </Card>
  );
}

function AuditCard() {
  const { data } = useAuditLog();
  return (
    <Card title="Journal d’audit récent" action={<Button variant="ghost">Tout voir</Button>}>
      <Table>
        <THead>
          <tr>
            <Th width={150}>Date</Th>
            <Th width={180}>Utilisateur</Th>
            <Th>Action</Th>
            <Th width={180}>Objet</Th>
          </tr>
        </THead>
        <tbody>
          {data?.slice(0, 6).map((a, i) => (
            <Tr key={i}>
              <Td height={52} className="text-ink">
                {a.at}
              </Td>
              <Td height={52}>{a.user}</Td>
              <Td height={52}>{a.action}</Td>
              <Td height={52}>{a.target}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

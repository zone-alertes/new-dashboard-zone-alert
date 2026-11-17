"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Ellipsis } from "lucide-react";
import { Avatar, Badge, Button, Card, KpiCard, Modal, Skeleton, Table, Td, Th, THead, Tr, TextField } from "@/components/ui";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { useSessionStore } from "@/stores/session-store";
import { toast } from "@/stores/ui-store";
import type { Permission, Role, User } from "@/types/domain";
import { cn } from "@/lib/utils/cn";
import { PERMISSION_LABEL, ROLES, ROLE_LABEL, ROLE_SHORT, ROLE_TONE, USER_STATUS } from "../constants";
import { inviteSchema, type InviteInput } from "../schemas";
import { useInviteUser, usePermissionsMatrix, useReset2fa, useSetRole, useSetStatus, useUsers } from "../queries";

/** Screen 6.2 — Utilisateurs et rôles. */
export function UsersView() {
  const [role, setRole] = useState<Role | undefined>();
  const [inviting, setInviting] = useState(false);
  const { data } = useUsers(role);
  const c = data?.counts;

  return (
    <PageContent>
      <PageHeader
        title="Utilisateurs et rôles"
        subtitle={`${c?.total ?? 38} comptes · accès selon le rôle, double authentification obligatoire`}
        actions={
          <Button icon onClick={() => setInviting(true)}>
            Inviter un utilisateur
          </Button>
        }
      />
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Comptes actifs" value={String(c?.active ?? "…")} trend="4 rôles" />
        <KpiCard label="Invitations en attente" value={String(c?.invitations ?? "…")} trend="expirent sous 72 h" />
        <KpiCard label="Comptes suspendus" value={String(c?.suspended ?? "…")} trend="dont 1 cette semaine" />
        <KpiCard label="2FA activée" value="100 %" trend="obligatoire" />
      </div>
      <div className="flex items-start gap-6">
        <Card
          title="Comptes"
          className="min-w-0 flex-1"
          action={
            <label className="relative">
              <span className="inline-flex h-10 items-center rounded-lg border border-line-strong px-4 type-body-strong text-ink">
                {role ? `Rôle : ${ROLE_LABEL[role]}` : "Filtrer par rôle"}
              </span>
              <select
                aria-label="Filtrer par rôle"
                className="absolute inset-0 cursor-pointer opacity-0"
                value={role ?? ""}
                onChange={(e) => setRole((e.target.value || undefined) as Role | undefined)}
              >
                <option value="">Tous les rôles</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </label>
          }
        >
          <Table>
            <THead>
              <tr>
                <Th>Utilisateur</Th>
                <Th width={170}>Rôle</Th>
                <Th width={150}>Dernière connexion</Th>
                <Th width={110}>Statut</Th>
                <Th width={44} />
              </tr>
            </THead>
            <tbody>
              {!data &&
                Array.from({ length: 6 }, (_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="py-2">
                      <Skeleton className="h-12" />
                    </td>
                  </tr>
                ))}
              {data?.items.map((u) => (
                <Tr key={u.id}>
                  <Td height={64}>
                    <span className="flex items-center gap-2.5">
                      <Avatar name={u.name} src={u.avatar} size={32} />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate type-body-strong text-ink">{u.name}</span>
                        <span className="truncate type-caption text-ink-3">
                          {u.status === "invitation" ? u.invitedBy : u.role === "admin" ? u.email : `${u.unit} · ${u.email}`}
                        </span>
                      </span>
                    </span>
                  </Td>
                  <Td height={64}>
                    <Badge tone={ROLE_TONE[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                  </Td>
                  <Td height={64}>{u.lastLoginAt ?? "Jamais"}</Td>
                  <Td height={64}>
                    <Badge tone={USER_STATUS[u.status].tone}>{USER_STATUS[u.status].label}</Badge>
                  </Td>
                  <Td height={64}>
                    <RowMenu user={u} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <PermissionsCard />
      </div>
      <InviteDialog open={inviting} onClose={() => setInviting(false)} />
    </PageContent>
  );
}

function RowMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const me = useSessionStore((s) => s.user?.id);
  const setRole = useSetRole();
  const setStatus = useSetStatus();
  const reset2fa = useReset2fa();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && (setOpen(false), setRoleOpen(false));
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const item = "flex w-full rounded-md px-3 py-2 text-left type-small hover:bg-page disabled:opacity-50";
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Actions pour ${user.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="rounded p-1 text-ink-3 hover:bg-muted"
      >
        <Ellipsis className="size-[18px]" />
      </button>
      {open && (
        <div role="menu" className="absolute top-8 right-0 z-20 w-[222px] rounded-[10px] border border-line bg-card p-1.5 shadow-popover">
          {!roleOpen ? (
            <>
              <button role="menuitem" type="button" className={cn(item, "text-ink")} disabled={user.id === me} onClick={() => setRoleOpen(true)}>
                Changer le rôle
              </button>
              <button role="menuitem" type="button" className={cn(item, "text-ink")} onClick={() => (reset2fa.mutate(user.id), setOpen(false))}>
                Réinitialiser la 2FA
              </button>
              <button
                role="menuitem"
                type="button"
                className={cn(item, "text-ink")}
                onClick={() => (toast(`Journal d'activité de ${user.name} : voir Paramètres › Journal d'audit`, { tone: "info" }), setOpen(false))}
              >
                Voir le journal d’activité
              </button>
              <button
                role="menuitem"
                type="button"
                disabled={user.id === me}
                className={cn(item, "text-danger")}
                onClick={() => (setStatus.mutate({ id: user.id, status: user.status === "suspendu" ? "actif" : "suspendu" }), setOpen(false))}
              >
                {user.status === "suspendu" ? "Réactiver le compte" : "Suspendre le compte"}
              </button>
            </>
          ) : (
            ROLES.map((r) => (
              <button
                key={r}
                role="menuitemradio"
                aria-checked={user.role === r}
                type="button"
                className={cn(item, "items-center justify-between text-ink")}
                onClick={() => (setRole.mutate({ id: user.id, role: r }), setOpen(false), setRoleOpen(false))}
              >
                {ROLE_LABEL[r]}
                {user.role === r && <Check className="size-4 text-success" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const MATRIX_ORDER: Permission[] = ["alert.qualify", "alert.assign", "alert.close", "notice.publish", "report.validate", "users.manage"];

function PermissionsCard() {
  const { data } = usePermissionsMatrix();
  return (
    <Card title="Rôles et permissions" className="w-[400px] shrink-0">
      <table className="w-full">
        <thead>
          <tr className="type-label text-ink-3">
            <th className="text-left font-medium">
              <span className="sr-only">Permission</span>
            </th>
            {ROLES.map((r) => (
              <th key={r} scope="col" className="w-12 text-center font-medium" title={ROLE_LABEL[r]}>
                {ROLE_SHORT[r]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MATRIX_ORDER.map((p) => (
            <tr key={p}>
              <th scope="row" className="py-2 text-left type-small font-normal text-ink">
                {PERMISSION_LABEL[p]}
              </th>
              {ROLES.map((r) => (
                <td key={r} className="text-center">
                  {data?.[r].includes(p) ? (
                    <Check className="mx-auto size-4 text-success" aria-label="Autorisé" />
                  ) : (
                    <span className="type-small text-ink-3" aria-label="Non autorisé">
                      —
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="type-caption text-ink-3">Toute action sensible est consignée dans le journal d’audit.</p>
    </Card>
  );
}

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const invite = useInviteUser();
  const { register, handleSubmit, reset, formState } = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "operateur" },
  });
  const close = () => (reset(), onClose());
  const submit = handleSubmit((v) => invite.mutate(v, { onSuccess: close }));
  return (
    <Modal
      open={open}
      onClose={close}
      title="Inviter un utilisateur"
      description="L'invitation expire sous 72 h. La double authentification sera demandée à la première connexion."
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Annuler
          </Button>
          <Button onClick={submit} loading={invite.isPending}>
            Envoyer l&apos;invitation
          </Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <TextField label="Adresse email professionnelle" type="email" error={formState.errors.email?.message} {...register("email")} />
        <label className="flex flex-col gap-1.5">
          <span className="type-label text-ink-2">Rôle</span>
          <select className="h-10 rounded-lg border border-line-strong bg-card px-3 type-body text-ink" {...register("role")}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </label>
      </form>
    </Modal>
  );
}

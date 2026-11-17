"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Role, User } from "@/types/domain";
import { useSessionStore } from "@/stores/session-store";
import { toast } from "@/stores/ui-store";
import { settingsKeys } from "@/features/settings/queries";
import { usersApi } from "./api";
import { ROLE_LABEL } from "./constants";
import type { InviteInput } from "./schemas";

export const userKeys = {
  all: ["users"] as const,
  list: (role?: Role) => [...userKeys.all, "list", role ?? "all"] as const,
  permissions: () => [...userKeys.all, "permissions"] as const,
};

const actor = () => useSessionStore.getState().user?.name ?? "Système";

export const useUsers = (role?: Role) => useQuery({ queryKey: userKeys.list(role), queryFn: () => usersApi.list(role) });
export const usePermissionsMatrix = () => useQuery({ queryKey: userKeys.permissions(), queryFn: usersApi.permissions, staleTime: Infinity });

function useUserMutation<V>(fn: (v: V) => Promise<User>, message: (u: User, v: V) => string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (u, v) => toast(message(u, v)),
    onError: (e) => toast(e.message, { tone: "danger" }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      qc.invalidateQueries({ queryKey: settingsKeys.audit() });
    },
  });
}

export const useSetRole = () =>
  useUserMutation(
    (v: { id: string; role: Role }) => usersApi.setRole(v.id, v.role, actor()),
    (u) => `${u.name} est désormais ${ROLE_LABEL[u.role]} · consigné dans le journal d'audit`,
  );
export const useSetStatus = () =>
  useUserMutation(
    (v: { id: string; status: User["status"] }) => usersApi.setStatus(v.id, v.status, actor()),
    (u) => (u.status === "suspendu" ? `Compte de ${u.name} suspendu` : `Compte de ${u.name} réactivé`),
  );
export const useReset2fa = () =>
  useUserMutation(
    (id: string) => usersApi.reset2fa(id, actor()),
    (u) => `2FA réinitialisée pour ${u.name} · un SMS d'enrôlement est envoyé`,
  );
export const useInviteUser = () =>
  useUserMutation(
    (v: InviteInput) => usersApi.invite(v, actor()),
    (u) => `Invitation envoyée à ${u.email} · expire sous 72 h`,
  );

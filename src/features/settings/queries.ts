"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/stores/session-store";
import { toast } from "@/stores/ui-store";
import { settingsApi, type SecuritySettings } from "./api";

export const settingsKeys = {
  all: ["settings"] as const,
  security: () => [...settingsKeys.all, "security"] as const,
  sessions: () => [...settingsKeys.all, "sessions"] as const,
  audit: () => ["audit"] as const,
};

const actor = () => useSessionStore.getState().user?.name ?? "Système";

export const useSecuritySettings = () => useQuery({ queryKey: settingsKeys.security(), queryFn: settingsApi.security });
export const useSessions = () => useQuery({ queryKey: settingsKeys.sessions(), queryFn: settingsApi.sessions });
export const useAuditLog = () => useQuery({ queryKey: settingsKeys.audit(), queryFn: settingsApi.audit });

export function useSaveSecurity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (s: SecuritySettings) => settingsApi.saveSecurity(s, actor()),
    onSuccess: (s) => {
      qc.setQueryData(settingsKeys.security(), s);
      qc.invalidateQueries({ queryKey: settingsKeys.audit() });
      toast("Paramètres de sécurité enregistrés");
    },
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | "others") => settingsApi.revokeSession(id, actor()),
    onSuccess: (sessions, id) => {
      qc.setQueryData(settingsKeys.sessions(), sessions);
      qc.invalidateQueries({ queryKey: settingsKeys.audit() });
      toast(id === "others" ? "Toutes les autres sessions ont été déconnectées" : "Session déconnectée");
    },
  });
}

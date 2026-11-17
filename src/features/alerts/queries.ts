"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Alert, AlertStatus } from "@/types/domain";
import { useSessionStore } from "@/stores/session-store";
import { toast } from "@/stores/ui-store";
import { notificationKeys } from "@/features/notifications/queries";
import { alertsApi } from "./api";
import type { AlertFilters, AssignInput, RejectInput } from "./schemas";

/** Query-key factory: every key derives from `alertKeys.all` so one invalidation refreshes the domain. */
export const alertKeys = {
  all: ["alerts"] as const,
  lists: () => [...alertKeys.all, "list"] as const,
  list: (f: AlertFilters) => [...alertKeys.lists(), f] as const,
  active: () => [...alertKeys.all, "active"] as const,
  counts: () => [...alertKeys.all, "counts"] as const,
  detail: (ref: string) => [...alertKeys.all, "detail", ref] as const,
  teams: () => ["teams"] as const,
};

export const useAlerts = (f: AlertFilters) => useQuery({ queryKey: alertKeys.list(f), queryFn: () => alertsApi.list(f), placeholderData: keepPreviousData });
export const useActiveAlerts = () => useQuery({ queryKey: alertKeys.active(), queryFn: alertsApi.active, refetchInterval: 30_000 });
export const useAlert = (ref: string) => useQuery({ queryKey: alertKeys.detail(ref), queryFn: () => alertsApi.get(ref) });
export const useTeams = () => useQuery({ queryKey: alertKeys.teams(), queryFn: alertsApi.teams });

/** Counters shared by the sidebar, tabs and KPIs (polled to feel "live"). */
export function useAlertCounts() {
  return useQuery({ queryKey: alertKeys.counts(), queryFn: alertsApi.counts, refetchInterval: 30_000 }).data;
}

const actor = () => useSessionStore.getState().user?.name ?? "Système";

/**
 * Optimistic status change on the detail cache, rolled back on error,
 * then every alert query is invalidated (lists, counters, map).
 */
function useStatusMutation<V>(
  ref: string,
  opts: { mutate: (v: V) => Promise<Alert>; optimistic: (v: V) => AlertStatus; success: (v: V, prev: AlertStatus) => void },
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: opts.mutate,
    onMutate: async (vars: V) => {
      await qc.cancelQueries({ queryKey: alertKeys.detail(ref) });
      const previous = qc.getQueryData<Alert>(alertKeys.detail(ref));
      if (previous) qc.setQueryData<Alert>(alertKeys.detail(ref), { ...previous, status: opts.optimistic(vars) });
      return { previous };
    },
    onError: (err, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(alertKeys.detail(ref), ctx.previous);
      toast(err instanceof Error ? err.message : "Action impossible", { tone: "danger" });
    },
    onSuccess: (alert, vars, ctx) => {
      qc.setQueryData(alertKeys.detail(ref), alert);
      opts.success(vars, ctx?.previous?.status ?? "en_qualification");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: alertKeys.all });
      qc.invalidateQueries({ queryKey: alertKeys.teams() });
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

function useUndo(ref: string) {
  const qc = useQueryClient();
  return (status: AlertStatus) => async () => {
    const alert = await alertsApi.restore(ref, status, actor());
    qc.setQueryData(alertKeys.detail(ref), alert);
    qc.invalidateQueries({ queryKey: alertKeys.all });
    toast(`${ref} : action annulée`, { tone: "info" });
  };
}

export function useValidateAlert(ref: string) {
  const undo = useUndo(ref);
  return useStatusMutation<void>(ref, {
    mutate: () => alertsApi.validate(ref, actor()),
    optimistic: () => "validee",
    success: (_v, prev) => toast(`${ref} validée · prête à être assignée`, { action: { label: "Annuler", onClick: undo(prev) } }),
  });
}

export function useRejectAlert(ref: string) {
  const undo = useUndo(ref);
  return useStatusMutation<RejectInput>(ref, {
    mutate: (input) => alertsApi.reject(ref, input, actor()),
    optimistic: (input) => (input.reason === "doublon" ? "fusionnee" : "rejetee"),
    success: (input, prev) =>
      toast(input.reason === "doublon" ? `${ref} fusionnée dans ${input.mergeInto}` : `${ref} rejetée`, { action: { label: "Annuler", onClick: undo(prev) } }),
  });
}

export function useAssignTeam(ref: string) {
  return useStatusMutation<AssignInput & { teamName: string }>(ref, {
    mutate: (input) => alertsApi.assign(ref, input, actor()),
    optimistic: () => "intervention",
    success: (input) => toast(`Équipe ${input.teamName} assignée à ${ref} · notification envoyée`),
  });
}

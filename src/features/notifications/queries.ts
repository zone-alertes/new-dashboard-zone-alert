"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppNotification } from "@/types/domain";
import { toast } from "@/stores/ui-store";
import { notificationsApi, type PreferenceChannel } from "./api";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
  preferences: () => [...notificationKeys.all, "preferences"] as const,
};

export const useNotifications = () => useQuery({ queryKey: notificationKeys.list(), queryFn: notificationsApi.list, refetchInterval: 30_000 });

/** Derived state through `select`: components re-render only when the count changes. */
export function useUnreadCount() {
  return useQuery({ queryKey: notificationKeys.list(), queryFn: notificationsApi.list, select: (list) => list.filter((n) => !n.read).length }).data ?? 0;
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markRead,
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: notificationKeys.list() });
      const previous = qc.getQueryData<AppNotification[]>(notificationKeys.list());
      qc.setQueryData<AppNotification[]>(notificationKeys.list(), (list) => list?.map((n) => (ids === "all" || ids.includes(n.id) ? { ...n, read: true } : n)));
      return { previous };
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(notificationKeys.list(), ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: notificationKeys.list() }),
  });
}

export const usePreferences = () => useQuery({ queryKey: notificationKeys.preferences(), queryFn: notificationsApi.preferences });

export function useSetPreference() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { event: string; channel: PreferenceChannel; value: boolean }) => notificationsApi.setPreference(v.event, v.channel, v.value),
    onSuccess: (prefs) => {
      qc.setQueryData(notificationKeys.preferences(), prefs);
      toast("Préférence enregistrée");
    },
  });
}

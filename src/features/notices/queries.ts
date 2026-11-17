"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/stores/session-store";
import { toast } from "@/stores/ui-store";
import { noticesApi } from "./api";
import type { NoticeTab } from "./constants";
import type { NoticePersonInput } from "./schemas";

export const noticeKeys = {
  all: ["notices"] as const,
  list: (tab: NoticeTab, q = "") => [...noticeKeys.all, "list", tab, q] as const,
  detail: (ref: string) => [...noticeKeys.all, "detail", ref] as const,
};

const actor = () => useSessionStore.getState().user?.name ?? "Système";

export const useNotices = (tab: NoticeTab, q = "") => useQuery({ queryKey: noticeKeys.list(tab, q), queryFn: () => noticesApi.list(tab, q) });
export const useNotice = (ref: string) => useQuery({ queryKey: noticeKeys.detail(ref), queryFn: () => noticesApi.get(ref) });

export function useMarkFound(ref: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => noticesApi.markFound(ref, actor()),
    onSuccess: (n) => {
      toast(`${n.name} marquée comme retrouvée · l'avis est retiré de la diffusion`);
      qc.invalidateQueries({ queryKey: noticeKeys.all });
    },
  });
}

export function useCreateNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NoticePersonInput) => noticesApi.create(input, actor()),
    onSuccess: (n) => {
      toast(`Avis ${n.ref} publié · diffusion en cours`);
      qc.invalidateQueries({ queryKey: noticeKeys.all });
    },
  });
}

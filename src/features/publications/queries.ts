"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/stores/session-store";
import { toast } from "@/stores/ui-store";
import { publicationsApi } from "./api";
import type { PubTab } from "./constants";
import type { PublicationInput } from "./schemas";

export const publicationKeys = {
  all: ["publications"] as const,
  list: (tab: PubTab, q: string) => [...publicationKeys.all, "list", tab, q] as const,
};

const actor = () => useSessionStore.getState().user?.name ?? "Système";

export const usePublications = (tab: PubTab, q: string) =>
  useQuery({ queryKey: publicationKeys.list(tab, q), queryFn: () => publicationsApi.list(tab, q), placeholderData: keepPreviousData });

/** Archive with a 10 s undo (screen 4.3). */
export function useArchivePublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publicationsApi.archive(id, actor()),
    onSuccess: ({ publication, previous }) => {
      qc.invalidateQueries({ queryKey: publicationKeys.all });
      toast("Publication archivée", {
        duration: 10_000,
        action: {
          label: "Annuler (10 s)",
          onClick: async () => {
            await publicationsApi.restore(publication.id, previous);
            qc.invalidateQueries({ queryKey: publicationKeys.all });
          },
        },
      });
    },
  });
}

export function useCreatePublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ input, mode }: { input: PublicationInput; mode: "draft" | "review" }) => publicationsApi.create(input, mode, actor()),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: publicationKeys.all });
      toast(p.status === "brouillon" ? "Brouillon enregistré" : "Publication envoyée en relecture à un second administrateur");
    },
  });
}

export function useDeletePublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publicationsApi.remove(id, actor()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: publicationKeys.all });
      toast("Publication supprimée définitivement");
    },
  });
}

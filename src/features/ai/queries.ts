"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Recommendation } from "@/types/domain";
import { useSessionStore } from "@/stores/session-store";
import { toast } from "@/stores/ui-store";
import { aiApi } from "./api";
import type { ReportParams } from "./schemas";

export const aiKeys = {
  all: ["ai"] as const,
  predictions: () => [...aiKeys.all, "predictions"] as const,
  recommendations: () => [...aiKeys.all, "recommendations"] as const,
  reports: () => [...aiKeys.all, "report"] as const,
  report: (p: ReportParams) => [...aiKeys.reports(), p] as const,
};

const actor = () => useSessionStore.getState().user?.name ?? "Système";

export const usePredictions = () => useQuery({ queryKey: aiKeys.predictions(), queryFn: aiApi.predictions, staleTime: 5 * 60_000 });
export const useRecommendations = () => useQuery({ queryKey: aiKeys.recommendations(), queryFn: aiApi.recommendations });

/** Optimistic decision: the row switches to "Acceptée par …" instantly. */
export function useDecideRecommendation() {
  const qc = useQueryClient();
  type Data = Awaited<ReturnType<typeof aiApi.recommendations>>;
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "accepted" | "ignored" }) => aiApi.decide(id, decision, actor()),
    onMutate: async ({ id, decision }) => {
      await qc.cancelQueries({ queryKey: aiKeys.recommendations() });
      const previous = qc.getQueryData<Data>(aiKeys.recommendations());
      qc.setQueryData<Data>(aiKeys.recommendations(), (d) =>
        d ? { ...d, byDanger: d.byDanger.map((r): Recommendation => (r.id === id ? { ...r, decision, decidedBy: actor() } : r)) } : d,
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(aiKeys.recommendations(), ctx.previous);
      toast("La décision n'a pas pu être enregistrée", { tone: "danger" });
    },
    onSuccess: (r) =>
      toast(r.decision === "accepted" ? `Recommandation « ${r.danger} » acceptée · transmise au commandement` : `Recommandation « ${r.danger} » ignorée`),
    onSettled: () => qc.invalidateQueries({ queryKey: aiKeys.recommendations() }),
  });
}

export function useReportPrediction() {
  return useMutation({
    mutationFn: (comment: string) => aiApi.reportPrediction(comment, actor()),
    onSuccess: () => toast("Merci. Le signalement est transmis à l'équipe data pour réentraînement."),
  });
}

/** The draft is server state keyed by its parameters: regenerating = refetch. */
export const useReportDraft = (params: ReportParams | null) =>
  useQuery({ queryKey: aiKeys.report(params!), queryFn: () => aiApi.generateReport(params!), enabled: !!params, staleTime: Infinity });

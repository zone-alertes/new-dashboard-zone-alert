import { ApiError, mockRequest } from "@/lib/api/http";
import { audit, db } from "@/lib/mock/db";
import { PREDICTION, RECOMMENDATION_RATIONALE, REPORT_DRAFT, ZONE_RECOMMENDATIONS, ZONE_RISKS } from "@/lib/mock/data/analytics";
import type { Recommendation } from "@/types/domain";
import type { ReportParams } from "./schemas";

export const aiApi = {
  predictions: () => mockRequest(() => ({ ...PREDICTION, zones: ZONE_RISKS })),
  recommendations: () => mockRequest(() => ({ byDanger: db.recommendations, byZone: ZONE_RECOMMENDATIONS, rationale: RECOMMENDATION_RATIONALE })),
  decide: (id: string, decision: Exclude<Recommendation["decision"], "pending">, actor: string) =>
    mockRequest(() => {
      const r = db.recommendations.find((x) => x.id === id);
      if (!r) throw new ApiError("Recommandation introuvable", 404);
      r.decision = decision;
      r.decidedBy = actor;
      audit(actor, decision === "accepted" ? "A accepté une recommandation IA" : "A ignoré une recommandation IA", r.danger);
      return r;
    }),
  reportPrediction: (comment: string, actor: string) =>
    mockRequest(() => {
      audit(actor, "A signalé une prédiction erronée", comment.slice(0, 60));
      return true;
    }),
  /** Simulates the LLM drafting step (longer latency). */
  generateReport: (params: ReportParams) => mockRequest(() => ({ ...REPORT_DRAFT, params, generatedAt: new Date().toISOString() }), 1200),
};

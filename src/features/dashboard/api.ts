import { mockRequest } from "@/lib/api/http";
import { DASHBOARD, PREDICTION, ZONE_RISKS } from "@/lib/mock/data/analytics";

export const dashboardApi = {
  summary: () => mockRequest(() => DASHBOARD),
  zoneRisks: () => mockRequest(() => ({ zones: ZONE_RISKS, model: PREDICTION.model, dataAt: "8 nov. 18:00", confidence: PREDICTION.confidence })),
};

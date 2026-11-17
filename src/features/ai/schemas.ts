import { z } from "zod";

export const REPORT_SECTIONS = [
  "Synthèse",
  "Indicateurs clés",
  "Incidents marquants",
  "Prévisions et recommandations",
  "Données personnelles des victimes",
] as const;

export const reportParamsSchema = z.object({
  type: z.string().min(1),
  period: z.string().min(1),
  zone: z.string().min(1),
  recipients: z.string().min(1, "Destinataires requis"),
  sections: z.array(z.enum(REPORT_SECTIONS)).min(1, "Au moins une section"),
});
export type ReportParams = z.infer<typeof reportParamsSchema>;

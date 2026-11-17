import { z } from "zod";
import { ALERT_TABS } from "./constants";

/** URL search params of /alertes — the URL is the source of truth for filters. */
export const alertFiltersSchema = z.object({
  tab: z.enum(ALERT_TABS).catch("actives"),
  q: z.string().catch(""),
  severity: z
    .string()
    .transform((s) => s.split(",").filter((v): v is "grave" | "serieuse" | "moderee" => ["grave", "serieuse", "moderee"].includes(v)))
    .catch([]),
  page: z.coerce.number().int().min(1).catch(1),
});
export type AlertFilters = z.infer<typeof alertFiltersSchema>;

export const rejectSchema = z
  .object({
    reason: z.enum(["faux", "doublon", "hors_zone", "autre"]),
    mergeInto: z.string().optional(),
    comment: z.string().max(500, "500 caractères maximum").optional(),
  })
  .superRefine((v, ctx) => {
    if (v.reason === "doublon" && !v.mergeInto) ctx.addIssue({ code: "custom", path: ["mergeInto"], message: "Indiquez l'alerte d'origine." });
    if (v.reason === "autre" && !v.comment?.trim()) ctx.addIssue({ code: "custom", path: ["comment"], message: "Précisez le motif." });
  });
export type RejectInput = z.infer<typeof rejectSchema>;

export const assignSchema = z.object({
  teamId: z.string().min(1, "Choisissez une équipe."),
  instructions: z.string().max(500).optional(),
  notifySms: z.boolean(),
});
export type AssignInput = z.infer<typeof assignSchema>;

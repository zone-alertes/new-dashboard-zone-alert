import { z } from "zod";
import { PUB_TABS } from "./constants";

export const pubFiltersSchema = z.object({
  tab: z.enum(PUB_TABS).catch("toutes"),
  q: z.string().catch(""),
  page: z.coerce.number().int().min(1).catch(1),
  archiver: z.string().optional().catch(undefined),
});

export const publicationSchema = z.object({
  category: z.enum(["alerte", "information", "appel_temoins", "systeme"]),
  title: z.string().trim().min(8, "Titre trop court (8 caractères minimum)").max(90, "90 caractères maximum"),
  message: z.string().trim().min(20, "Message trop court").max(500, "500 caractères maximum"),
  zones: z.array(z.string()).min(1, "Choisissez au moins une commune"),
  channels: z.object({ app: z.boolean(), push: z.boolean(), sms: z.boolean() }).refine((c) => c.app || c.push || c.sms, "Choisissez au moins un canal"),
  publishAt: z.string(),
  expiresAt: z.string(),
});
export type PublicationInput = z.infer<typeof publicationSchema>;

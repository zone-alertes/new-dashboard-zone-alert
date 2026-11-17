import { z } from "zod";
import { NOTICE_TABS } from "./constants";

export const noticeFiltersSchema = z.object({
  tab: z.enum(NOTICE_TABS).catch("disparue"),
  q: z.string().catch(""),
});

/**
 * Step 2 of "Publier un avis". No field about ethnicity or skin colour (by design):
 * distinctive signs only. Minors require guardian consent.
 */
export const noticePersonSchema = z
  .object({
    fullName: z.string().trim().min(3, "Nom complet requis"),
    age: z.coerce.number<string | number>().int().min(0, "Âge invalide").max(120, "Âge invalide"),
    sex: z.enum(["Féminin", "Masculin"], { error: "Sexe requis" }),
    height: z.string().optional(),
    signs: z.string().optional(),
    outfit: z.string().optional(),
    missingAt: z.string().min(1, "Date et heure requises"),
    lastPlace: z.string().trim().min(3, "Dernier lieu requis"),
    familyContact: z
      .string()
      .trim()
      .regex(/^\+243[\d\s]{9,13}/, "Format attendu : +243 …"),
    languages: z.string().optional(),
    guardianConsent: z.boolean(),
    hasPhoto: z.boolean(),
  })
  .refine((v) => v.age >= 18 || v.guardianConsent, { path: ["guardianConsent"], message: "Accord du parent ou tuteur obligatoire pour une personne mineure." });

export type NoticePersonInput = z.output<typeof noticePersonSchema>;
export type NoticePersonFormValues = z.input<typeof noticePersonSchema>;

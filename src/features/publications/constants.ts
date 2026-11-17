import type { Tone } from "@/components/ui/badge";
import type { PublicationCategory, PublicationStatus } from "@/types/domain";

export const CATEGORY_LABEL: Record<PublicationCategory, string> = {
  alerte: "Alerte",
  information: "Information",
  appel_temoins: "Appel à témoins",
  systeme: "Système",
};
export const CATEGORY_TONE: Record<PublicationCategory, Tone> = { alerte: "danger", information: "info", appel_temoins: "warning", systeme: "neutral" };
export const PUB_STATUS_LABEL: Record<PublicationStatus, string> = {
  publiee: "Publiée",
  brouillon: "Brouillon",
  programmee: "Programmée",
  relecture: "En relecture",
  archivee: "Archivée",
};
export const PUB_STATUS_TONE: Record<PublicationStatus, Tone> = {
  publiee: "success",
  brouillon: "neutral",
  programmee: "info",
  relecture: "warning",
  archivee: "neutral",
};

export const PUB_TABS = ["toutes", "publiee", "programmee", "brouillon", "archivee"] as const;
export type PubTab = (typeof PUB_TABS)[number];

/** Rough SMS audience per commune (demo). */
export const AUDIENCE_PER_COMMUNE = 26_000;

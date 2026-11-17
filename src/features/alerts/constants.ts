import type { Tone } from "@/components/ui/badge";
import type { AlertStatus, RejectReason, Severity } from "@/types/domain";

export const SEVERITY_LABEL: Record<Severity, string> = { grave: "Grave", serieuse: "Sérieuse", moderee: "Modérée" };
export const SEVERITY_TONE: Record<Severity, Tone> = { grave: "danger", serieuse: "warning", moderee: "info" };

export const STATUS_LABEL: Record<AlertStatus, string> = {
  recue: "Reçue",
  en_qualification: "En qualification",
  validee: "Validée",
  intervention: "Intervention en cours",
  resolue: "Résolue",
  rejetee: "Rejetée",
  fusionnee: "Fusionnée",
  cloturee: "Clôturée",
};
/** Badge mapping documented on the Figma page "V2 — Fondations". */
export const STATUS_TONE: Record<AlertStatus, Tone> = {
  recue: "warning",
  en_qualification: "warning",
  validee: "neutral",
  intervention: "info",
  resolue: "success",
  rejetee: "neutral",
  fusionnee: "neutral",
  cloturee: "neutral",
};

export const REJECT_REASONS: { value: RejectReason; label: string }[] = [
  { value: "faux", label: "Faux signalement" },
  { value: "doublon", label: "Doublon d'une alerte existante" },
  { value: "hors_zone", label: "Hors zone de couverture" },
  { value: "autre", label: "Autre motif (à préciser)" },
];

export const ALERT_TABS = ["actives", "a_qualifier", "a_assigner", "intervention", "cloturees"] as const;
export type AlertTab = (typeof ALERT_TABS)[number];

export const ALERTS_PAGE_SIZE = 8;

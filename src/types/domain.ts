/**
 * Domain model shared by every feature.
 * Mirrors the vocabulary of the Figma V2 file (pages "V2 — Use cases & flux" and "V2 — User stories").
 */

/* ---------- Users & roles ---------- */
export type Role = "operateur" | "securite" | "analyste" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** "Administrateur principal" in the top bar for the main admin. */
  title: string;
  unit: string;
  avatar?: string;
  status: "actif" | "suspendu" | "invitation";
  lastLoginAt: string | null;
  invitedBy?: string;
}

export type Permission = "alert.qualify" | "alert.assign" | "alert.close" | "notice.publish" | "report.validate" | "users.manage";

/* ---------- Alerts ---------- */
export type Severity = "grave" | "serieuse" | "moderee";

/** Lifecycle — see board "C · Cycle de vie d'une alerte". */
export type AlertStatus = "recue" | "en_qualification" | "validee" | "intervention" | "resolue" | "rejetee" | "fusionnee" | "cloturee";

export type RejectReason = "faux" | "doublon" | "hors_zone" | "autre";

export interface Report {
  id: string;
  reporter: string;
  at: string;
  channel: string;
  reliability: string;
}

export interface TimelineEvent {
  at: string;
  label: string;
}

export interface Alert {
  ref: string;
  type: string;
  severity: Severity;
  commune: string;
  place: string;
  receivedAt: string;
  reportsCount: number;
  status: AlertStatus;
  description?: string;
  aiConfidence?: number;
  duplicateOf?: { ref: string; summary: string };
  reports?: Report[];
  history?: TimelineEvent[];
  location?: { lat: number; lng: number; label: string; precision: string };
  assignedTeamId?: string;
}

export interface Team {
  id: string;
  name: string;
  unit: string;
  distanceKm: number;
  etaMin: number | null;
  busyOn?: string;
  position: { lat: number; lng: number };
}

/* ---------- Wanted / missing person notices ---------- */
export type NoticeKind = "disparue" | "recherchee";
export type NoticeStatus = "disparue" | "mineur" | "retrouvee" | "recherchee";

export interface Notice {
  ref: string;
  kind: NoticeKind;
  name: string;
  age: number;
  sex: "Féminin" | "Masculin";
  missingSince: string;
  foundAt?: string;
  lastPlace: string;
  photo?: string;
  status: NoticeStatus;
}

/* ---------- Publications ---------- */
export type PublicationCategory = "alerte" | "information" | "appel_temoins" | "systeme";
export type PublicationStatus = "publiee" | "brouillon" | "programmee" | "relecture" | "archivee";

export interface Publication {
  id: string;
  category: PublicationCategory;
  status: PublicationStatus;
  title: string;
  excerpt: string;
  audience: string;
  byline: string;
  views: string;
}

/* ---------- Notifications ---------- */
export type NotificationKind = "alerte" | "assignation" | "prediction" | "cloture" | "avis" | "systeme";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  at: string;
  day: "today" | "yesterday";
  read: boolean;
  href?: string;
  cta?: string;
}

/* ---------- AI ---------- */
export interface ZoneRisk {
  commune: string;
  score: number;
  expectedIncidents: number;
  patrols: number;
  tags: string[];
}

export interface Recommendation {
  id: string;
  danger: string;
  trend: string;
  trendTone: "danger" | "success" | "neutral";
  forecast: string;
  forecastTone: "danger" | "warning" | "info";
  action: string;
  zones: string;
  decision: "pending" | "accepted" | "ignored";
  decidedBy?: string;
}

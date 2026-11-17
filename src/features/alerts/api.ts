import { ApiError, mockRequest } from "@/lib/api/http";
import { audit, db } from "@/lib/mock/db";
import type { Alert, AlertStatus, Severity } from "@/types/domain";
import { ALERTS_PAGE_SIZE, type AlertTab } from "./constants";
import type { AssignInput, RejectInput } from "./schemas";

const ACTIVE: AlertStatus[] = ["recue", "en_qualification", "validee", "intervention"];
const TAB_FILTER: Record<AlertTab, (a: Alert) => boolean> = {
  actives: (a) => ACTIVE.includes(a.status),
  a_qualifier: (a) => a.status === "en_qualification" || a.status === "recue",
  a_assigner: (a) => a.status === "validee",
  intervention: (a) => a.status === "intervention",
  cloturees: (a) => !ACTIVE.includes(a.status),
};

export interface AlertCounts {
  actives: number;
  en_qualification: number;
  a_assigner: number;
  intervention: number;
  cloturees: number;
  bySeverity: Record<Severity, number>;
}

export interface AlertPage {
  items: Alert[];
  total: number;
  page: number;
  pageCount: number;
}

function counts(): AlertCounts {
  const active = db.alerts.filter(TAB_FILTER.actives);
  return {
    actives: active.length,
    en_qualification: db.alerts.filter(TAB_FILTER.a_qualifier).length,
    a_assigner: db.alerts.filter(TAB_FILTER.a_assigner).length,
    intervention: db.alerts.filter(TAB_FILTER.intervention).length,
    cloturees: db.closedLast30Days + db.alerts.filter(TAB_FILTER.cloturees).length,
    bySeverity: {
      grave: active.filter((a) => a.severity === "grave").length,
      serieuse: active.filter((a) => a.severity === "serieuse").length,
      moderee: active.filter((a) => a.severity === "moderee").length,
    },
  };
}

function find(ref: string) {
  const alert = db.alerts.find((a) => a.ref === ref);
  if (!alert) throw new ApiError(`Alerte ${ref} introuvable`, 404);
  return alert;
}

export const alertsApi = {
  list: (f: { tab: AlertTab; q: string; severity: Severity[]; page: number }) =>
    mockRequest<AlertPage>(() => {
      const q = f.q.trim().toLowerCase();
      const items = db.alerts
        .filter(TAB_FILTER[f.tab])
        .filter((a) => !f.severity.length || f.severity.includes(a.severity))
        .filter((a) => !q || [a.ref, a.type, a.place].some((s) => s.toLowerCase().includes(q)));
      const pageCount = Math.max(1, Math.ceil(items.length / ALERTS_PAGE_SIZE));
      const page = Math.min(f.page, pageCount);
      return { items: items.slice((page - 1) * ALERTS_PAGE_SIZE, page * ALERTS_PAGE_SIZE), total: items.length, page, pageCount };
    }),

  counts: () => mockRequest(counts),

  /** All active alerts — used by the live map and the dashboard. */
  active: () => mockRequest(() => db.alerts.filter(TAB_FILTER.actives)),

  get: (ref: string) => mockRequest(() => find(ref)),

  teams: () => mockRequest(() => [...db.teams].sort((a, b) => (a.etaMin ?? 999) - (b.etaMin ?? 999))),

  validate: (ref: string, actor: string) =>
    mockRequest(() => {
      const a = find(ref);
      if (a.status !== "en_qualification" && a.status !== "recue") throw new ApiError("Cette alerte n'est plus en qualification.", 409);
      a.status = "validee";
      a.history = [...(a.history ?? []), { at: "18:46", label: `Validée par ${actor}` }];
      audit(actor, "A validé l’alerte", ref);
      return a;
    }),

  reject: (ref: string, input: RejectInput, actor: string) =>
    mockRequest(() => {
      const a = find(ref);
      a.status = input.reason === "doublon" ? "fusionnee" : "rejetee";
      a.history = [
        ...(a.history ?? []),
        { at: "18:46", label: input.reason === "doublon" ? `Fusionnée dans ${input.mergeInto} par ${actor}` : `Rejetée par ${actor}` },
      ];
      audit(
        actor,
        input.reason === "doublon" ? "A fusionné un doublon" : "A rejeté l’alerte",
        input.reason === "doublon" ? `${ref} → ${input.mergeInto}` : ref,
      );
      return a;
    }),

  /** Undo of validate / reject within the toast delay (US-09). */
  restore: (ref: string, status: AlertStatus, actor: string) =>
    mockRequest(() => {
      const a = find(ref);
      a.status = status;
      a.history = [...(a.history ?? []), { at: "18:46", label: `Action annulée par ${actor}` }];
      return a;
    }),

  assign: (ref: string, input: AssignInput, actor: string) =>
    mockRequest(() => {
      const a = find(ref);
      const team = db.teams.find((t) => t.id === input.teamId);
      if (!team) throw new ApiError("Équipe introuvable", 404);
      if (team.busyOn) throw new ApiError(`${team.name} est déjà en intervention.`, 409);
      a.status = "intervention";
      a.assignedTeamId = team.id;
      team.busyOn = ref;
      a.history = [...(a.history ?? []), { at: "18:47", label: `Équipe ${team.name} assignée par ${actor}` }];
      audit(actor, `A assigné l’équipe ${team.name}`, ref);
      db.notifications.unshift({
        id: `n-${Date.now()}`,
        kind: "assignation",
        title: `Équipe ${team.name} assignée à ${ref}`,
        body: `Par ${actor} · arrivée estimée ${team.etaMin} min`,
        at: "18:47",
        day: "today",
        read: false,
        href: "/carte",
      });
      return a;
    }),
};

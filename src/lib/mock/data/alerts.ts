import type { Alert, AlertStatus, Severity, Team } from "@/types/domain";
import { COMMUNES } from "./geo";

const at = (minutesAgo: number) => new Date(new Date("2026-11-08T18:45:00+01:00").getTime() - minutesAgo * 60000).toISOString();

type Row = [ref: string, type: string, severity: Severity, place: string, minutesAgo: number, reports: number, status: AlertStatus];

/** 18 active alerts: 7 to qualify, 2 validated, 9 in intervention — Grave 4, Sérieuse 7, Modérée 7. */
const ROWS: Row[] = [
  ["ALT-2481", "Braquage armé", "grave", "Gombe · av. de la Justice", 6, 3, "en_qualification"],
  ["ALT-2480", "Enlèvement signalé", "grave", "Ngaliema · Binza Pigeon", 14, 2, "intervention"],
  ["ALT-2479", "Incendie commercial", "serieuse", "Ngaliema · route de Matadi", 45, 5, "intervention"],
  ["ALT-2478", "Agression", "serieuse", "Limete · 7e rue", 60, 1, "validee"],
  ["ALT-2477", "Vol à l'arraché", "moderee", "Kintambo · marché", 120, 1, "en_qualification"],
  ["ALT-2476", "Attroupement", "moderee", "Masina · Petro-Congo", 180, 4, "intervention"],
  ["ALT-2475", "Violence domestique", "serieuse", "Bandalungwa · Lingwala", 240, 1, "en_qualification"],
  ["ALT-2474", "Cambriolage", "moderee", "Kalamu · Matonge", 300, 2, "validee"],
  ["ALT-2473", "Tentative d'enlèvement", "grave", "Lemba · Righini", 360, 2, "intervention"],
  ["ALT-2470", "Braquage", "grave", "Kintambo · Magasin", 420, 3, "intervention"],
  ["ALT-2469", "Rixe", "serieuse", "Masina · Sans-Fil", 440, 2, "intervention"],
  ["ALT-2468", "Agression", "serieuse", "Kasa-Vubu · Victoire", 480, 1, "en_qualification"],
  ["ALT-2467", "Accident avec délit de fuite", "serieuse", "Limete · bd Lumumba", 510, 3, "intervention"],
  ["ALT-2466", "Menaces", "serieuse", "Lingwala · Saio", 540, 1, "en_qualification"],
  ["ALT-2465", "Vol à l'étalage", "moderee", "Barumbu · marché central", 560, 1, "en_qualification"],
  ["ALT-2464", "Tapage nocturne", "moderee", "Bandalungwa · Kimbondo", 600, 2, "intervention"],
  ["ALT-2463", "Vol de moto", "moderee", "Ngiri-Ngiri · Elengesa", 630, 1, "intervention"],
  ["ALT-2462", "Dégradation", "moderee", "Selembao · Cité Verte", 660, 1, "en_qualification"],
];

const jitter = (ref: string) => (parseInt(ref.slice(-2), 10) % 7) * 0.003 - 0.009;

export const ALERTS: Alert[] = ROWS.map(([ref, type, severity, place, minutesAgo, reportsCount, status]) => {
  const commune = place.split(" · ")[0]!;
  const c = COMMUNES[commune] ?? COMMUNES.Gombe!;
  return {
    ref,
    type,
    severity,
    commune,
    place,
    receivedAt: at(minutesAgo),
    reportsCount,
    status,
    location: { lat: c.lat + jitter(ref), lng: c.lng - jitter(ref), label: place, precision: "± 50 m" },
    assignedTeamId: status === "intervention" && ref === "ALT-2480" ? "charlie-4" : undefined,
  };
});

/** Rich detail for the guiding case ALT-2481 (screens 2.3 → 2.6). */
Object.assign(ALERTS[0]!, {
  description:
    "Trois individus armés ont attaqué un commerce de téléphonie à l'angle de l'avenue de la Justice et du boulevard du 30 Juin. Des coups de feu ont été entendus. Les suspects sont partis vers le rond-point Socimat à bord d'une moto rouge.",
  aiConfidence: 0.82,
  duplicateOf: { ref: "ALT-2471", summary: "braquage, 300 m, 18:20" },
  location: {
    lat: -4.3032,
    lng: 15.3108,
    label: "Av. de la Justice × bd du 30 Juin, Gombe",
    precision: "Précision GPS ± 25 m · commissariat le plus proche : 1,1 km",
  },
  reports: [
    {
      id: "4821",
      reporter: "Signaleur anonyme #4821",
      at: "18:39",
      channel: "application citoyenne",
      reliability: "Fiabilité élevée · 12 signalements confirmés",
    },
    { id: "3307", reporter: "Signaleur anonyme #3307", at: "18:40", channel: "appel 112", reliability: "Fiabilité moyenne · 3 confirmés" },
    { id: "5590", reporter: "Signaleur anonyme #5590", at: "18:42", channel: "application citoyenne", reliability: "Nouveau signaleur" },
  ],
  history: [
    { at: "18:39", label: "Reçue · application citoyenne" },
    { at: "18:40", label: "Classée « Grave » par IA (confiance 0,82)" },
    { at: "18:42", label: "2 signalements rattachés automatiquement" },
    { at: "18:43", label: "Ouverte par Macgenius" },
  ],
} satisfies Partial<Alert>);

/** Closed alerts over the last 30 days (tab "Clôturées (30 j)"). */
export const CLOSED_LAST_30_DAYS = 394;

export const TEAMS: Team[] = [
  { id: "alpha-3", name: "Alpha-3", unit: "Police · Gombe", distanceKm: 1.2, etaMin: 6, position: { lat: -4.312, lng: 15.296 } },
  { id: "bravo-1", name: "Bravo-1", unit: "Police · Lingwala", distanceKm: 2.8, etaMin: 11, position: { lat: -4.326, lng: 15.299 } },
  { id: "delta-2", name: "Delta-2", unit: "PNC unité mobile", distanceKm: 4.1, etaMin: 15, position: { lat: -4.335, lng: 15.33 } },
  { id: "charlie-4", name: "Charlie-4", unit: "Police · Gombe", distanceKm: 0.9, etaMin: null, busyOn: "ALT-2480", position: { lat: -4.358, lng: 15.255 } },
];

import type { Recommendation, ZoneRisk } from "@/types/domain";

/* ---------- Dashboard (2.1) ---------- */
export const DASHBOARD = {
  subtitle: "Dimanche 8 novembre 2026 · situation à 18:45 · Kinshasa, 24 communes",
  kpis: [
    { label: "Alertes actives", value: "18", trend: "+3 depuis ce matin" },
    { label: "À qualifier", value: "7", trend: "La plus ancienne attend depuis 22 min" },
    { label: "Interventions en cours", value: "9", trend: "24 patrouilles en service" },
    { label: "Temps de réponse moyen", value: "8,4 min", trend: "−1,2 min vs semaine dernière" },
  ],
  /** Alerts received per day, 10 Oct → 8 Nov. Index 19 = peak on 1 Nov (31). */
  daily: [9, 12, 10, 14, 11, 13, 16, 12, 10, 15, 18, 14, 13, 17, 19, 15, 12, 16, 20, 31, 22, 18, 15, 14, 17, 13, 16, 12, 14, 11],
  dailyCaption: "412 ce mois · pic le 1er nov. (31)",
  severityLegend: { grave: 4, serieuse: 7, moderee: 7 },
};

/* ---------- Predictions (5.1) ---------- */
export const PREDICTION = {
  model: "v1.3",
  dataAt: "8 nov. 2026, 18:00",
  confidence: 0.74,
  banner: {
    title: "Risque très élevé à Gombe ce week-end",
    body: "78 % de probabilité d'au moins un incident grave vendredi ou samedi soir (intervalle de confiance 64 à 86 %). Facteurs principaux : match au stade des Martyrs, historique des vendredis soirs.",
  },
  forecast: {
    days: ["Lun. 9", "Mar. 10", "Mer. 11", "Jeu. 12", "Ven. 13", "Sam. 14", "Dim. 15"],
    predicted: [10, 13, 9, 15, 14, 22, 18],
    observed: [9, 12, 10, 14, 12],
    band: 3,
    note: "Les 5 premiers jours montrent les incidents observés la semaine dernière pour comparer la précision (écart moyen : 1,4 incident par jour).",
  },
  factors: [
    { label: "Heure : 18 h à 23 h", value: 85 },
    { label: "Événements publics", value: 70 },
    { label: "Historique des incidents", value: 62 },
    { label: "Conditions météo", value: 45 },
    { label: "Densité de population", value: 38 },
  ],
};

export const ZONE_RISKS: ZoneRisk[] = [
  { commune: "Gombe", score: 86, expectedIncidents: 14, patrols: 8, tags: ["Vie nocturne", "Banques", "Match au stade"] },
  { commune: "Kintambo", score: 72, expectedIncidents: 8, patrols: 4, tags: ["Attroupements", "Gare"] },
  { commune: "Masina", score: 50, expectedIncidents: 11, patrols: 5, tags: ["Densité", "Éclairage faible"] },
  { commune: "Limete", score: 42, expectedIncidents: 5, patrols: 3, tags: ["Zone industrielle", "Passages sombres"] },
];

/* ---------- Recommendations (5.2) ---------- */
export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "r1",
    danger: "Délinquance urbaine",
    trend: "Hausse +15 %",
    trendTone: "danger",
    forecast: "Très critique",
    forecastTone: "danger",
    action: "Renforcer la présence policière de 18 h à 22 h",
    zones: "Gombe, Matete, Limete",
    decision: "pending",
  },
  {
    id: "r2",
    danger: "Enlèvements",
    trend: "Hausse +15 %",
    trendTone: "danger",
    forecast: "Très critique",
    forecastTone: "danger",
    action: "Présence policière et alerte à la population",
    zones: "Gombe, Ngaliema",
    decision: "pending",
  },
  {
    id: "r3",
    danger: "Braquages",
    trend: "Hausse +8 %",
    trendTone: "danger",
    forecast: "Critique",
    forecastTone: "warning",
    action: "Points de contrôle mobiles le soir",
    zones: "Gombe, Kintambo",
    decision: "pending",
  },
  {
    id: "r4",
    danger: "Violences sexuelles",
    trend: "Baisse −10 %",
    trendTone: "success",
    forecast: "Risque modéré",
    forecastTone: "info",
    action: "Sensibilisation, patrouilles ciblées",
    zones: "Kasa-Vubu, Bandalungwa",
    decision: "accepted",
    decidedBy: "Macgenius",
  },
];

export const ZONE_RECOMMENDATIONS = [
  {
    zone: "Gombe",
    risks: "Braquages, vols à main armée",
    trend: "Hausse +15 %",
    tone: "danger",
    slot: "18 h à 22 h",
    action: "Renforcer la présence policière",
  },
  { zone: "Kintambo", risks: "Violences, vols à main armée", trend: "Hausse +15 %", tone: "danger", slot: "18 h à 22 h", action: "Patrouilles ciblées" },
  { zone: "Bandalungwa", risks: "Enlèvements, braquages", trend: "Hausse +15 %", tone: "danger", slot: "18 h à 22 h", action: "Alerte à la population" },
  { zone: "Limete", risks: "Manifestations, attroupements", trend: "Stable", tone: "neutral", slot: "18 h à 22 h", action: "Présence préventive" },
] as const;

export const RECOMMENDATION_RATIONALE = {
  title: "Pourquoi cette recommandation ?",
  points: ["42 signalements à Gombe, Matete et Limete en 14 jours (+15 %)", "70 % entre 18 h et 22 h", "Effet observé en octobre : −23 % après renforcement"],
  footnote: "Confiance du modèle : 0,74 · sources : signalements validés, calendrier des événements",
};

/* ---------- AI report (5.3) ---------- */
export const REPORT_DRAFT = {
  title: "Brouillon · Rapport hebdomadaire du 1er au 7 nov. 2026",
  kpis: [
    { label: "Alertes reçues", value: "96" },
    { label: "Temps de réponse", value: "8,4 min" },
    { label: "Taux de résolution", value: "94,2 %" },
    { label: "Avis résolus", value: "5" },
  ],
  sections: [
    {
      title: "1. Synthèse",
      body: "La semaine a enregistré 96 alertes, en hausse de 6 % par rapport à la semaine précédente. Gombe et Kintambo concentrent 41 % des incidents graves, principalement entre 18 h et 22 h. Le temps de réponse moyen s’améliore de 1,2 min grâce au renforcement des patrouilles à Gombe.",
    },
    {
      title: "2. Incidents marquants",
      body: "Braquage armé avenue de la Justice (Gombe), enlèvement à Ngaliema et incendie commercial route de Matadi. Les trois ont donné lieu à une intervention en moins de 10 min.",
    },
    {
      title: "3. Recommandations",
      body: "Maintenir le renforcement de 18 h à 22 h à Gombe, Matete et Limete. Prévoir des points de contrôle mobiles autour du stade des Martyrs le samedi 14 novembre.",
    },
  ],
  sources: "Sources : 96 signalements validés, 412 alertes du mois, prédictions v1.3. Chaque chiffre renvoie à sa requête.",
};

/* ---------- Statistics (5.4) ---------- */
export const STATISTICS = {
  period: "Octobre 2026",
  subtitle: "Octobre 2026 comparé à septembre · Kinshasa, 24 communes",
  kpis: [
    { label: "Alertes du mois", value: "412", trend: "+6 % vs sept." },
    { label: "Alertes clôturées", value: "394", trend: "95,6 % du total" },
    { label: "Temps de réponse moyen", value: "8,4 min", trend: "−1,2 min" },
    { label: "Taux de résolution", value: "94,2 %", trend: "+2,1 pts" },
  ],
  weekly: [
    { week: "Sem. 40", current: 88, previous: 74 },
    { week: "Sem. 41", current: 97, previous: 81 },
    { week: "Sem. 42", current: 104, previous: 92 },
    { week: "Sem. 43", current: 123, previous: 98 },
  ],
  severity: [
    { key: "grave", label: "Grave", count: 66, pct: 16 },
    { key: "serieuse", label: "Sérieuse", count: 148, pct: 36 },
    { key: "moderee", label: "Modérée", count: 198, pct: 48 },
  ],
  byCommune: [
    { commune: "Gombe", alerts: 64, serious: 14, response: "7,2 min", resolution: "96,9 %", trend: "+15 %", tone: "danger" },
    { commune: "Kintambo", alerts: 41, serious: 9, response: "8,1 min", resolution: "92,7 %", trend: "+15 %", tone: "danger" },
    { commune: "Masina", alerts: 52, serious: 8, response: "10,4 min", resolution: "90,4 %", trend: "+4 %", tone: "warning" },
    { commune: "Limete", alerts: 38, serious: 6, response: "8,9 min", resolution: "94,7 %", trend: "Stable", tone: "neutral" },
    { commune: "Bandalungwa", alerts: 29, serious: 5, response: "9,3 min", resolution: "93,1 %", trend: "−10 %", tone: "success" },
  ],
} as const;

import type { Permission, Role, User } from "@/types/domain";

export const USERS: User[] = [
  {
    id: "u-macgenius",
    name: "Macgenius",
    email: "macgenius@zonealerte.cd",
    role: "admin",
    title: "Administrateur principal",
    unit: "Plateforme",
    status: "actif",
    lastLoginAt: "Aujourd’hui, 18:02",
  },
  {
    id: "u-ali",
    name: "Sgt Rich-man Ali",
    email: "r.ali@pnc.cd",
    role: "securite",
    title: "Service de sécurité",
    unit: "PNC Gombe",
    status: "actif",
    lastLoginAt: "Aujourd’hui, 18:41",
  },
  {
    id: "u-andedi",
    name: "Johnny Andedi",
    email: "j.andedi@zonealerte.cd",
    role: "operateur",
    title: "Opérateur",
    unit: "Centre d’appel",
    status: "actif",
    lastLoginAt: "Aujourd’hui, 18:45",
  },
  {
    id: "u-lukusa",
    name: "Grace Lukusa",
    email: "g.lukusa@zonealerte.cd",
    role: "analyste",
    title: "Analyste",
    unit: "Cellule analyse",
    status: "actif",
    lastLoginAt: "Hier, 16:10",
  },
  {
    id: "u-ilunga",
    name: "Patrick Ilunga",
    email: "p.ilunga@zonealerte.cd",
    role: "operateur",
    title: "Opérateur",
    unit: "Centre d’appel",
    status: "suspendu",
    lastLoginAt: "21 oct. 2026",
  },
  {
    id: "u-mbala",
    name: "chantal.mbala@pnc.cd",
    email: "chantal.mbala@pnc.cd",
    role: "securite",
    title: "Service de sécurité",
    unit: "PNC",
    status: "invitation",
    lastLoginAt: null,
    invitedBy: "Invitée par Macgenius le 7 nov.",
  },
];

export const USER_COUNTS = { total: 38, active: 34, invitations: 2, suspended: 2 } as const;

/** Matrix of screen 6.2 "Rôles et permissions". */
export const PERMISSIONS: Record<Role, Permission[]> = {
  operateur: ["alert.qualify", "alert.assign"],
  securite: ["alert.qualify", "alert.assign", "alert.close", "notice.publish"],
  analyste: ["report.validate"],
  admin: ["alert.qualify", "alert.assign", "alert.close", "notice.publish", "report.validate", "users.manage"],
};

export const SESSIONS = [
  { id: "s1", device: "Chrome · Windows (cette session)", place: "Kinshasa", activity: "Maintenant", current: true },
  { id: "s2", device: "Safari · iPhone", place: "Kinshasa", activity: "Il y a 2 h", current: false },
  { id: "s3", device: "Edge · Windows", place: "Lubumbashi", activity: "Hier, 22:14", current: false, unusual: true },
];

export const AUDIT_LOG = [
  { at: "8 nov., 18:47", user: "Johnny Andedi", action: "A assigné l’équipe Alpha-3", target: "ALT-2481" },
  { at: "8 nov., 18:41", user: "Johnny Andedi", action: "A fusionné un doublon (motif : même événement)", target: "ALT-2471 → ALT-2481" },
  { at: "7 nov., 16:20", user: "Sgt Rich-man Ali", action: "A marqué une personne comme retrouvée", target: "AVR-0315" },
  { at: "7 nov., 16:02", user: "Macgenius", action: "A changé le rôle Opérateur → Analyste", target: "Grace Lukusa" },
];

import type { Tone } from "@/components/ui/badge";
import type { Permission, Role, User } from "@/types/domain";

export const ROLE_LABEL: Record<Role, string> = { operateur: "Opérateur", securite: "Service de sécurité", analyste: "Analyste", admin: "Administrateur" };
export const ROLE_SHORT: Record<Role, string> = { operateur: "Opér.", securite: "Sécu.", analyste: "Analy.", admin: "Admin" };
export const ROLE_TONE: Record<Role, Tone> = { admin: "brand", securite: "info", operateur: "neutral", analyste: "neutral" };
export const ROLES: Role[] = ["operateur", "securite", "analyste", "admin"];

export const USER_STATUS: Record<User["status"], { label: string; tone: Tone }> = {
  actif: { label: "Actif", tone: "success" },
  suspendu: { label: "Suspendu", tone: "danger" },
  invitation: { label: "Invitation", tone: "warning" },
};

export const PERMISSION_LABEL: Record<Permission, string> = {
  "alert.qualify": "Qualifier une alerte",
  "alert.assign": "Assigner une équipe",
  "alert.close": "Clôturer une intervention",
  "notice.publish": "Publier un avis de recherche",
  "report.validate": "Valider un rapport IA",
  "users.manage": "Gérer les utilisateurs",
};

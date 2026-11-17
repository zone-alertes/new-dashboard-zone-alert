import { mockRequest } from "@/lib/api/http";
import { audit, db } from "@/lib/mock/db";

export interface SecuritySettings {
  enforce2fa: boolean;
  sessionTimeout: "15" | "30" | "60" | "120";
  networkRestriction: boolean;
}

let security: SecuritySettings = { enforce2fa: true, sessionTimeout: "30", networkRestriction: false };

export const settingsApi = {
  security: () => mockRequest(() => security),
  saveSecurity: (s: SecuritySettings, actor: string) =>
    mockRequest(() => {
      security = s;
      audit(actor, "A modifié les paramètres de sécurité", "Sécurité");
      return security;
    }),
  sessions: () => mockRequest(() => db.sessions),
  revokeSession: (id: string | "others", actor: string) =>
    mockRequest(() => {
      db.sessions = db.sessions.filter((s) => s.current || (id !== "others" && s.id !== id));
      audit(actor, id === "others" ? "A déconnecté toutes les autres sessions" : "A déconnecté une session", id);
      return db.sessions;
    }),
  audit: () => mockRequest(() => db.audit),
};

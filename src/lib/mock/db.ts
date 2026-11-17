import { ALERTS, CLOSED_LAST_30_DAYS, TEAMS } from "./data/alerts";
import { NOTICES, NOTICE_COUNTS } from "./data/notices";
import { NOTIFICATIONS, NOTIFICATION_PREFERENCES } from "./data/notifications";
import { PUBLICATIONS, PUBLICATION_COUNTS } from "./data/publications";
import { AUDIT_LOG, SESSIONS, USERS } from "./data/users";
import { RECOMMENDATIONS } from "./data/analytics";

/**
 * In-memory mock database (browser only, reset on reload).
 * It plays the role of the future REST API: features never import it directly,
 * they go through their `api.ts` module, so swapping to real HTTP calls is local.
 */
function seed() {
  return {
    alerts: structuredClone(ALERTS),
    closedLast30Days: CLOSED_LAST_30_DAYS,
    teams: structuredClone(TEAMS),
    notices: structuredClone(NOTICES),
    noticeCounts: { ...NOTICE_COUNTS },
    notifications: structuredClone(NOTIFICATIONS),
    notificationPreferences: structuredClone(NOTIFICATION_PREFERENCES),
    publications: structuredClone(PUBLICATIONS),
    publicationCounts: { ...PUBLICATION_COUNTS },
    users: structuredClone(USERS),
    sessions: structuredClone(SESSIONS),
    audit: structuredClone(AUDIT_LOG),
    recommendations: structuredClone(RECOMMENDATIONS),
  };
}

export type MockDb = ReturnType<typeof seed>;

export const db: MockDb = seed();

export function resetDb() {
  Object.assign(db, seed());
}

export function audit(user: string, action: string, target: string) {
  db.audit.unshift({ at: "8 nov., 18:48", user, action, target });
}

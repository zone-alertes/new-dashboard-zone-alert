import { mockRequest } from "@/lib/api/http";
import { db } from "@/lib/mock/db";

export type PreferenceChannel = "app" | "sms" | "email";

export const notificationsApi = {
  list: () => mockRequest(() => db.notifications),
  markRead: (ids: string[] | "all") =>
    mockRequest(() => {
      db.notifications.forEach((n) => {
        if (ids === "all" || ids.includes(n.id)) n.read = true;
      });
      return true;
    }),
  preferences: () => mockRequest(() => db.notificationPreferences),
  setPreference: (event: string, channel: PreferenceChannel, value: boolean) =>
    mockRequest(() => {
      const row = db.notificationPreferences.find((p) => p.event === event);
      if (row) row[channel] = value;
      return db.notificationPreferences;
    }),
};

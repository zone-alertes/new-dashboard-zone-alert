import type { Tone } from "@/components/ui/badge";
import type { Notice, NoticeStatus } from "@/types/domain";

export const NOTICE_STATUS_TONE: Record<NoticeStatus, Tone> = { disparue: "warning", mineur: "danger", retrouvee: "success", recherchee: "danger" };

export function noticeStatusLabel(n: Pick<Notice, "status" | "sex">) {
  const f = n.sex === "Féminin";
  switch (n.status) {
    case "mineur":
      return f ? "Mineure" : "Mineur";
    case "retrouvee":
      return f ? "Retrouvée" : "Retrouvé";
    case "recherchee":
      return "Recherché·e";
    default:
      return f ? "Disparue" : "Disparu";
  }
}

export const NOTICE_TABS = ["disparue", "recherchee", "cloturee"] as const;
export type NoticeTab = (typeof NOTICE_TABS)[number];

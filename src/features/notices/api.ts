import { ApiError, mockRequest } from "@/lib/api/http";
import { audit, db } from "@/lib/mock/db";
import { NOTICE_DETAIL } from "@/lib/mock/data/notices";
import type { Notice } from "@/types/domain";
import type { NoticeTab } from "./constants";
import type { NoticePersonInput } from "./schemas";

export const noticesApi = {
  list: (tab: NoticeTab, q = "") =>
    mockRequest(() => {
      const query = q.trim().toLowerCase();
      const items = db.notices
        .filter((n) => (tab === "cloturee" ? n.status === "retrouvee" : tab === "recherchee" ? n.kind === "recherchee" : n.kind === "disparue"))
        .filter((n) => !query || [n.name, n.ref, n.lastPlace].some((s) => s.toLowerCase().includes(query)));
      return { items, counts: db.noticeCounts };
    }),

  get: (ref: string) =>
    mockRequest(() => {
      const notice = db.notices.find((n) => n.ref === ref);
      if (!notice) throw new ApiError(`Avis ${ref} introuvable`, 404);
      // Rich record only exists for AVR-0318 in the demo dataset.
      return { notice, detail: ref === NOTICE_DETAIL.ref ? NOTICE_DETAIL : null };
    }),

  markFound: (ref: string, actor: string) =>
    mockRequest(() => {
      const n = db.notices.find((x) => x.ref === ref);
      if (!n) throw new ApiError("Avis introuvable", 404);
      n.status = "retrouvee";
      n.foundAt = "2026-11-08";
      db.noticeCounts = { ...db.noticeCounts, disparue: db.noticeCounts.disparue - 1, cloturee: db.noticeCounts.cloturee + 1 };
      audit(actor, "A marqué une personne comme retrouvée", ref);
      return n;
    }),

  create: (input: NoticePersonInput, actor: string) =>
    mockRequest<Notice>(() => {
      const ref = `AVR-0${324 + db.notices.length - 8}`;
      const notice: Notice = {
        ref,
        kind: "disparue",
        name: input.fullName,
        age: input.age,
        sex: input.sex,
        missingSince: "2026-11-06",
        lastPlace: input.lastPlace,
        status: input.age < 18 ? "mineur" : "disparue",
      };
      db.notices.unshift(notice);
      db.noticeCounts = { ...db.noticeCounts, disparue: db.noticeCounts.disparue + 1 };
      audit(actor, "A publié un avis de recherche", ref);
      return notice;
    }, 600),
};

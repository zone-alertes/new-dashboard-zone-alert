import { ApiError, mockRequest } from "@/lib/api/http";
import { audit, db } from "@/lib/mock/db";
import type { Publication } from "@/types/domain";
import type { PubTab } from "./constants";
import type { PublicationInput } from "./schemas";

export const publicationsApi = {
  list: (tab: PubTab, q: string) =>
    mockRequest(() => {
      const query = q.trim().toLowerCase();
      const items = db.publications
        .filter((p) =>
          tab === "toutes" ? p.status !== "archivee" : tab === "brouillon" ? p.status === "brouillon" || p.status === "relecture" : p.status === tab,
        )
        .filter((p) => !query || [p.title, p.byline, p.excerpt].some((s) => s.toLowerCase().includes(query)));
      return { items, counts: db.publicationCounts };
    }),

  archive: (id: string, actor: string) =>
    mockRequest(() => {
      const p = db.publications.find((x) => x.id === id);
      if (!p) throw new ApiError("Publication introuvable", 404);
      const previous = p.status;
      p.status = "archivee";
      db.publicationCounts = {
        ...db.publicationCounts,
        archivee: db.publicationCounts.archivee + 1,
        ...(previous === "publiee" ? { publiee: db.publicationCounts.publiee - 1 } : {}),
      };
      audit(actor, "A archivé une publication", p.title);
      return { publication: p, previous };
    }),

  remove: (id: string, actor: string) =>
    mockRequest(() => {
      const p = db.publications.find((x) => x.id === id);
      if (!p) throw new ApiError("Publication introuvable", 404);
      db.publications = db.publications.filter((x) => x.id !== id);
      db.publicationCounts = {
        ...db.publicationCounts,
        total: db.publicationCounts.total - 1,
        ...(p.status === "publiee" ? { publiee: db.publicationCounts.publiee - 1 } : {}),
      };
      audit(actor, "A supprimé définitivement une publication", p.title);
      return true;
    }),

  restore: (id: string, status: Publication["status"]) =>
    mockRequest(() => {
      const p = db.publications.find((x) => x.id === id);
      if (!p) throw new ApiError("Publication introuvable", 404);
      p.status = status;
      db.publicationCounts = {
        ...db.publicationCounts,
        archivee: db.publicationCounts.archivee - 1,
        ...(status === "publiee" ? { publiee: db.publicationCounts.publiee + 1 } : {}),
      };
      return p;
    }),

  create: (input: PublicationInput, mode: "draft" | "review", actor: string) =>
    mockRequest<Publication>(() => {
      const p: Publication = {
        id: `pub-${129 + db.publications.length - 6}`,
        category: input.category,
        status: mode === "draft" ? "brouillon" : "relecture",
        title: input.title,
        excerpt: input.message,
        audience: `${input.zones.join(", ")} · ${[input.channels.push && "push", input.channels.sms && "SMS", input.channels.app && !input.channels.push && "application"].filter(Boolean).join(" + ")}`,
        byline: `${actor} · à l'instant`,
        views: "Non publiée",
      };
      db.publications.unshift(p);
      db.publicationCounts = { ...db.publicationCounts, total: db.publicationCounts.total + 1, brouillon: db.publicationCounts.brouillon + 1 };
      audit(actor, mode === "draft" ? "A enregistré un brouillon" : "A envoyé une publication en relecture", p.title);
      return p;
    }, 500),
};

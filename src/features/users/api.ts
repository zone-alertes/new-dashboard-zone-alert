import { ApiError, mockRequest } from "@/lib/api/http";
import { audit, db } from "@/lib/mock/db";
import { PERMISSIONS, USER_COUNTS } from "@/lib/mock/data/users";
import type { Role, User } from "@/types/domain";
import { ROLE_LABEL } from "./constants";
import type { InviteInput } from "./schemas";

function find(id: string) {
  const u = db.users.find((x) => x.id === id);
  if (!u) throw new ApiError("Utilisateur introuvable", 404);
  return u;
}

export const usersApi = {
  list: (role?: Role) =>
    mockRequest(() => {
      const items = db.users.filter((u) => !role || u.role === role);
      const extra = {
        active: db.users.filter((u) => u.status === "actif").length - 4,
        invitations: db.users.filter((u) => u.status === "invitation").length - 1,
        suspended: db.users.filter((u) => u.status === "suspendu").length - 1,
      };
      // The demo shows 6 of the 38 accounts: counters = reference totals + local changes.
      return {
        items,
        counts: {
          total: USER_COUNTS.total + extra.active + extra.invitations + extra.suspended,
          active: USER_COUNTS.active + extra.active,
          invitations: USER_COUNTS.invitations + extra.invitations,
          suspended: USER_COUNTS.suspended + extra.suspended,
        },
      };
    }),
  permissions: () => mockRequest(() => PERMISSIONS),
  setRole: (id: string, role: Role, actor: string) =>
    mockRequest(() => {
      const u = find(id);
      audit(actor, `A changé le rôle ${ROLE_LABEL[u.role]} → ${ROLE_LABEL[role]}`, u.name);
      u.role = role;
      u.title = ROLE_LABEL[role];
      return u;
    }),
  setStatus: (id: string, status: User["status"], actor: string) =>
    mockRequest(() => {
      const u = find(id);
      if (u.role === "admin" && status === "suspendu") throw new ApiError("Impossible de suspendre l'administrateur principal.", 403);
      u.status = status;
      audit(actor, status === "suspendu" ? "A suspendu le compte" : "A réactivé le compte", u.name);
      return u;
    }),
  reset2fa: (id: string, actor: string) =>
    mockRequest(() => {
      const u = find(id);
      audit(actor, "A réinitialisé la double authentification", u.name);
      return u;
    }),
  invite: (input: InviteInput, actor: string) =>
    mockRequest(() => {
      if (db.users.some((u) => u.email === input.email)) throw new ApiError("Un compte existe déjà avec cette adresse.", 409);
      const u: User = {
        id: `u-${Date.now()}`,
        name: input.email,
        email: input.email,
        role: input.role,
        title: ROLE_LABEL[input.role],
        unit: "—",
        status: "invitation",
        lastLoginAt: null,
        invitedBy: `Invité·e par ${actor} le 8 nov.`,
      };
      db.users.push(u);
      audit(actor, "A invité un utilisateur", input.email);
      return u;
    }),
};

import { z } from "zod";

export const inviteSchema = z.object({
  email: z.email("Adresse email invalide").trim().toLowerCase(),
  role: z.enum(["operateur", "securite", "analyste", "admin"]),
});
export type InviteInput = z.infer<typeof inviteSchema>;

import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Adresse email invalide").trim().toLowerCase(),
  password: z.string().min(8, "8 caractères minimum"),
  remember: z.boolean(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Le code contient 6 chiffres"),
});
export type OtpInput = z.infer<typeof otpSchema>;

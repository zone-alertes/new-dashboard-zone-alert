import { ApiError, mockRequest } from "@/lib/api/http";
import { db } from "@/lib/mock/db";
import type { LoginInput } from "./schemas";

/** Demo credentials (README): any active account e-mail + a password of 8+ characters; OTP = any 6 digits except 000000. */
export const authApi = {
  login: (input: LoginInput) =>
    mockRequest(() => {
      const user = db.users.find((u) => u.email === input.email);
      if (!user || user.status === "invitation") throw new ApiError("Email ou mot de passe incorrect.", 401);
      if (user.status === "suspendu") throw new ApiError("Ce compte est suspendu. Contactez un administrateur.", 403);
      return user;
    }, 500),
  verifyOtp: (code: string) =>
    mockRequest(() => {
      if (code === "000000") throw new ApiError("Code incorrect. Il vous reste 2 essais.", 401);
      return true;
    }, 400),
  resendOtp: () => mockRequest(() => true),
};

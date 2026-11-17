"use client";

import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import type { Permission, User } from "@/types/domain";
import { PERMISSIONS } from "@/lib/mock/data/users";

export const SESSION_COOKIE = "za_session";

type SessionStatus = "anonymous" | "pending_2fa" | "authenticated";

interface SessionState {
  status: SessionStatus;
  user: User | null;
  /** Masked phone number the 2FA code was sent to. */
  otpTarget: string | null;
  rememberDevice: boolean;
}

interface SessionActions {
  startTwoFactor: (user: User, rememberDevice: boolean) => void;
  completeTwoFactor: () => void;
  logout: () => void;
}

const initialState: SessionState = { status: "anonymous", user: null, otpTarget: null, rememberDevice: true };

function writeCookie(value: string | null) {
  if (typeof document === "undefined") return;
  document.cookie = value ? `${SESSION_COOKIE}=${value}; path=/; max-age=${60 * 60 * 12}; samesite=lax` : `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

/**
 * Global client state: who is signed in and at which authentication step.
 * Persisted in localStorage; the cookie only lets `src/proxy.ts` redirect
 * anonymous visitors before rendering (optimistic check — the real API stays the authority).
 */
export const useSessionStore = create<SessionState & SessionActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        startTwoFactor: (user, rememberDevice) =>
          set({ status: "pending_2fa", user, otpTarget: "+243 81 ••• •• 47", rememberDevice }, false, "session/startTwoFactor"),
        completeTwoFactor: () => {
          writeCookie("authenticated");
          set({ status: "authenticated", otpTarget: null }, false, "session/completeTwoFactor");
        },
        logout: () => {
          writeCookie(null);
          set(initialState, false, "session/logout");
        },
      }),
      { name: "za-session", storage: createJSONStorage(() => localStorage) },
    ),
    { name: "SessionStore", enabled: process.env.NODE_ENV === "development" },
  ),
);

/* ---------- Selectors (keep components subscribed to the smallest slice) ---------- */
export const selectUser = (s: SessionState) => s.user;
export const selectStatus = (s: SessionState) => s.status;

export function useCan(permission: Permission) {
  return useSessionStore((s) => (s.user ? PERMISSIONS[s.user.role].includes(permission) : false));
}

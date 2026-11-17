import { beforeEach, describe, expect, it } from "vitest";
import { USERS } from "@/lib/mock/data/users";
import { SESSION_COOKIE, useSessionStore } from "./session-store";

describe("session store", () => {
  beforeEach(() => useSessionStore.getState().logout());

  it("goes through login → 2FA → authenticated and sets the guard cookie", () => {
    const admin = USERS[0]!;
    useSessionStore.getState().startTwoFactor(admin, true);
    expect(useSessionStore.getState().status).toBe("pending_2fa");
    expect(useSessionStore.getState().otpTarget).toContain("+243");

    useSessionStore.getState().completeTwoFactor();
    expect(useSessionStore.getState().status).toBe("authenticated");
    expect(document.cookie).toContain(`${SESSION_COOKIE}=authenticated`);
  });

  it("clears everything on logout", () => {
    useSessionStore.getState().startTwoFactor(USERS[0]!, true);
    useSessionStore.getState().completeTwoFactor();
    useSessionStore.getState().logout();
    expect(useSessionStore.getState().user).toBeNull();
    expect(document.cookie).not.toContain(`${SESSION_COOKIE}=authenticated`);
  });
});

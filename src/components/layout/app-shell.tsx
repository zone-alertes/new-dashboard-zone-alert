"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useSessionStore } from "@/stores/session-store";
import { CommandPalette } from "@/components/feedback/command-palette";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

/** True once the persisted Zustand session has been read from localStorage. */
function useSessionHydrated() {
  return useSyncExternalStore(
    (cb) => useSessionStore.persist.onFinishHydration(cb),
    () => useSessionStore.persist.hasHydrated(),
    () => false,
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const hydrated = useSessionHydrated();
  const status = useSessionStore((s) => s.status);
  const router = useRouter();

  // Client-side guard (the proxy already filters on the cookie before render).
  useEffect(() => {
    if (hydrated && status !== "authenticated") router.replace(status === "pending_2fa" ? "/verification" : "/connexion");
  }, [hydrated, status, router]);

  if (!hydrated || status !== "authenticated") {
    return <div className="flex min-h-dvh items-center justify-center type-small text-ink-3">Chargement de la console…</div>;
  }

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="contenu" className="flex-1">
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, LogOut, Search, Settings } from "lucide-react";
import { breadcrumbFor } from "@/config/navigation";
import { useSessionStore } from "@/stores/session-store";
import { useUiStore } from "@/stores/ui-store";
import { useUnreadCount } from "@/features/notifications/queries";
import { Avatar } from "@/components/ui";
import { queryClientReset } from "@/lib/query/reset";

/** 64px top bar (Figma component "Barre supérieure"). */
export function Topbar() {
  const pathname = usePathname();
  const crumbs = breadcrumbFor(pathname);
  const user = useSessionStore((s) => s.user);
  const logout = useSessionStore((s) => s.logout);
  const openPalette = useUiStore((s) => s.setCommandPalette);
  const unread = useUnreadCount();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Ctrl/Cmd + K opens the global search palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openPalette(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPalette]);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-card px-8">
      <nav aria-label="Fil d'Ariane" className="type-small text-ink-3">
        {crumbs.join(" / ")}
      </nav>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => openPalette(true)}
          className="flex h-9 w-[280px] items-center gap-2 rounded-lg bg-muted px-3 text-left type-small text-ink-3 hover:bg-line"
        >
          <Search className="size-4" aria-hidden />
          Recherche globale (Ctrl + K)
        </button>
        <span className="flex items-center gap-1.5 type-caption text-ink-2">
          <span className="size-2 rounded-full bg-success" aria-hidden />
          Kinshasa · UTC+1 · En direct
        </span>
        <Link
          href="/notifications"
          aria-label={`Notifications${unread ? `, ${unread} non lues` : ""}`}
          className="relative rounded-lg border border-line p-[9px] text-ink-2 hover:bg-page"
        >
          <Bell className="size-[18px]" aria-hidden />
          {unread > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand ring-2 ring-card" />}
        </Link>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            aria-haspopup="menu"
            className="flex items-center gap-2.5 rounded-lg text-left"
          >
            <Avatar name={user?.name ?? "?"} src={user?.avatar} size={36} />
            <span className="flex flex-col">
              <span className="type-body-strong text-ink">{user?.name}</span>
              <span className="type-caption text-ink-3">{user?.title}</span>
            </span>
          </button>
          {menu && (
            <div role="menu" className="absolute top-12 right-0 w-56 rounded-xl border border-line bg-card p-1.5 shadow-popover">
              <Link
                role="menuitem"
                href="/parametres/securite"
                onClick={() => setMenu(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 type-body text-ink-2 hover:bg-page"
              >
                <Settings className="size-4" /> Sécurité du compte
              </Link>
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  logout();
                  queryClientReset();
                  router.replace("/connexion");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 type-body text-danger hover:bg-danger-soft"
              >
                <LogOut className="size-4" /> Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

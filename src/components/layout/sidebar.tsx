"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVIGATION, type NavBadge } from "@/config/navigation";
import { useUnreadCount } from "@/features/notifications/queries";
import { useAlertCounts } from "@/features/alerts/queries";
import { useSessionStore } from "@/stores/session-store";
import { PERMISSIONS } from "@/lib/mock/data/users";
import { cn } from "@/lib/utils/cn";

function useBadge(kind?: NavBadge) {
  const unread = useUnreadCount();
  const counts = useAlertCounts();
  if (kind === "notifications") return unread || undefined;
  if (kind === "alerts") return counts?.en_qualification || undefined;
  return undefined;
}

function NavLink({ href, label, icon: Icon, badge }: (typeof NAVIGATION)[number]["items"][number]) {
  const pathname = usePathname();
  const base = href.replace(/\/nouveau$/, "");
  const active = pathname === base || pathname.startsWith(base + "/") || pathname === href;
  const count = useBadge(badge);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn("flex h-10 items-center gap-3 rounded-lg px-3 transition-colors", active ? "bg-brand-soft text-brand-strong" : "text-ink-2 hover:bg-page")}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={2} aria-hidden />
      <span className={cn("flex-1 truncate", active ? "type-body-strong" : "type-body")}>{label}</span>
      {count !== undefined && (
        <span
          className={cn("rounded-full px-2 py-px type-label", badge === "alerts" ? "bg-danger-soft text-danger" : "bg-muted text-ink-2")}
          aria-label={`${count} en attente`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

/** Fixed 248px navigation (Figma component "Sidebar", variants by active item). */
export function Sidebar() {
  const role = useSessionStore((s) => s.user?.role);
  return (
    // The outer column stretches with the page (border + background); the inner panel stays in view.
    <aside className="w-[248px] shrink-0 border-r border-line bg-card">
      <div className="sticky top-0 flex h-dvh flex-col gap-5 overflow-y-auto px-4 py-5">
        <Link href="/tableau-de-bord" className="flex items-center gap-2.5 px-2">
          <Image src="/images/logo-zone-alerte.png" alt="" width={36} height={36} className="rounded-lg" priority />
          <span className="flex flex-col">
            <span className="type-h3 text-ink">Zone Alerte</span>
            <span className="type-caption text-ink-3">Sécurité urbaine · Kinshasa</span>
          </span>
        </Link>
        <nav aria-label="Navigation principale" className="flex flex-col gap-5">
          {NAVIGATION.map((group) => {
            const items = group.items.filter((i) => !i.permission || (role && PERMISSIONS[role].includes(i.permission)));
            if (!items.length) return null;
            return (
              <div key={group.label} className="flex flex-col gap-0.5">
                <p className="px-3 py-1 type-label text-ink-3 uppercase">{group.label}</p>
                {items.map((item) => (
                  <NavLink key={item.href} {...item} />
                ))}
              </div>
            );
          })}
        </nav>
        <div className="flex-1" />
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2.5">
          <span className="size-2 rounded-full bg-success" aria-hidden />
          <span className="type-caption text-ink-2">Services opérationnels · v2.0</span>
        </div>
      </div>
    </aside>
  );
}

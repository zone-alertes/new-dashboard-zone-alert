"use client";

import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import { NAVIGATION } from "@/config/navigation";
import { useActiveAlerts } from "@/features/alerts/queries";
import { useNotices } from "@/features/notices/queries";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils/cn";

interface Entry {
  group: string;
  label: string;
  hint?: string;
  href: string;
}

/** Ctrl + K global search across pages, active alerts and notices. */
export function CommandPalette() {
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPalette);
  if (!open || typeof document === "undefined") return null;
  return createPortal(<Palette onClose={() => setOpen(false)} />, document.body);
}

function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const q = useDeferredValue(query.trim().toLowerCase());
  const { data: alerts = [] } = useActiveAlerts();
  const { data: notices } = useNotices("disparue");

  const entries = useMemo<Entry[]>(() => {
    const all: Entry[] = [
      ...NAVIGATION.flatMap((g) => g.items.map((i) => ({ group: "Pages", label: i.label, hint: g.label, href: i.href }))),
      ...alerts.map((a) => ({ group: "Alertes", label: `${a.ref} · ${a.type}`, hint: a.place, href: `/alertes/${a.ref}` })),
      ...(notices?.items ?? []).map((n) => ({
        group: "Avis de recherche",
        label: `${n.ref} · ${n.name}`,
        hint: n.lastPlace,
        href: `/avis-de-recherche/${n.ref}`,
      })),
    ];
    return (q ? all.filter((e) => `${e.label} ${e.hint}`.toLowerCase().includes(q)) : all.slice(0, 11)).slice(0, 12);
  }, [alerts, notices, q]);

  const go = (e?: Entry) => {
    if (!e) return;
    onClose();
    router.push(e.href);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[rgb(16_24_40/0.45)]" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Recherche globale"
        className="fixed top-24 left-1/2 z-50 w-[600px] -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-card shadow-overlay"
      >
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Search className="size-4 text-ink-3" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") setCursor((c) => Math.min(c + 1, entries.length - 1));
              if (e.key === "ArrowUp") setCursor((c) => Math.max(c - 1, 0));
              if (e.key === "Enter") go(entries[cursor]);
            }}
            placeholder="Rechercher une page, une alerte (ALT-…), un avis (AVR-…)"
            className="h-12 flex-1 bg-transparent type-body outline-none placeholder:text-ink-3"
            aria-controls="palette-results"
          />
          <kbd className="rounded border border-line px-1.5 type-caption text-ink-3">Échap</kbd>
        </div>
        <ul id="palette-results" role="listbox" className="max-h-[420px] overflow-y-auto p-2">
          {entries.length === 0 && <li className="px-3 py-6 text-center type-small text-ink-3">Aucun résultat pour « {query} »</li>}
          {entries.map((e, i) => (
            <li key={e.href + e.label} role="option" aria-selected={i === cursor}>
              <button
                type="button"
                onMouseEnter={() => setCursor(i)}
                onClick={() => go(e)}
                className={cn("flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left", i === cursor && "bg-brand-soft")}
              >
                <span className="type-body text-ink">{e.label}</span>
                <span className="type-caption text-ink-3">
                  {e.group} · {e.hint}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

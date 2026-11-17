"use client";

import { Check, Info, TriangleAlert, X } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils/cn";

/** Dark toasts, bottom-center, with optional "Annuler" action (US-09: undo within 6 s). */
export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-[calc(50%+124px)] z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => {
        const Icon = t.tone === "danger" ? TriangleAlert : t.tone === "info" ? Info : Check;
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex min-w-[360px] items-center gap-3 rounded-lg bg-ink px-4 py-3 text-on-brand shadow-overlay"
          >
            <Icon
              className={cn("size-[18px] shrink-0", t.tone === "danger" ? "text-[#fda29b]" : t.tone === "info" ? "text-[#84caff]" : "text-[#6ce9a6]")}
              aria-hidden
            />
            <span className="flex-1 type-body">{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action!.onClick();
                  dismiss(t.id);
                }}
                className="type-body-strong text-[#fda29b] hover:underline"
              >
                {t.action.label}
              </button>
            )}
            <button type="button" aria-label="Fermer" onClick={() => dismiss(t.id)} className="text-line-strong hover:text-on-brand">
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

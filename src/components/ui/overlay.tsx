"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function useOverlayBehaviour(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Latest onClose without re-running the effect (callers often pass inline arrows).
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Move focus inside the dialog for keyboard and screen-reader users.
    const focusable = panelRef.current?.querySelector<HTMLElement>("[data-autofocus], button, input, textarea, select, a[href]");
    focusable?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [open]);
  return panelRef;
}

const scrim = "fixed inset-0 z-40 bg-[rgb(16_24_40/0.45)]";

/** Centered modal (Rejeter avec motif, Archiver une publication). */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 560,
  icon,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
  icon?: ReactNode;
}) {
  const panelRef = useOverlayBehaviour(open, onClose);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <>
      <div className={scrim} onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-[140px] pb-10 pl-[248px]"
        onClick={onClose}
      >
        <div
          ref={panelRef}
          className="flex flex-col gap-5 rounded-xl border border-line bg-card p-7 shadow-overlay"
          style={{ width }}
          onClick={(e) => e.stopPropagation()}
        >
          {icon}
          <div className="flex flex-col gap-2">
            <h2 id="modal-title" className="type-h1 text-ink">
              {title}
            </h2>
            {description && <div className="type-small text-ink-2">{description}</div>}
          </div>
          {children}
          {footer && <div className="flex justify-end gap-3">{footer}</div>}
        </div>
      </div>
    </>,
    document.body,
  );
}

/** Right-hand panel (Assigner une équipe). */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 480,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  const panelRef = useOverlayBehaviour(open, onClose);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <>
      <div className={scrim} onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="fixed inset-y-0 right-0 z-50 flex flex-col gap-5 overflow-y-auto bg-card p-7 shadow-[-8px_0_40px_rgb(0_0_0/0.18)]"
        style={{ width }}
      >
        <div className="flex items-center justify-between">
          <h2 id="drawer-title" className="type-h1 text-ink">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-md p-1 text-ink-2 hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>
        {description && <div className="type-small text-ink-2">{description}</div>}
        <div className="flex flex-col gap-5">{children}</div>
        <div className="flex-1" />
        {footer && <div className={cn("flex justify-end gap-3")}>{footer}</div>}
      </div>
    </>,
    document.body,
  );
}

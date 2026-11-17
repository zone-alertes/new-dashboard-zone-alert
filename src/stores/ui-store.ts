"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type ToastTone = "success" | "info" | "danger";

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
}

interface UiState {
  commandPaletteOpen: boolean;
  toasts: Toast[];
  setCommandPalette: (open: boolean) => void;
  toast: (message: string, opts?: { tone?: ToastTone; action?: Toast["action"]; duration?: number }) => void;
  dismissToast: (id: number) => void;
}

let nextId = 1;

/** Global UI state shared across routes: command palette and toasts. */
export const useUiStore = create<UiState>()(
  devtools(
    (set, get) => ({
      commandPaletteOpen: false,
      toasts: [],
      setCommandPalette: (open) => set({ commandPaletteOpen: open }, false, "ui/commandPalette"),
      toast: (message, opts = {}) => {
        const id = nextId++;
        set((s) => ({ toasts: [...s.toasts, { id, message, tone: opts.tone ?? "success", action: opts.action }] }), false, "ui/toast");
        setTimeout(() => get().dismissToast(id), opts.duration ?? 6000);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }), false, "ui/dismissToast"),
    }),
    { name: "UiStore", enabled: process.env.NODE_ENV === "development" },
  ),
);

/** Imperative helper usable from mutation callbacks. */
export const toast = (...args: Parameters<UiState["toast"]>) => useUiStore.getState().toast(...args);

"use client";

import { create } from "zustand";

interface AlertSelectionState {
  selected: string[];
  toggle: (ref: string) => void;
  setMany: (refs: string[], selected: boolean) => void;
  clear: () => void;
}

/** Bulk-action selection on the alerts list (US-12). Kept global so it survives tab/filter changes. */
export const useAlertSelection = create<AlertSelectionState>()((set) => ({
  selected: ["ALT-2478", "ALT-2474"],
  toggle: (ref) => set((s) => ({ selected: s.selected.includes(ref) ? s.selected.filter((r) => r !== ref) : [...s.selected, ref] })),
  setMany: (refs, selected) =>
    set((s) => ({
      selected: selected ? Array.from(new Set([...s.selected, ...refs])) : s.selected.filter((r) => !refs.includes(r)),
    })),
  clear: () => set({ selected: [] }),
}));

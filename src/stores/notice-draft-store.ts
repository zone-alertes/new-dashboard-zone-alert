"use client";

import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import type { NoticeKind } from "@/types/domain";
import type { NoticePersonInput } from "@/features/notices/schemas";

export type NoticeStep = 1 | 2 | 3;

interface NoticeDraftState {
  step: NoticeStep;
  kind: NoticeKind;
  person: Partial<NoticePersonInput>;
  channels: { app: boolean; sms: boolean; radio: boolean };
  zones: string[];
  savedAt: string | null;
  setKind: (kind: NoticeKind) => void;
  savePerson: (person: Partial<NoticePersonInput>) => void;
  setChannels: (c: Partial<NoticeDraftState["channels"]>) => void;
  toggleZone: (zone: string) => void;
  goTo: (step: NoticeStep) => void;
  reset: () => void;
}

const initial = {
  step: 1 as NoticeStep,
  kind: "disparue" as NoticeKind,
  person: {
    fullName: "Grace Mbuyi",
    age: 14,
    sex: "Féminin",
    height: "1,52 m",
    signs: "Tresses courtes, grain de beauté sur la joue droite",
    outfit: "Uniforme scolaire bleu et blanc",
    missingAt: "2026-11-06T16:40",
    lastPlace: "Kalamu · arrêt Victoire",
    familyContact: "+243 81 234 56 78 (mère)",
    languages: "Lingala, français",
    guardianConsent: false,
    hasPhoto: false,
  } as Partial<NoticePersonInput>,
  channels: { app: true, sms: true, radio: false },
  zones: ["Kalamu", "Kasa-Vubu", "Lingwala"],
  savedAt: null as string | null,
};

/**
 * Multi-step form draft for "Publier un avis" (screen 3.3).
 * Persisted in sessionStorage so a reload or a detour does not lose the agent's input,
 * and cleared on publish.
 */
export const useNoticeDraft = create<NoticeDraftState>()(
  devtools(
    persist(
      (set) => ({
        ...initial,
        setKind: (kind) => set({ kind }, false, "noticeDraft/setKind"),
        savePerson: (person) => set({ person, savedAt: new Date().toISOString() }, false, "noticeDraft/savePerson"),
        setChannels: (c) => set((s) => ({ channels: { ...s.channels, ...c } }), false, "noticeDraft/setChannels"),
        toggleZone: (zone) =>
          set((s) => ({ zones: s.zones.includes(zone) ? s.zones.filter((z) => z !== zone) : [...s.zones, zone] }), false, "noticeDraft/toggleZone"),
        goTo: (step) => set({ step }, false, "noticeDraft/goTo"),
        reset: () => set(initial, false, "noticeDraft/reset"),
      }),
      { name: "za-notice-draft", storage: createJSONStorage(() => sessionStorage) },
    ),
    { name: "NoticeDraftStore", enabled: process.env.NODE_ENV === "development" },
  ),
);

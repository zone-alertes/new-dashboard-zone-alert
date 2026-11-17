import type { Metadata } from "next";
import { SecuritySettingsView } from "@/features/settings/components/security-settings-view";

export const metadata: Metadata = { title: "Paramètres · Sécurité" };

export default function SecuritePage() {
  return <SecuritySettingsView />;
}

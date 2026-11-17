import type { LucideIcon } from "lucide-react";
import {
  Bell,
  ChartColumn,
  FileChartColumn,
  FileText,
  LayoutGrid,
  Map,
  Shield,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react";
import type { Permission } from "@/types/domain";

export type NavBadge = "notifications" | "alerts";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Live counter shown in the sidebar, resolved from the query cache. */
  badge?: NavBadge;
  /** Hidden when the signed-in role lacks this permission. */
  permission?: Permission;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Information architecture of the V2 sidebar (Figma component "Sidebar"). */
export const NAVIGATION: NavGroup[] = [
  {
    label: "Pilotage",
    items: [
      { label: "Tableau de bord", href: "/tableau-de-bord", icon: LayoutGrid },
      { label: "Carte en direct", href: "/carte", icon: Map },
      { label: "Notifications", href: "/notifications", icon: Bell, badge: "notifications" },
    ],
  },
  {
    label: "Opérations",
    items: [
      { label: "Alertes", href: "/alertes", icon: TriangleAlert, badge: "alerts" },
      { label: "Avis de recherche", href: "/avis-de-recherche", icon: Users },
      { label: "Publications", href: "/publications", icon: FileText },
    ],
  },
  {
    label: "Analyse",
    items: [
      { label: "Prédictions IA", href: "/ia/predictions", icon: TrendingUp },
      { label: "Recommandations IA", href: "/ia/recommandations", icon: Sparkles },
      { label: "Rapports IA", href: "/ia/rapports/nouveau", icon: FileChartColumn },
      { label: "Statistiques", href: "/statistiques", icon: ChartColumn },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Utilisateurs", href: "/utilisateurs", icon: Shield, permission: "users.manage" },
      { label: "Paramètres", href: "/parametres/securite", icon: SlidersHorizontal },
    ],
  },
];

/** Breadcrumb roots: "/alertes/ALT-2481" → "Opérations / Alertes / ALT-2481". */
export function breadcrumbFor(pathname: string): string[] {
  for (const group of NAVIGATION) {
    for (const item of group.items) {
      const base = item.href.replace(/\/nouveau$/, "");
      if (pathname === base || pathname.startsWith(base + "/")) {
        const rest = pathname.slice(base.length).split("/").filter(Boolean).map(decodeURIComponent);
        const pretty = rest.map((seg) => SEGMENT_LABELS[`${base}/${seg}`] ?? SEGMENT_LABELS[seg] ?? seg);
        return [group.label, item.label, ...pretty];
      }
    }
  }
  return ["Pilotage"];
}

const SEGMENT_LABELS: Record<string, string> = {
  "/ia/rapports/nouveau": "Nouveau rapport",
  nouveau: "Nouvel avis",
  nouvelle: "Nouvelle publication",
  securite: "Sécurité du compte",
};

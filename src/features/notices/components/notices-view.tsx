"use client";

import { ChevronDown, Download } from "lucide-react";
import { Button, ButtonLink, Chip, CountTabs, EmptyState, SearchInput, Skeleton } from "@/components/ui";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { useUrlState } from "@/hooks/use-url-state";
import { toast } from "@/stores/ui-store";
import { noticeFiltersSchema } from "../schemas";
import { useNotices } from "../queries";
import { NoticeCard } from "./notice-card";

/** Screen 3.1 — Avis de recherche. */
export function NoticesView() {
  const [filters, setFilters] = useUrlState(noticeFiltersSchema);
  const { data, isPending } = useNotices(filters.tab, filters.q);
  const c = data?.counts;

  return (
    <PageContent>
      <PageHeader
        title="Avis de recherche"
        subtitle={c ? `${c.disparue + c.recherchee} avis actifs : ${c.disparue} personnes disparues, ${c.recherchee} personnes recherchées` : " "}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Download className="size-[18px]" aria-hidden />}
              onClick={() => toast("Export des avis en préparation", { tone: "info" })}
            >
              Exporter
            </Button>
            <ButtonLink href="/avis-de-recherche/nouveau" icon>
              Publier un avis
            </ButtonLink>
          </>
        }
      />
      <CountTabs
        label="Type d'avis"
        value={filters.tab}
        onChange={(tab) => setFilters({ tab })}
        items={[
          { value: "disparue", label: "Personnes disparues", count: c?.disparue },
          { value: "recherchee", label: "Personnes recherchées", count: c?.recherchee },
          { value: "cloturee", label: "Retrouvées ou clôturées", count: c?.cloturee },
        ]}
      />
      <div className="flex items-center gap-3">
        <SearchInput placeholder="Nom, commune, référence…" defaultValue={filters.q} onChange={(e) => setFilters({ q: e.target.value })} />
        <Chip trailing={<ChevronDown className="size-3.5 text-ink-3" aria-hidden />}>Disparition : 30 derniers jours</Chip>
        <Chip trailing={<ChevronDown className="size-3.5 text-ink-3" aria-hidden />}>Commune : toutes</Chip>
      </div>
      <div className="grid grid-cols-4 gap-5">
        {isPending && Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-[370px]" />)}
        {data?.items.map((n) => (
          <NoticeCard key={n.ref} notice={n} />
        ))}
      </div>
      {data && data.items.length === 0 && (
        <EmptyState
          title={filters.tab === "recherchee" ? "Aucun avis de personne recherchée dans ce jeu de démonstration" : "Aucun avis ne correspond"}
          description="Les avis « personne recherchée » doivent être validés par un officier avant publication."
        />
      )}
    </PageContent>
  );
}

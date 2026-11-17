"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Download, X } from "lucide-react";
import { Button, Card, Checkbox, Chip, CountTabs, EmptyState, Pagination, SearchInput, Skeleton, Table, Td, Th, THead, Tr } from "@/components/ui";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { useUrlState } from "@/hooks/use-url-state";
import { useAlertSelection } from "@/stores/alert-selection-store";
import { toast } from "@/stores/ui-store";
import { timeAgo } from "@/lib/utils/format";
import type { Severity } from "@/types/domain";
import { ALERTS_PAGE_SIZE, SEVERITY_LABEL, type AlertTab } from "../constants";
import { alertFiltersSchema } from "../schemas";
import { useAlertCounts, useAlerts } from "../queries";
import { SeverityBadge, StatusBadge } from "./alert-badges";

const SEVERITIES: Severity[] = ["grave", "serieuse", "moderee"];

/** Screen 2.2 — Liste des alertes (filters in the URL, selection in a Zustand store). */
export function AlertsView() {
  const router = useRouter();
  const [filters, setFilters] = useUrlState(alertFiltersSchema);
  const { data, isPending } = useAlerts(filters);
  const counts = useAlertCounts();
  const selected = useAlertSelection((s) => s.selected);
  const toggle = useAlertSelection((s) => s.toggle);
  const setMany = useAlertSelection((s) => s.setMany);
  const clear = useAlertSelection((s) => s.clear);

  const pageRefs = data?.items.map((a) => a.ref) ?? [];
  const allOnPage = pageRefs.length > 0 && pageRefs.every((r) => selected.includes(r));
  const toggleSeverity = (s: Severity) => {
    const next = filters.severity.includes(s) ? filters.severity.filter((x) => x !== s) : [...filters.severity, s];
    setFilters({ severity: next, page: null });
  };

  const tabs: { value: AlertTab; label: string; count?: number }[] = [
    { value: "actives", label: "Toutes actives", count: counts?.actives },
    { value: "a_qualifier", label: "À qualifier", count: counts?.en_qualification },
    { value: "a_assigner", label: "À assigner", count: counts?.a_assigner },
    { value: "intervention", label: "En intervention", count: counts?.intervention },
    { value: "cloturees", label: "Clôturées (30 j)", count: counts?.cloturees },
  ];

  const from = data ? (data.page - 1) * ALERTS_PAGE_SIZE + 1 : 0;
  const to = data ? from + data.items.length - 1 : 0;

  return (
    <PageContent>
      <PageHeader
        title="Alertes"
        subtitle={counts ? `${counts.actives} alertes actives · ${counts.en_qualification} à qualifier · mise à jour en temps réel` : " "}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Download className="size-[18px]" aria-hidden />}
              onClick={() => toast("Export CSV des alertes filtrées en préparation", { tone: "info" })}
            >
              Exporter
            </Button>
            <Button icon onClick={() => toast("Saisie manuelle d'une alerte (appel 112) : formulaire à venir", { tone: "info" })}>
              Saisir une alerte
            </Button>
          </>
        }
      />

      <CountTabs label="Filtrer par statut" items={tabs} value={filters.tab} onChange={(tab) => setFilters({ tab, page: null })} />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          placeholder="Rechercher une référence, un lieu…"
          defaultValue={filters.q}
          onChange={(e) => setFilters({ q: e.target.value, page: null })}
        />
        {SEVERITIES.map((s) => (
          <Chip
            key={s}
            active={filters.severity.includes(s)}
            onClick={() => toggleSeverity(s)}
            trailing={filters.severity.includes(s) ? <X className="size-3.5" aria-hidden /> : undefined}
          >
            Gravité : {SEVERITY_LABEL[s]}
          </Chip>
        ))}
        <Chip>Période : aujourd&apos;hui</Chip>
        {(filters.severity.length > 0 || filters.q) && (
          <button
            type="button"
            onClick={() => setFilters({ severity: null, q: null, page: null })}
            className="type-body-strong text-brand-strong hover:underline"
          >
            Effacer les filtres
          </button>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex h-12 items-center gap-4 rounded-lg bg-ink px-4 text-on-brand" role="region" aria-label="Actions groupées">
          <span className="type-body-strong">
            {selected.length} alerte{selected.length > 1 ? "s" : ""} sélectionnée{selected.length > 1 ? "s" : ""}
          </span>
          <button type="button" className="type-body-strong hover:underline" onClick={() => router.push(`/alertes/${selected[0]}?action=assigner`)}>
            Assigner
          </button>
          <button
            type="button"
            className="type-body-strong hover:underline"
            disabled={selected.length < 2}
            onClick={() => router.push(`/alertes/${selected[0]}?action=rejeter`)}
          >
            Fusionner
          </button>
          <button
            type="button"
            className="type-body-strong hover:underline"
            onClick={() => toast(`Export de ${selected.length} alertes en préparation`, { tone: "info" })}
          >
            Exporter
          </button>
          <button type="button" className="type-body text-line-strong hover:text-on-brand" onClick={clear}>
            Annuler
          </button>
        </div>
      )}

      <Card className="gap-0 p-2">
        <Table>
          <THead>
            <tr>
              <Th width={36}>
                <Checkbox checked={allOnPage} onChange={(v) => setMany(pageRefs, v)} label={<span className="sr-only">Tout sélectionner</span>} />
              </Th>
              <Th width={86}>Réf.</Th>
              <Th>Type</Th>
              <Th width={104}>Gravité</Th>
              <Th width={210}>Lieu</Th>
              <Th width={100}>Reçue</Th>
              <Th width={100}>Signalements</Th>
              <Th width={180}>Statut</Th>
              <Th width={36} />
            </tr>
          </THead>
          <tbody>
            {data?.items.map((a) => (
              <Tr key={a.ref} onClick={() => router.push(`/alertes/${a.ref}`)} selected={selected.includes(a.ref)}>
                <Td>
                  <span onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selected.includes(a.ref)} onChange={() => toggle(a.ref)} label={<span className="sr-only">Sélectionner {a.ref}</span>} />
                  </span>
                </Td>
                <Td strong>{a.ref}</Td>
                <Td>{a.type}</Td>
                <Td>
                  <SeverityBadge severity={a.severity} />
                </Td>
                <Td>{a.place}</Td>
                <Td>{timeAgo(a.receivedAt)}</Td>
                <Td>{a.reportsCount}</Td>
                <Td>
                  <StatusBadge status={a.status} />
                </Td>
                <Td>
                  <ChevronRight className="size-4 text-ink-3" aria-hidden />
                </Td>
              </Tr>
            ))}
            {isPending &&
              Array.from({ length: 8 }, (_, i) => (
                <tr key={i}>
                  <td colSpan={9} className="px-4 py-2">
                    <Skeleton className="h-10" />
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
        {data && data.items.length === 0 && (
          <EmptyState title="Aucune alerte ne correspond à ces filtres" description="Modifiez la recherche ou effacez les filtres." />
        )}
        {data && data.total > 0 && (
          <div className="px-4 py-3">
            <Pagination
              summary={`Alertes ${from} à ${to} sur ${data.total} · ${ALERTS_PAGE_SIZE} par page`}
              page={data.page}
              pages={Array.from({ length: data.pageCount }, (_, i) => i + 1)}
              onPage={(page) => setFilters({ page })}
            />
          </div>
        )}
      </Card>
    </PageContent>
  );
}

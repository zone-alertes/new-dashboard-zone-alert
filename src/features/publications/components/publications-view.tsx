"use client";

import { useState } from "react";
import { Archive, ChevronDown, Clock, Download, Ellipsis, Eye, MapPin } from "lucide-react";
import { Badge, Button, ButtonLink, Checkbox, Chip, CountTabs, EmptyState, Modal, Pagination, SearchInput, Skeleton } from "@/components/ui";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { useUrlState } from "@/hooks/use-url-state";
import { useSessionStore } from "@/stores/session-store";
import { toast } from "@/stores/ui-store";
import type { Publication } from "@/types/domain";
import { CATEGORY_LABEL, CATEGORY_TONE, PUB_STATUS_LABEL, PUB_STATUS_TONE } from "../constants";
import { pubFiltersSchema } from "../schemas";
import { useArchivePublication, useDeletePublication, usePublications } from "../queries";

/** Screens 4.1 (list) and 4.3 (archive dialog, deep-linkable with ?archiver=<id>). */
export function PublicationsView() {
  const [filters, setFilters] = useUrlState(pubFiltersSchema);
  const { data, isPending } = usePublications(filters.tab, filters.q);
  const c = data?.counts;
  const toArchive = data?.items.find((p) => p.id === filters.archiver);

  return (
    <PageContent>
      <PageHeader
        title="Publications"
        subtitle={c ? `${c.total} publications : ${c.publiee} publiées, ${c.programmee} programmées, ${c.brouillon} brouillons, ${c.archivee} archivées` : " "}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Download className="size-[18px]" aria-hidden />}
              onClick={() => toast("Export des publications en préparation", { tone: "info" })}
            >
              Exporter
            </Button>
            <ButtonLink href="/publications/nouvelle" icon>
              Nouvelle publication
            </ButtonLink>
          </>
        }
      />
      <CountTabs
        label="Statut"
        value={filters.tab}
        onChange={(tab) => setFilters({ tab, page: null })}
        items={[
          { value: "toutes", label: "Toutes", count: c?.total },
          { value: "publiee", label: "Publiées", count: c?.publiee },
          { value: "programmee", label: "Programmées", count: c?.programmee },
          { value: "brouillon", label: "Brouillons", count: c?.brouillon },
          { value: "archivee", label: "Archivées", count: c?.archivee },
        ]}
      />
      <div className="flex items-center gap-3">
        <SearchInput
          className="w-[360px]"
          placeholder="Titre, auteur, catégorie…"
          defaultValue={filters.q}
          onChange={(e) => setFilters({ q: e.target.value })}
        />
        {["Catégorie : toutes", "Commune : toutes", "Trier : plus récentes"].map((l) => (
          <Chip key={l} trailing={<ChevronDown className="size-3.5 text-ink-3" aria-hidden />}>
            {l}
          </Chip>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        {isPending && Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[300px]" />)}
        {data?.items.map((p) => (
          <PublicationCard key={p.id} publication={p} onArchive={() => setFilters({ archiver: p.id })} />
        ))}
      </div>
      {data && data.items.length === 0 && <EmptyState title="Aucune publication dans cet onglet" />}
      {data && filters.tab === "toutes" && (
        <Pagination
          summary={`Publications 1 à ${data.items.length} sur ${c?.total}`}
          page={1}
          pages={[1, 2, 3, "…", 22]}
          onPage={() => toast("Pagination serveur : non simulée en démo", { tone: "info" })}
        />
      )}
      {toArchive && <ArchiveDialog publication={toArchive} onClose={() => setFilters({ archiver: null })} />}
    </PageContent>
  );
}

function PublicationCard({ publication: p, onArchive }: { publication: Publication; onArchive: () => void }) {
  const [menu, setMenu] = useState(false);
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-line bg-card p-5">
      <div className="flex items-center justify-between">
        <Badge tone={CATEGORY_TONE[p.category]}>{CATEGORY_LABEL[p.category]}</Badge>
        <Badge tone={PUB_STATUS_TONE[p.status]}>{PUB_STATUS_LABEL[p.status]}</Badge>
      </div>
      <h3 className="type-h3 text-ink">{p.title}</h3>
      <p className="type-small text-ink-2">{p.excerpt}</p>
      <div className="flex-1" />
      <ul className="flex flex-col gap-1 type-caption text-ink-2">
        <li className="flex items-center gap-1.5">
          <MapPin className="size-3.5 text-ink-3" aria-hidden /> {p.audience}
        </li>
        <li className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-ink-3" aria-hidden /> {p.byline}
        </li>
        <li className="flex items-center gap-1.5">
          <Eye className="size-3.5 text-ink-3" aria-hidden /> {p.views}
        </li>
      </ul>
      <div className="relative flex gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() =>
            toast(p.status === "relecture" ? "Relecture : ouvrir l'éditeur en mode validation" : "Ouvrir l'éditeur de publication", { tone: "info" })
          }
        >
          {p.status === "relecture" ? "Relire et valider" : "Modifier"}
        </Button>
        <button
          type="button"
          aria-label="Plus d'actions"
          aria-expanded={menu}
          onClick={() => setMenu((m) => !m)}
          className="flex size-10 items-center justify-center rounded-lg border border-line-strong text-ink-2 hover:bg-muted"
        >
          <Ellipsis className="size-[18px]" />
        </button>
        {menu && p.status !== "archivee" && (
          <div role="menu" className="absolute right-0 bottom-12 z-10 w-48 rounded-xl border border-line bg-card p-1.5 shadow-popover">
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setMenu(false);
                onArchive();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 type-body text-ink-2 hover:bg-page"
            >
              <Archive className="size-4" /> Archiver
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function ArchiveDialog({ publication, onClose }: { publication: Publication; onClose: () => void }) {
  const archive = useArchivePublication();
  const remove = useDeletePublication();
  const isMainAdmin = useSessionStore((s) => s.user?.role === "admin");
  const [hardDelete, setHardDelete] = useState(false);
  return (
    <Modal
      open
      onClose={onClose}
      width={520}
      icon={
        <span className="flex size-11 items-center justify-center rounded-full bg-warning-soft text-warning">
          <Archive className="size-[22px]" aria-hidden />
        </span>
      }
      title={`Archiver « ${publication.title} » ?`}
      description="La publication disparaît de l'application citoyenne. Elle reste dans l'onglet « Archivées » et peut être restaurée à tout moment."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant={hardDelete ? "danger" : "primary"}
            loading={archive.isPending || remove.isPending}
            onClick={() => (hardDelete ? remove : archive).mutate(publication.id, { onSuccess: onClose })}
          >
            {hardDelete ? "Supprimer définitivement" : "Archiver"}
          </Button>
        </>
      }
    >
      <div className="rounded-lg bg-muted p-3">
        <Checkbox
          checked={hardDelete}
          disabled={!isMainAdmin}
          onChange={setHardDelete}
          label={<span className="type-small text-ink-2">Supprimer définitivement (réservé à l&apos;administrateur principal, action irréversible)</span>}
        />
      </div>
    </Modal>
  );
}

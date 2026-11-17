import Image from "next/image";
import Link from "next/link";
import { Ellipsis } from "lucide-react";
import { Badge } from "@/components/ui";
import type { Notice } from "@/types/domain";
import { initials } from "@/lib/utils/format";
import { NOTICE_STATUS_TONE, noticeStatusLabel } from "../constants";

const longDate = (iso: string) => {
  const d = new Date(iso + "T12:00:00Z");
  const day = d.getUTCDate();
  const month = new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "UTC" }).format(d);
  return `${day === 1 ? "1er" : day} ${month} ${d.getUTCFullYear()}`;
};

/** Card of the notices grid (screen 3.1). */
export function NoticeCard({ notice }: { notice: Notice }) {
  const found = notice.status === "retrouvee";
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-card">
      {notice.photo ? (
        <Image src={notice.photo} alt={`Photo de ${notice.name}`} width={260} height={200} className="h-[200px] w-full object-cover" />
      ) : (
        <div className="flex h-[200px] flex-col items-center justify-center gap-1.5 bg-muted">
          <span className="type-display text-ink-3">{initials(notice.name)}</span>
          <span className="type-caption text-ink-3">Photo en attente de validation</span>
        </div>
      )}
      <div className="flex flex-col gap-1.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="type-h3 text-ink">{notice.name}</h3>
          <Badge tone={NOTICE_STATUS_TONE[notice.status]}>{noticeStatusLabel(notice)}</Badge>
        </div>
        <p className="type-small text-ink-2">
          {notice.age} ans · {notice.sex}
        </p>
        <p className="type-small text-ink-2">
          {found ? `Retrouvée le ${longDate(notice.foundAt!).replace(/ \d{4}$/, "")} · disparue le` : "Disparition le"} {longDate(notice.missingSince)}
        </p>
        <p className="type-small text-ink-2">Dernier lieu : {notice.lastPlace}</p>
        <div className="flex items-center justify-between py-1">
          <Link href={`/avis-de-recherche/${notice.ref}`} className="type-body-strong text-brand-strong hover:underline">
            Voir l&apos;avis<span className="sr-only"> de {notice.name}</span>
          </Link>
          <button type="button" aria-label={`Actions pour ${notice.name}`} className="rounded p-0.5 text-ink-3 hover:bg-muted">
            <Ellipsis className="size-[18px]" />
          </button>
        </div>
      </div>
    </article>
  );
}

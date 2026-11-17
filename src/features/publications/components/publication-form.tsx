"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Button, Card, Checkbox, Segmented, TextArea, TextField } from "@/components/ui";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { COMMUNES } from "@/lib/mock/data/geo";
import { formatInt } from "@/lib/utils/format";
import { AUDIENCE_PER_COMMUNE, CATEGORY_LABEL } from "../constants";
import { publicationSchema, type PublicationInput } from "../schemas";
import { useCreatePublication } from "../queries";

const CATEGORY_TEXT: Record<PublicationInput["category"], string> = {
  alerte: "text-danger",
  information: "text-info",
  appel_temoins: "text-warning",
  systeme: "text-ink-2",
};

/** Screen 4.2 — Nouvelle publication, with a live citizen-phone preview. */
export function PublicationForm() {
  const router = useRouter();
  const create = useCreatePublication();
  const { control, register, handleSubmit, setValue, formState } = useForm<PublicationInput>({
    resolver: zodResolver(publicationSchema),
    defaultValues: {
      category: "alerte",
      title: "Fermeture de la route de Matadi à Ngaliema",
      message:
        "Suite à l'incendie d'un commerce, la route de Matadi est fermée entre le rond-point Ngaliema et Binza Delvaux jusqu'à 22 h. Merci d'emprunter l'avenue Colonel Mondjiba.",
      zones: ["Ngaliema", "Kintambo"],
      channels: { app: true, push: true, sms: true },
      publishAt: "Maintenant",
      expiresAt: "2026-11-08T23:00",
    },
  });
  const [category, title, message, zones, channels] = useWatch({ control, name: ["category", "title", "message", "zones", "channels"] });
  const smsCount = Math.max(1, Math.ceil(message.length / 160));
  const e = formState.errors;
  const submit = (mode: "draft" | "review") =>
    handleSubmit((input) => create.mutate({ input, mode }, { onSuccess: () => router.push("/publications?tab=brouillon") }));
  const addable = Object.keys(COMMUNES).filter((c) => !zones.includes(c));

  return (
    <PageContent>
      <PageHeader title="Nouvelle publication" subtitle="Les alertes diffusées par SMS sont relues par un second administrateur avant envoi." />
      <form noValidate onSubmit={submit("review")} className="flex flex-col gap-6">
        <div className="flex items-start gap-6">
          <Card title="Contenu" className="min-w-0 flex-1 gap-5 p-6">
            <div className="flex flex-col gap-1.5">
              <span className="type-label text-ink-2">Catégorie *</span>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Segmented
                    label="Catégorie"
                    value={field.value}
                    onChange={field.onChange}
                    options={(Object.keys(CATEGORY_LABEL) as PublicationInput["category"][]).map((v) => ({ value: v, label: CATEGORY_LABEL[v] }))}
                  />
                )}
              />
            </div>
            <TextField label="Titre *" error={e.title?.message} {...register("title")} />
            <TextArea
              label="Message *"
              error={e.message?.message}
              hint={`${message.length} / 500 caractères · SMS : ${smsCount} message${smsCount > 1 ? "s" : ""}`}
              maxLength={500}
              {...register("message")}
            />
            <div className="flex flex-col gap-2">
              <span className="type-label text-ink-2">Zone de diffusion *</span>
              <div className="flex flex-wrap items-center gap-2">
                {zones.map((z) => (
                  <span key={z} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-muted px-3 type-small text-ink">
                    {z}
                    <button
                      type="button"
                      aria-label={`Retirer ${z}`}
                      onClick={() =>
                        setValue(
                          "zones",
                          zones.filter((x) => x !== z),
                          { shouldValidate: true },
                        )
                      }
                    >
                      <X className="size-3.5 text-ink-3" />
                    </button>
                  </span>
                ))}
                <label className="relative type-body-strong text-brand-strong">
                  + Ajouter une commune
                  <select
                    className="absolute inset-0 cursor-pointer opacity-0"
                    value=""
                    onChange={(ev) => ev.target.value && setValue("zones", [...zones, ev.target.value], { shouldValidate: true })}
                    aria-label="Ajouter une commune"
                  >
                    <option value="" />
                    {addable.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>
              {e.zones && <p className="type-caption text-danger">{e.zones.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <span className="type-label text-ink-2">Canaux</span>
              <div className="flex gap-6">
                {(
                  [
                    ["app", "Application"],
                    ["push", "Notification push"],
                    ["sms", "SMS"],
                  ] as const
                ).map(([k, l]) => (
                  <Checkbox
                    key={k}
                    checked={channels[k]}
                    onChange={(v) => setValue(`channels.${k}`, v, { shouldValidate: true })}
                    label={<span className="type-body text-ink">{l}</span>}
                  />
                ))}
              </div>
              <p className="type-caption text-ink-3">
                {e.channels?.root?.message ??
                  `Environ ${formatInt(zones.length * AUDIENCE_PER_COMMUNE)} destinataires dans ${zones.length === 1 ? "la commune" : `les ${zones.length} communes`}`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TextField label="Publication" {...register("publishAt")} />
              <TextField label="Expiration automatique" type="datetime-local" {...register("expiresAt")} />
            </div>
          </Card>

          <Card title="Aperçu" action={<span className="type-small text-ink-3">Téléphone citoyen</span>} className="w-[380px] shrink-0">
            <div className="flex h-[520px] flex-col rounded-[28px] bg-ink p-4" aria-label="Aperçu de la notification">
              <div className="flex flex-1 flex-col gap-2.5 rounded-2xl bg-page p-3.5">
                <p className="text-center type-body-strong text-ink">18:52</p>
                <div className="flex flex-col gap-1.5 rounded-xl bg-card p-3.5">
                  <div className="flex items-center gap-2">
                    <Image src="/images/logo-zone-alerte.png" alt="" width={20} height={20} className="rounded" />
                    <span className={`type-label ${CATEGORY_TEXT[category]}`}>Zone Alerte · {CATEGORY_LABEL[category]}</span>
                  </div>
                  <p className="type-h3 text-ink">{title || "Titre de la publication"}</p>
                  <p className="type-small text-ink-2">{message.length > 90 ? `${message.slice(0, 88).trimEnd()}…` : message}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/publications")}>
            Annuler
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={submit("draft")} disabled={create.isPending}>
              Enregistrer le brouillon
            </Button>
            <Button type="submit" loading={create.isPending}>
              Envoyer en relecture
            </Button>
          </div>
        </div>
      </form>
    </PageContent>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Info } from "lucide-react";
import { Button, Callout, Card, Checkbox, Chip, RadioCard, RadioDot, Segmented, Stepper, TextField, Toggle } from "@/components/ui";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { useNoticeDraft, type NoticeStep } from "@/stores/notice-draft-store";
import { toast } from "@/stores/ui-store";
import { COMMUNES } from "@/lib/mock/data/geo";
import { noticePersonSchema, type NoticePersonFormValues, type NoticePersonInput } from "../schemas";
import { useCreateNotice } from "../queries";

const STEP_LABELS = ["Type d'avis : personne disparue", "Informations", "Diffusion et validation"];
const SUBTITLES: Record<NoticeStep, string> = {
  1: "Étape 1 sur 3 · type d'avis",
  2: "Étape 2 sur 3 · informations sur la personne",
  3: "Étape 3 sur 3 · diffusion et validation",
};

/** Screen 3.3 — Publier un avis de recherche (3-step wizard, draft in a persisted store). */
export function NoticeWizard() {
  const step = useNoticeDraft((s) => s.step);
  const kind = useNoticeDraft((s) => s.kind);
  const steps = STEP_LABELS.map((label, i) => ({
    label: i === 0 ? (kind === "disparue" ? label : "Type d'avis : personne recherchée") : label,
    state: (i + 1 < step ? "done" : i + 1 === step ? "current" : "todo") as "done" | "current" | "todo",
  }));
  return (
    <PageContent>
      <PageHeader title="Publier un avis de recherche" subtitle={SUBTITLES[step]} />
      <Stepper steps={steps} />
      {step === 1 && <StepType />}
      {step === 2 && <StepPerson />}
      {step === 3 && <StepBroadcast />}
    </PageContent>
  );
}

function Footer({ onCancel, secondary, primary }: { onCancel: () => void; secondary?: React.ReactNode; primary: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" onClick={onCancel}>
        Annuler
      </Button>
      <div className="flex gap-3">
        {secondary}
        {primary}
      </div>
    </div>
  );
}

function useCancel() {
  const router = useRouter();
  const reset = useNoticeDraft((s) => s.reset);
  return () => {
    reset();
    router.push("/avis-de-recherche");
  };
}

function StepType() {
  const kind = useNoticeDraft((s) => s.kind);
  const setKind = useNoticeDraft((s) => s.setKind);
  const goTo = useNoticeDraft((s) => s.goTo);
  const cancel = useCancel();
  return (
    <>
      <Card title="Type d'avis" className="p-6">
        <div role="radiogroup" className="grid grid-cols-2 gap-4">
          {(
            [
              ["disparue", "Personne disparue", "Appel à l'aide de la population pour retrouver une personne. Consentement de la famille requis."],
              ["recherchee", "Personne recherchée", "Suspect recherché par la police. Validation d'un officier obligatoire avant diffusion."],
            ] as const
          ).map(([v, title, body]) => (
            <RadioCard key={v} name="kind" value={v} checked={kind === v} onSelect={() => setKind(v)} className="items-start p-4">
              <RadioDot checked={kind === v} />
              <span className="flex flex-col gap-1">
                <span className="type-body-strong text-ink">{title}</span>
                <span className="type-small text-ink-2">{body}</span>
              </span>
            </RadioCard>
          ))}
        </div>
      </Card>
      <Footer onCancel={cancel} primary={<Button onClick={() => goTo(2)}>Suivant : informations</Button>} />
    </>
  );
}

function StepPerson() {
  const person = useNoticeDraft((s) => s.person);
  const savePerson = useNoticeDraft((s) => s.savePerson);
  const goTo = useNoticeDraft((s) => s.goTo);
  const cancel = useCancel();
  const { register, control, handleSubmit, getValues, formState } = useForm<NoticePersonFormValues, unknown, NoticePersonInput>({
    resolver: zodResolver(noticePersonSchema),
    defaultValues: person as NoticePersonFormValues,
  });
  const e = formState.errors;
  const minor = Number(useWatch({ control, name: "age" })) < 18;

  return (
    <form
      noValidate
      onSubmit={handleSubmit((v) => {
        savePerson(v);
        goTo(3);
      })}
      className="flex flex-col gap-6"
    >
      <Card title="Informations sur la personne" className="p-6">
        <div className="flex items-start gap-8">
          <div className="flex w-[260px] shrink-0 flex-col gap-3">
            <Controller
              control={control}
              name="hasPhoto"
              render={({ field }) => (
                <label className="flex h-[300px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-muted p-4 text-center hover:bg-line">
                  <input type="file" accept="image/jpeg,image/png" className="sr-only" onChange={(ev) => field.onChange(!!ev.target.files?.length)} />
                  <ImageIcon className="size-7 text-ink-3" aria-hidden />
                  <span className="type-body-strong text-ink-2">{field.value ? "Photo ajoutée ✓" : "Glisser une photo récente"}</span>
                  <span className="max-w-[200px] type-caption text-ink-3">JPG ou PNG, 5 Mo maximum, visage visible</span>
                </label>
              )}
            />
            {minor && (
              <Callout tone="warning" icon={<Info aria-hidden />} className="p-3">
                Personne mineure : l&apos;accord d&apos;un parent ou tuteur est obligatoire avant publication.
                <Controller
                  control={control}
                  name="guardianConsent"
                  render={({ field }) => (
                    <Checkbox className="mt-2" checked={field.value} onChange={field.onChange} label={<span className="type-small">Accord recueilli</span>} />
                  )}
                />
                {e.guardianConsent && <p className="mt-1 type-caption text-danger">{e.guardianConsent.message}</p>}
              </Callout>
            )}
          </div>
          <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-4">
            <TextField label="Nom complet *" error={e.fullName?.message} {...register("fullName")} />
            <TextField label="Âge *" type="number" min={0} max={120} error={e.age?.message} {...register("age")} />
            <Controller
              control={control}
              name="sex"
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <span className="type-label text-ink-2">Sexe *</span>
                  <Segmented
                    label="Sexe"
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: "Féminin", label: "Féminin" },
                      { value: "Masculin", label: "Masculin" },
                    ]}
                  />
                </div>
              )}
            />
            <TextField label="Taille" {...register("height")} />
            <TextField label="Signes distinctifs" {...register("signs")} />
            <TextField label="Tenue lors de la disparition" {...register("outfit")} />
            <TextField label="Date et heure *" type="datetime-local" error={e.missingAt?.message} {...register("missingAt")} />
            <TextField label="Dernier lieu connu *" error={e.lastPlace?.message} {...register("lastPlace")} />
            <TextField label="Contact de la famille *" error={e.familyContact?.message} {...register("familyContact")} />
            <TextField label="Langues parlées" {...register("languages")} />
            <Callout tone="info" icon={<Info aria-hidden />} className="col-span-2 p-3">
              Aucun champ sur l&apos;origine ethnique ou la couleur de peau : utiliser les signes distinctifs. Pour un avis « personne recherchée », employer «
              suspect » et faire valider par un officier.
            </Callout>
          </div>
        </div>
      </Card>
      <Footer
        onCancel={cancel}
        secondary={
          <Button
            variant="secondary"
            onClick={() => {
              savePerson({ ...getValues(), age: Number(getValues("age")) });
              toast("Brouillon enregistré sur cet appareil", { tone: "info" });
            }}
          >
            Enregistrer le brouillon
          </Button>
        }
        primary={<Button type="submit">Suivant : diffusion</Button>}
      />
    </form>
  );
}

function StepBroadcast() {
  const router = useRouter();
  const { person, channels, zones, setChannels, toggleZone, goTo, reset } = useNoticeDraft();
  const create = useCreateNotice();
  const cancel = useCancel();
  return (
    <>
      <div className="flex items-start gap-6">
        <Card title="Canaux de diffusion" className="flex-1">
          {(
            [
              ["app", "Notification dans l'application citoyenne"],
              ["sms", "SMS aux abonnés des communes ciblées"],
              ["radio", "Communiqué aux radios partenaires"],
            ] as const
          ).map(([k, l]) => (
            <div key={k} className="flex items-center justify-between">
              <span className="type-body text-ink">{l}</span>
              <Toggle label={l} checked={channels[k]} onChange={(v) => setChannels({ [k]: v })} />
            </div>
          ))}
        </Card>
        <Card title="Communes ciblées" className="flex-1">
          <div className="flex flex-wrap gap-2">
            {Object.keys(COMMUNES).map((c) => (
              <Chip key={c} active={zones.includes(c)} onClick={() => toggleZone(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </Card>
      </div>
      <Card title="Récapitulatif">
        <p className="type-body text-ink">
          {person.fullName}, {person.age} ans, {person.sex?.toLowerCase()} · dernier lieu : {person.lastPlace}. Diffusion sur {zones.length} commune
          {zones.length > 1 ? "s" : ""}.
        </p>
        <Callout tone="neutral">
          Expiration automatique dans 30 jours si l&apos;avis n&apos;est pas prolongé. Chaque publication est consignée dans le journal d&apos;audit.
        </Callout>
      </Card>
      <Footer
        onCancel={cancel}
        secondary={
          <Button variant="secondary" onClick={() => goTo(2)}>
            Précédent
          </Button>
        }
        primary={
          <Button
            loading={create.isPending}
            onClick={() =>
              create.mutate(noticePersonSchema.parse(person), {
                onSuccess: (n) => {
                  reset();
                  router.push(`/avis-de-recherche?tab=disparue#${n.ref}`);
                },
              })
            }
          >
            Publier l&apos;avis
          </Button>
        }
      />
    </>
  );
}

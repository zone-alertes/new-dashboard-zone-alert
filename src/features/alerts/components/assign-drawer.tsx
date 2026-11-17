"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car } from "lucide-react";
import { Badge, Button, Checkbox, Drawer, RadioCard, RadioDot, Skeleton, TextField } from "@/components/ui";
import type { Alert } from "@/types/domain";
import { formatNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { assignSchema, type AssignInput } from "../schemas";
import { useAssignTeam, useTeams } from "../queries";

/** Screen 2.5 — Assigner une équipe (teams sorted by ETA, busy teams disabled). */
export function AssignDrawer({ alert, open, onClose }: { alert: Alert; open: boolean; onClose: () => void }) {
  const { data: teams } = useTeams();
  const assign = useAssignTeam(alert.ref);
  const { control, register, handleSubmit, formState } = useForm<AssignInput>({
    resolver: zodResolver(assignSchema),
    values: {
      teamId: teams?.find((t) => !t.busyOn)?.id ?? "",
      instructions: alert.ref === "ALT-2481" ? "Suspects armés, 3 individus, moto rouge vers Socimat. Prudence." : "",
      notifySms: true,
    },
    resetOptions: { keepDirtyValues: true },
  });
  const teamId = useWatch({ control, name: "teamId" });
  const team = teams?.find((t) => t.id === teamId);
  const submit = handleSubmit((v) => assign.mutate({ ...v, teamName: team?.name ?? "" }, { onSuccess: onClose }));

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Assigner une équipe"
      description={`${alert.ref} · ${alert.type} · ${alert.commune}. Équipes triées par temps d'arrivée estimé.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={submit} loading={assign.isPending} disabled={!team}>
            Assigner {team?.name}
          </Button>
        </>
      }
    >
      <Controller
        control={control}
        name="teamId"
        render={({ field }) => (
          <div role="radiogroup" aria-label="Équipes disponibles" className="flex flex-col gap-3">
            {!teams && Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-16" />)}
            {teams?.map((t) => {
              const busy = !!t.busyOn;
              const on = field.value === t.id;
              return (
                <RadioCard key={t.id} name="team" value={t.id} checked={on} disabled={busy} onSelect={() => field.onChange(t.id)}>
                  {!busy && <RadioDot checked={on} />}
                  <Car className={cn("size-5", busy ? "text-ink-3" : "text-ink-2")} aria-hidden />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className={cn("type-body-strong", busy ? "text-ink-3" : "text-ink")}>{t.name}</span>
                    <span className="type-small text-ink-3">
                      {t.unit} · {formatNumber(t.distanceKm, 1)} km
                    </span>
                  </span>
                  {busy ? (
                    <Badge tone="neutral">En intervention · {t.busyOn}</Badge>
                  ) : (
                    <span className="flex flex-col items-end">
                      <span className="type-h3 text-ink">{t.etaMin} min</span>
                      <span className="type-caption text-ink-3">arrivée estimée</span>
                    </span>
                  )}
                </RadioCard>
              );
            })}
          </div>
        )}
      />
      {formState.errors.teamId && <p className="type-caption text-danger">{formState.errors.teamId.message}</p>}
      <TextField label="Consignes pour l'équipe" {...register("instructions")} />
      <Controller
        control={control}
        name="notifySms"
        render={({ field }) => (
          <Checkbox
            checked={field.value}
            onChange={field.onChange}
            label={<span className="type-small text-ink-2">Notifier par push, et par SMS si pas de réponse sous 60 s</span>}
          />
        )}
      />
    </Drawer>
  );
}

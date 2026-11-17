"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { Button, Callout, Modal, RadioCard, RadioDot, TextField } from "@/components/ui";
import type { Alert } from "@/types/domain";
import { REJECT_REASONS } from "../constants";
import { rejectSchema, type RejectInput } from "../schemas";
import { useRejectAlert } from "../queries";

/** Screen 2.4 — Rejeter avec motif (mandatory reason, merge into the original alert). */
export function RejectDialog({ alert, open, onClose }: { alert: Alert; open: boolean; onClose: () => void }) {
  const reject = useRejectAlert(alert.ref);
  const { control, register, handleSubmit, formState } = useForm<RejectInput>({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      reason: alert.duplicateOf ? "doublon" : "faux",
      mergeInto: alert.duplicateOf?.ref,
      comment: alert.duplicateOf ? "Même commerce, même description des suspects." : "",
    },
  });
  const reason = useWatch({ control, name: "reason" });
  const mergeInto = useWatch({ control, name: "mergeInto" });
  const submit = handleSubmit((values) => reject.mutate(values, { onSuccess: onClose }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Rejeter l'alerte ${alert.ref} ?`}
      description="Le motif est obligatoire. Il est enregistré dans le journal d'audit et sert à améliorer la détection des faux signalements."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="danger" onClick={submit} loading={reject.isPending}>
            {reason === "doublon" ? "Fusionner et rejeter" : "Rejeter l'alerte"}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
        <Controller
          control={control}
          name="reason"
          render={({ field }) => (
            <div role="radiogroup" aria-label="Motif du rejet" className="flex flex-col gap-3">
              {REJECT_REASONS.map((r) => (
                <div key={r.value} className="flex flex-col gap-3">
                  <RadioCard name="reason" value={r.value} checked={field.value === r.value} onSelect={() => field.onChange(r.value)} className="h-12 py-0">
                    <RadioDot checked={field.value === r.value} />
                    <span className={field.value === r.value ? "type-body-strong text-ink" : "type-body text-ink"}>{r.label}</span>
                  </RadioCard>
                  {r.value === "doublon" && field.value === "doublon" && (
                    <TextField
                      label="Alerte d'origine"
                      error={formState.errors.mergeInto?.message}
                      list="merge-candidates"
                      {...register("mergeInto")}
                      hint={alert.duplicateOf ? `${alert.duplicateOf.ref} · ${alert.duplicateOf.summary}` : undefined}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        />
        <TextField label={reason === "autre" ? "Commentaire" : "Commentaire (facultatif)"} error={formState.errors.comment?.message} {...register("comment")} />
        {reason === "doublon" && (
          <Callout tone="neutral" icon={<Info aria-hidden />}>
            Les {alert.reportsCount} signalements seront fusionnés dans {mergeInto || "l'alerte d'origine"}. Les signaleurs en seront informés.
          </Callout>
        )}
      </form>
    </Modal>
  );
}

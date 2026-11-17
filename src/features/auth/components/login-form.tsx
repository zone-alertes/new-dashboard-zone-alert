"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { Button, Callout, Checkbox, TextField } from "@/components/ui";
import { useSessionStore } from "@/stores/session-store";
import { toast } from "@/stores/ui-store";
import { authApi } from "../api";
import { loginSchema, type LoginInput } from "../schemas";

/** Screen 1.1 — Connexion. */
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const startTwoFactor = useSessionStore((s) => s.startTwoFactor);
  const { register, handleSubmit, control, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "macgenius@zonealerte.cd", password: "", remember: true },
  });
  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (user, input) => {
      startTwoFactor(user, input.remember);
      const redirect = params.get("redirect");
      router.push(redirect ? `/verification?redirect=${encodeURIComponent(redirect)}` : "/verification");
    },
  });

  return (
    <form
      onSubmit={handleSubmit((v) => login.mutate(v))}
      noValidate
      className="flex w-[460px] max-w-full flex-col gap-6 rounded-xl border border-line bg-card p-10"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <Image src="/images/logo-zone-alerte.png" alt="Zone Alerte" width={56} height={56} className="rounded-xl" priority />
        <h1 className="type-h1 text-ink">Connexion à Zone Alerte</h1>
        <p className="max-w-[380px] type-small text-ink-2">Console de sécurité urbaine. Accès réservé aux agents habilités.</p>
      </div>
      <TextField label="Adresse email professionnelle" type="email" autoComplete="username" error={formState.errors.email?.message} {...register("email")} />
      <TextField
        label="Mot de passe"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••••••"
        error={formState.errors.password?.message}
        {...register("password")}
      />
      {login.error && (
        <p role="alert" className="-mt-2 type-small text-danger">
          {login.error.message}
        </p>
      )}
      <div className="flex items-center justify-between">
        <Controller
          control={control}
          name="remember"
          render={({ field }) => (
            <Checkbox checked={field.value} onChange={field.onChange} label={<span className="type-small text-ink-2">Se souvenir de cet appareil</span>} />
          )}
        />
        <button
          type="button"
          onClick={() => toast("Un lien de réinitialisation a été envoyé à votre adresse.", { tone: "info" })}
          className="type-body-strong text-brand-strong hover:underline"
        >
          Mot de passe oublié ?
        </button>
      </div>
      <Button type="submit" loading={login.isPending} className="w-full">
        {login.isPending ? "Connexion…" : "Se connecter"}
      </Button>
      <Callout tone="info" icon={<Info aria-hidden />} className="p-3">
        Pas de compte ? Les accès sont créés uniquement sur invitation d&apos;un administrateur.
      </Callout>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { requestPasswordReset, signIn, signInWithGoogle, signUp, updatePassword, type AuthState } from "@/app/actions/auth";

function Feedback({ state }: { state: AuthState }) {
  if (state?.error) return <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>;
  if (state?.message) return <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>;
  return null;
}

function GoogleButton({ next }: { next?: string }) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="next" value={next ?? ""} />
      <Button type="submit" variant="secondary" className="w-full">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z" />
        </svg>
        Continuer avec Google
      </Button>
    </form>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-subtle">
      <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function LoginForm({ next, error }: { next?: string; error?: string }) {
  const [state, action, pending] = useActionState(signIn, error ? { error: "La connexion a échoué, réessaie." } : undefined);
  return (
    <>
      <h1 className="text-xl font-semibold">Bon retour 👋</h1>
      <p className="mt-1 text-sm text-muted">Connecte-toi à ton espace créateur.</p>
      <div className="mt-6">
        <GoogleButton next={next} />
      </div>
      <Divider />
      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next ?? ""} />
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link href="/forgot-password" className="mb-1.5 text-xs text-brand-text hover:underline">
              Oublié ?
            </Link>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <Feedback state={state} />
        <Button type="submit" className="w-full" loading={pending}>
          Se connecter
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-medium text-brand-text hover:underline">
          Créer un compte
        </Link>
      </p>
    </>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signUp, undefined);
  return (
    <>
      <h1 className="text-xl font-semibold">Crée ton espace créateur</h1>
      <p className="mt-1 text-sm text-muted">Gratuit, sans carte bancaire. 30 crédits IA offerts chaque mois.</p>
      <div className="mt-6">
        <GoogleButton next="/onboarding" />
      </div>
      <Divider />
      <form action={action} className="space-y-4">
        <div>
          <Label htmlFor="name">Nom ou pseudo</Label>
          <Input id="name" name="name" autoComplete="nickname" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </div>
        <Feedback state={state} />
        <Button type="submit" className="w-full" loading={pending}>
          Créer mon compte
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-subtle">
          En créant un compte, tu acceptes les <Link href="/cgv" className="underline">CGV</Link> et la{" "}
          <Link href="/confidentialite" className="underline">politique de confidentialité</Link>.
        </p>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-medium text-brand-text hover:underline">
          Se connecter
        </Link>
      </p>
    </>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  return (
    <>
      <h1 className="text-xl font-semibold">Mot de passe oublié</h1>
      <p className="mt-1 text-sm text-muted">On t'envoie un lien pour en choisir un nouveau.</p>
      <form action={action} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <Feedback state={state} />
        <Button type="submit" className="w-full" loading={pending}>
          Envoyer le lien
        </Button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-brand-text hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </>
  );
}

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, undefined);
  return (
    <>
      <h1 className="text-xl font-semibold">Nouveau mot de passe</h1>
      <form action={action} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" name="password" type="password" minLength={8} required />
        </div>
        <Feedback state={state} />
        <Button type="submit" className="w-full" loading={pending}>
          Enregistrer
        </Button>
      </form>
    </>
  );
}

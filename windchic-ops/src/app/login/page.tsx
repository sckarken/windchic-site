"use client";
import { useActionState } from "react";
import Image from "next/image";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <div className="grid min-h-screen place-items-center bg-navy px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center text-cream">
          <Image src="/mark.png" alt="" width={56} height={56} className="rounded-xl" />
          <div className="mt-4 text-xl font-semibold tracking-[.3em]">WINDCHIC</div>
          <div className="h-serif text-lg text-gold2/80">Ops cockpit</div>
        </div>
        <form action={action} className="card space-y-4 p-6">
          <label className="block"><span className="label">Email</span><input name="email" type="email" required className="input" autoFocus /></label>
          <label className="block"><span className="label">Mot de passe</span><input name="password" type="password" required className="input" /></label>
          {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
          <button disabled={pending} className="btn-primary w-full justify-center py-2.5">{pending ? "Connexion…" : "Se connecter"}</button>
        </form>
      </div>
    </div>
  );
}

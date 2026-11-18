import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, verify, type Session } from "./session";

export async function getSession() {
  return verify((await cookies()).get(COOKIE)?.value);
}
export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

// Matrice des droits — Direction : tout ; Chef de projet : tout sauf trésorerie globale ; Partenaire : relation client, sans coûts fournisseurs.
const RIGHTS = {
  ADMIN: ["finance:view", "finance:edit", "costs:view", "suppliers:identity", "margin:validate", "users:manage"],
  PM: ["costs:view", "suppliers:identity", "finance:view"],
  PARTNER: [],
} as const;
export type Right = (typeof RIGHTS)["ADMIN"][number];
export function can(s: Session | null, r: Right) {
  return !!s && (RIGHTS[s.role] as readonly string[]).includes(r);
}
export async function requireRight(r: Right) {
  const s = await requireSession();
  if (!can(s, r)) throw new Error("Accès refusé");
  return s;
}

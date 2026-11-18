export const eur = (n: number | null | undefined, digits = 0) =>
  n == null ? "—" : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
export const pct = (n: number | null | undefined) => (n == null ? "—" : `${(n * 100).toFixed(1).replace(".", ",")} %`);
export const d = (x: Date | string | null | undefined) =>
  x ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(x)) : "—";
export const dShort = (x: Date | string | null | undefined) =>
  x ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(x)) : "—";
export const isoDate = (x: Date | null | undefined) => (x ? new Date(x).toISOString().slice(0, 10) : "");
export function daysUntil(x: Date | string | null | undefined) {
  if (!x) return null;
  const a = new Date(); a.setHours(0, 0, 0, 0);
  const b = new Date(x); b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
export const jLabel = (n: number | null) => (n == null ? "" : n === 0 ? "Jour J" : n > 0 ? `J-${n}` : `J+${-n}`);

import { SUPPLIER_CATEGORIES, SUPPLIER_STATUSES } from "@/lib/constants";
import { saveSupplier } from "@/app/actions";
import type { Supplier } from "@prisma/client";

export function SupplierForm({ s }: { s?: Supplier }) {
  const cats = new Set((s?.categories ?? "").split(","));
  const scores = [["scoreConformity", "Conformité"], ["scoreReactivity", "Réactivité"], ["scorePrice", "Prix"], ["scoreReliability", "Fiabilité"]] as const;
  return (
    <form action={saveSupplier} className="card space-y-4 p-6">
      {s && <input type="hidden" name="id" value={s.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <label><span className="label">Nom commercial *</span><input name="name" required defaultValue={s?.name} className="input" /></label>
        <label><span className="label">Raison sociale</span><input name="legalName" defaultValue={s?.legalName ?? ""} className="input" /></label>
        <label><span className="label">Ville</span><input name="city" defaultValue={s?.city ?? ""} className="input" /></label>
        <label><span className="label">Pays</span><input name="country" defaultValue={s?.country ?? ""} className="input" /></label>
        <label><span className="label">Email</span><input name="email" defaultValue={s?.email ?? ""} className="input" /></label>
        <label><span className="label">Téléphone / WhatsApp</span><input name="phone" defaultValue={s?.phone ?? ""} className="input" /></label>
        <label className="sm:col-span-2"><span className="label">Site web</span><input name="website" defaultValue={s?.website ?? ""} className="input" /></label>
      </div>
      <div><span className="label">Catégories</span><div className="flex flex-wrap gap-1.5">{SUPPLIER_CATEGORIES.map((c) => (
        <label key={c} className="chip cursor-pointer bg-white px-2.5 py-1 ring-1 ring-black/10 has-[:checked]:bg-navy has-[:checked]:text-cream"><input type="checkbox" name="categories" value={c} defaultChecked={cats.has(c)} className="hidden" />{c}</label>
      ))}</div></div>
      <div className="grid gap-4 sm:grid-cols-5">
        {scores.map(([k, l]) => <label key={k}><span className="label">{l} /5</span><input name={k} type="number" min={1} max={5} defaultValue={s?.[k] ?? ""} className="input" /></label>)}
        <label><span className="label">Statut</span><select name="status" defaultValue={s?.status ?? "A_CONTACTER"} className="input">{SUPPLIER_STATUSES.map((x) => <option key={x.key} value={x.key}>{x.fr}</option>)}</select></label>
      </div>
      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="insuranceVerified" defaultChecked={s?.insuranceVerified} className="accent-[#c6a16b]" /> Assurance RC vérifiée</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="nonCircumventionSigned" defaultChecked={s?.nonCircumventionSigned} className="accent-[#c6a16b]" /> Non-contournement signé</label>
      </div>
      <label className="block"><span className="label">Notes internes (jamais transmises au client)</span><textarea name="notes" rows={3} defaultValue={s?.notes ?? ""} className="input" /></label>
      <button className="btn-primary">Enregistrer</button>
    </form>
  );
}

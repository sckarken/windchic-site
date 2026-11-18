import type { Client } from "@prisma/client";
import { saveClient } from "@/app/actions";
export function ClientForm({ c }: { c?: Client }) {
  return (
    <form action={saveClient} className="card space-y-4 p-6">
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <label><span className="label">Nom *</span><input name="name" required defaultValue={c?.name} className="input" /></label>
        <label><span className="label">Raison sociale (facturation)</span><input name="legalName" defaultValue={c?.legalName ?? ""} className="input" /></label>
        <label><span className="label">Ville</span><input name="city" defaultValue={c?.city ?? ""} className="input" /></label>
        <label><span className="label">Pays</span><input name="country" defaultValue={c?.country ?? ""} className="input" /></label>
        <label><span className="label">N° TVA / immatriculation</span><input name="vatNumber" defaultValue={c?.vatNumber ?? ""} className="input" /></label>
        <label><span className="label">Source</span><select name="source" defaultValue={c?.source ?? "WENJING"} className="input"><option value="WENJING">Réseau Wenjing</option><option value="SITE">Site</option><option value="RESEAU">Réseau Théo</option><option value="DIRECT">Prospection</option></select></label>
      </div>
      <label className="block"><span className="label">Adresse de facturation</span><textarea name="billingAddress" rows={2} defaultValue={c?.billingAddress ?? ""} className="input" /></label>
      <label className="block"><span className="label">Notes</span><textarea name="notes" rows={3} defaultValue={c?.notes ?? ""} className="input" /></label>
      <button className="btn-primary">Enregistrer</button>
    </form>
  );
}

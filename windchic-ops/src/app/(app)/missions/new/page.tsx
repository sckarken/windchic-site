import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { BILLING_MODELS, MISSION_TYPES, URGENCIES } from "@/lib/constants";
import { Field, PageHeader, Select } from "@/components/ui";
import { createMission } from "../../../actions";

export default async function NewMission() {
  const s = await requireSession();
  const [clients, users] = await Promise.all([db.client.findMany({ orderBy: { name: "asc" } }), db.user.findMany()]);
  const partner = users.find((u) => u.role === "PARTNER");
  return (
    <>
      <PageHeader kicker="Étape 1 · Enregistrer" title={<>Nouvelle demande <span className="h-serif text-gold">en 60 secondes</span></>} />
      <form action={createMission} className="grid gap-6 lg:grid-cols-3">
        <div className="card space-y-4 p-6 lg:col-span-2">
          <Field label="Titre court *"><input name="title" required placeholder="ex. MWC 2027 — délégation 3 personnes" className="input" /></Field>
          <Field label="La demande en une phrase (collez le message WeChat / WhatsApp / email)">
            <textarea name="summary" rows={4} className="input" placeholder="Flash mob 6 danseurs sur stand, 17 et 18/11 à 14h…" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Type"><Select name="type" options={MISSION_TYPES} defaultValue="EVENEMENT" /></Field>
            <Field label="Urgence"><Select name="urgency" options={URGENCIES} defaultValue="NORMALE" /></Field>
            <Field label="Budget plafond (interne)"><input name="budgetCeiling" inputMode="decimal" placeholder="€ HT" className="input" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Salon / événement" className="sm:col-span-2"><input name="eventName" className="input" /></Field>
            <Field label="Ville"><input name="city" className="input" /></Field>
            <Field label="Pays"><input name="country" className="input" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date J (début)"><input type="date" name="startDate" className="input" /></Field>
            <Field label="Date de fin"><input type="date" name="endDate" className="input" /></Field>
          </div>
        </div>
        <div className="space-y-6">
          <div className="card space-y-4 p-6">
            <Field label="Client existant">
              <select name="clientId" className="input" defaultValue=""><option value="">— nouveau client —</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            </Field>
            <Field label="…ou nouveau client"><input name="newClient" className="input" placeholder="Nom de l'entreprise" /></Field>
            <Field label="Source"><select name="source" className="input"><option value="WENJING">Réseau Wenjing</option><option value="SITE">Site windchic.com</option><option value="RESEAU">Réseau Théo</option><option value="DIRECT">Prospection directe</option></select></Field>
          </div>
          <div className="card space-y-4 p-6">
            <Field label="Modèle de facturation">
              <div className="space-y-2">
                {BILLING_MODELS.map((b, i) => (
                  <label key={b.key} className="flex cursor-pointer gap-3 rounded-xl border border-black/10 p-3 has-[:checked]:border-gold has-[:checked]:bg-gold/10">
                    <input type="radio" name="billingModel" value={b.key} defaultChecked={i === 0} className="mt-1 accent-[#c6a16b]" />
                    <span><span className="block text-sm font-medium">{b.fr}</span><span className="block text-xs text-muted">{b.hint}</span></span>
                  </label>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Relation client"><select name="relationOwnerId" defaultValue={partner?.id ?? s.uid} className="input">{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></Field>
              <Field label="Opérations"><select name="opsOwnerId" defaultValue={s.uid} className="input">{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></Field>
            </div>
          </div>
          <button className="btn-gold w-full justify-center py-3 text-base">Créer et ouvrir le brief →</button>
          <p className="text-center text-xs text-muted">Le brief (18 questions), la check-list de conformité et le code mission sont créés automatiquement.</p>
        </div>
      </form>
    </>
  );
}

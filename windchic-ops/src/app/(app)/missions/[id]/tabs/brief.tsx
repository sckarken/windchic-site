import { BRIEF_STATUSES } from "@/lib/constants";
import { saveBrief } from "../../../../actions";
import type { TabProps } from "./types";

export function Brief({ m }: TabProps) {
  const done = m.briefItems.filter((b) => b.status === "CONFIRME" || b.status === "SANS_OBJET").length;
  const ratio = m.briefItems.length ? done / m.briefItems.length : 0;
  const cats = [...new Set(m.briefItems.map((b) => b.category))];
  const toAsk = m.briefItems.filter((b) => b.status === "A_DEMANDER" || b.status === "A_CLARIFIER");
  const questionsForClient = toAsk.map((b, i) => `${i + 1}. ${b.question}${b.note ? ` (${b.note})` : ""}`).join("\n");
  return (
    <form action={saveBrief} className="grid gap-6 xl:grid-cols-4">
      <input type="hidden" name="missionId" value={m.id} />
      <div className="space-y-5 xl:col-span-3">
        {cats.map((cat) => (
          <section key={cat} className="card overflow-hidden">
            <div className="bg-cream/60 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">{cat}</div>
            <div className="divide-y divide-black/5">
              {m.briefItems.filter((b) => b.category === cat).map((b) => (
                <div key={b.id} className="grid gap-3 p-4 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <div className="text-sm font-medium">{b.question}</div>
                    {b.source && <div className="mt-1 text-[11px] text-muted">Source : {b.source}</div>}
                  </div>
                  <textarea name={`a_${b.id}`} defaultValue={b.answer ?? ""} rows={2} placeholder="Réponse du client, mot pour mot" className="input md:col-span-4" />
                  <div className="space-y-2 md:col-span-4">
                    <select name={`s_${b.id}`} defaultValue={b.status} className="input">{BRIEF_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.fr}</option>)}</select>
                    <input name={`n_${b.id}`} defaultValue={b.note ?? ""} placeholder="Note interne : impact prestataire, question à reposer" className="input text-xs" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        <div className="card flex flex-wrap items-end gap-3 p-4">
          <label className="w-40"><span className="label">Catégorie</span><input name="newCategory" placeholder="Autre" className="input" /></label>
          <label className="flex-1"><span className="label">Ajouter une question</span><input name="newQuestion" className="input" /></label>
        </div>
      </div>
      <aside className="space-y-4">
        <div className="card sticky top-6 space-y-4 p-5">
          <div>
            <div className="label">Complétude du brief</div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-gold" style={{ width: `${Math.round(ratio * 100)}%` }} /></div>
            <div className="mt-1 text-xs text-muted">{done}/{m.briefItems.length} confirmées · {toAsk.length} ouvertes</div>
          </div>
          <button className="btn-primary w-full justify-center">Enregistrer le brief</button>
          {toAsk.length > 0 && (
            <div>
              <div className="label">Questions à envoyer au client</div>
              <textarea readOnly rows={8} defaultValue={questionsForClient} className="input font-mono text-[11px]" />
              <p className="mt-1 text-[11px] text-muted">À copier dans WeChat / WhatsApp. Préférez des questions fermées.</p>
            </div>
          )}
        </div>
      </aside>
    </form>
  );
}

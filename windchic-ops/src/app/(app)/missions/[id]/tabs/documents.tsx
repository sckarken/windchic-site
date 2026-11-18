import { DOC_TYPES, label } from "@/lib/constants";
import { d } from "@/lib/format";
import { Empty } from "@/components/ui";
import { addDocument } from "../../../../actions";
import type { TabProps } from "./types";

export function Documents({ m }: TabProps) {
  const quoteFiles = m.lots.flatMap((l) => l.quotes.filter((q) => q.fileUrl).map((q) => ({ id: q.id, title: `Devis ${q.supplier.code} — ${l.title}`, url: q.fileUrl! })));
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="card p-5 xl:col-span-2">
        <h3 className="mb-3 font-semibold">Pièces de la mission</h3>
        {m.documents.length + quoteFiles.length === 0 ? <Empty>Les fichiers restent dans Google Drive : on stocke ici les liens, classés par type.</Empty> : (
          <ul className="divide-y divide-black/5">
            {m.documents.map((x) => <li key={x.id} className="flex items-center gap-3 py-2.5"><span className="chip bg-cream">{label(DOC_TYPES, x.type)}</span><a href={x.url} target="_blank" className="flex-1 truncate text-sm font-medium hover:underline">{x.title}</a><span className="text-xs text-muted">{d(x.createdAt)}</span></li>)}
            {quoteFiles.map((x) => <li key={x.id} className="flex items-center gap-3 py-2.5"><span className="chip bg-cream">Devis fournisseur</span><a href={x.url} target="_blank" className="flex-1 truncate text-sm hover:underline">{x.title}</a></li>)}
          </ul>
        )}
      </div>
      <form action={addDocument} className="card h-fit space-y-3 p-5">
        <input type="hidden" name="missionId" value={m.id} />
        <h3 className="font-semibold">Ajouter un lien</h3>
        <label className="block"><span className="label">Type</span><select name="type" className="input">{DOC_TYPES.map((t) => <option key={t.key} value={t.key}>{t.fr}</option>)}</select></label>
        <label className="block"><span className="label">Titre</span><input name="title" required className="input" /></label>
        <label className="block"><span className="label">URL (Drive)</span><input name="url" required className="input" /></label>
        <button className="btn-primary w-full justify-center">Ajouter</button>
      </form>
    </div>
  );
}

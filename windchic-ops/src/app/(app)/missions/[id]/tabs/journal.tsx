import { addNote } from "../../../../actions";
import type { TabProps } from "./types";

const ICON: Record<string, string> = { NOTE: "✎", EMAIL: "✉", APPEL: "☎", DECISION: "◆", STATUT: "→" };

export function Journal({ m }: TabProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="card p-5 xl:col-span-2">
        <h3 className="mb-4 font-semibold">Historique & décisions</h3>
        <ol className="relative space-y-4 border-l border-black/10 pl-5">
          {m.activities.map((a) => (
            <li key={a.id}>
              <span className="absolute -left-2.5 grid size-5 place-items-center rounded-full bg-white text-[10px] ring-1 ring-black/10">{ICON[a.kind] ?? "•"}</span>
              <div className={`text-sm ${a.kind === "DECISION" ? "font-medium" : ""}`}>{a.content}</div>
              <div className="text-xs text-muted">{a.user?.name ?? "Système"} · {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(a.createdAt)}</div>
            </li>
          ))}
        </ol>
      </div>
      <form action={addNote} className="card h-fit space-y-3 p-5">
        <input type="hidden" name="missionId" value={m.id} />
        <h3 className="font-semibold">Consigner</h3>
        <select name="kind" className="input"><option value="NOTE">Note</option><option value="DECISION">Décision client (validée par écrit)</option><option value="APPEL">Appel</option><option value="EMAIL">Email</option></select>
        <textarea name="content" rows={4} required className="input" placeholder="WeChat sert à discuter, pas à décider : notez ici chaque décision." />
        <button className="btn-primary w-full justify-center">Ajouter</button>
      </form>
    </div>
  );
}

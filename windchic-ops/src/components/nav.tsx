"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Cockpit", zh: "驾驶舱", icon: "◎" },
  { href: "/missions", label: "Missions", zh: "项目", icon: "▦" },
  { href: "/taches", label: "Tâches", zh: "任务", icon: "✓" },
  { href: "/prestataires", label: "Prestataires", zh: "供应商", icon: "⚑" },
  { href: "/clients", label: "Clients", zh: "客户", icon: "◇" },
];
export function Nav() {
  const p = usePathname();
  return (
    <nav className="space-y-1 px-3">
      {ITEMS.map((i) => {
        const active = i.href === "/" ? p === "/" : p.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-white/10 text-white" : "text-cream/65 hover:bg-white/5 hover:text-white"}`}>
            <span className={`grid size-6 place-items-center rounded-md text-xs ${active ? "bg-gold text-navy" : "bg-white/5 text-gold2/70"}`}>{i.icon}</span>
            <span className="flex-1">{i.label}</span>
            <span className="text-[10px] text-cream/30">{i.zh}</span>
          </Link>
        );
      })}
      <Link href="/missions/new" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gold px-3 py-2.5 text-sm font-semibold text-navy hover:brightness-105">+ Nouvelle demande</Link>
    </nav>
  );
}

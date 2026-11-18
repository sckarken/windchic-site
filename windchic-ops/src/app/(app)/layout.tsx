import Link from "next/link";
import Image from "next/image";
import { requireSession } from "@/lib/auth";
import { logout } from "../actions";
import { Nav } from "@/components/nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await requireSession();
  const roleLabel = s.role === "ADMIN" ? "Direction" : s.role === "PM" ? "Chef de projet" : "Partenaire";
  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy text-cream lg:flex">
        <Link href="/" className="flex items-center gap-3 px-6 pt-7 pb-8">
          <Image src="/mark.png" alt="" width={34} height={34} className="rounded-lg" />
          <div>
            <div className="text-[15px] font-semibold tracking-[.2em]">WINDCHIC</div>
            <div className="h-serif -mt-0.5 text-sm text-gold2/80">Ops cockpit</div>
          </div>
        </Link>
        <Nav />
        <div className="mt-auto border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-full bg-gold/90 text-sm font-semibold text-navy">{s.name.slice(0, 1)}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{s.name}</div>
              <div className="text-xs text-cream/50">{roleLabel}</div>
            </div>
            <form action={logout}><button className="rounded-lg px-2 py-1 text-xs text-cream/60 hover:bg-white/10">Quitter</button></form>
          </div>
        </div>
      </aside>
      <header className="no-print sticky top-0 z-20 flex items-center justify-between bg-navy px-4 py-3 text-cream lg:hidden">
        <Link href="/" className="font-semibold tracking-[.2em]">WINDCHIC</Link>
        <div className="flex gap-3 text-sm"><Link href="/missions">Missions</Link><Link href="/taches">Tâches</Link><Link href="/prestataires">Prestataires</Link></div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}

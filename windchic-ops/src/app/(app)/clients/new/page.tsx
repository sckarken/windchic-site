import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { ClientForm } from "@/components/client-form";
export default async function NewClient() { await requireSession(); return <><PageHeader kicker="CRM" title="Nouveau client" /><div className="max-w-3xl"><ClientForm /></div></>; }

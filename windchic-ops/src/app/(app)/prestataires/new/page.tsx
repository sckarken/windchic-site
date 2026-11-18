import { requireRight } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { SupplierForm } from "@/components/supplier-form";
export default async function NewSupplier() {
  await requireRight("suppliers:identity");
  return <><PageHeader kicker="Prestataires" title="Nouveau prestataire" /><div className="max-w-3xl"><SupplierForm /></div></>;
}

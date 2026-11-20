import { requireUser } from "@/lib/session";
import { NewOwnerEquipment } from "@/components/dashboards/owner-equipment";

export default async function NewEquipmentPage() {
  await requireUser("owner");
  return <NewOwnerEquipment />;
}

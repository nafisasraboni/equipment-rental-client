import { requireUser } from "@/lib/session";
import { OwnerEquipment } from "@/components/dashboards/owner-equipment";

export default async function OwnerEquipmentPage() {
  await requireUser("owner");
  return <OwnerEquipment />;
}

import { requireUser } from "@/lib/session";
import { AdminEquipment } from "@/components/dashboards/admin-equipment";

export default async function AdminEquipmentPage() {
  await requireUser("admin");
  return <AdminEquipment />;
}

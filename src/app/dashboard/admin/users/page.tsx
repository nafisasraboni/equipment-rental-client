import { requireUser } from "@/lib/session";
import { AdminUsers } from "@/components/dashboards/admin-users";

export default async function AdminUsersPage() {
  const user = await requireUser("admin");
  return <AdminUsers currentUserId={user.id} />;
}

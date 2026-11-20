import { requireUser } from "@/lib/session";
import { ProfileScreen } from "@/components/dashboards/profile-screen";

export default async function ProfilePage() { const user = await requireUser(undefined, "/dashboard/profile"); return <ProfileScreen user={user} />; }

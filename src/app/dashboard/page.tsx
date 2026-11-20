import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireUser();
  redirect(user.role === "customer" ? "/dashboard/customer/rentals" : `/dashboard/${user.role}/analytics`);
}

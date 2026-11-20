import { requireUser } from "@/lib/session";
import { RentalsTable } from "@/components/dashboards/rentals-table";

export default async function AdminRentalsPage() {
  await requireUser("admin");
  return <RentalsTable admin />;
}

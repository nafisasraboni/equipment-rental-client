import { requireUser } from "@/lib/session";
import { RentalsTable } from "@/components/dashboards/rentals-table";

export default async function OwnerRentalsPage() {
  await requireUser("owner");
  return <RentalsTable />;
}

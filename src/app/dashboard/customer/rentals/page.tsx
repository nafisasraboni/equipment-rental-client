import { requireUser } from "@/lib/session";
import { CustomerRentals } from "@/components/dashboards/customer-rentals";

export default async function CustomerRentalsPage() { await requireUser("customer", "/dashboard/customer/rentals"); return <CustomerRentals />; }

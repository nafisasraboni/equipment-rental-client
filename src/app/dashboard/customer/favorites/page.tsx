import { requireUser } from "@/lib/session";
import { CustomerFavorites } from "@/components/dashboards/customer-favorites";

export default async function FavoritesPage() { await requireUser("customer", "/dashboard/customer/favorites"); return <CustomerFavorites />; }

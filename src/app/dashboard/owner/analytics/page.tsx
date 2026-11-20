import { requireUser } from "@/lib/session";
import { OwnerAnalyticsDashboard } from "@/components/dashboards/analytics";

export default async function OwnerAnalyticsPage() {
  await requireUser("owner");
  return <OwnerAnalyticsDashboard />;
}

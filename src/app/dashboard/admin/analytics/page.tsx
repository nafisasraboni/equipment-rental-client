import { requireUser } from "@/lib/session";
import { AdminAnalyticsDashboard } from "@/components/dashboards/analytics";

export default async function AdminAnalyticsPage() {
  await requireUser("admin");
  return <AdminAnalyticsDashboard />;
}

import { requireUser } from "@/lib/session";
import { DetailsScreen } from "@/components/equipment/details-screen";

export default async function DetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(undefined, `/equipment/${id}`);
  return <DetailsScreen id={id} user={user} />;
}

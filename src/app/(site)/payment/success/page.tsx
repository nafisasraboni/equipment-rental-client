import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { PaymentSuccess } from "@/components/equipment/payment-result";
import { LoadingState } from "@/components/ui/states";

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  await requireUser("customer", `/payment/success${session_id ? `?session_id=${encodeURIComponent(session_id)}` : ""}`);
  return <Suspense fallback={<LoadingState />}><PaymentSuccess /></Suspense>;
}

import { requireUser } from "@/lib/session";
import { PaymentCancel } from "@/components/equipment/payment-result";

export default async function PaymentCancelPage() { await requireUser("customer", "/payment/cancel"); return <PaymentCancel />; }

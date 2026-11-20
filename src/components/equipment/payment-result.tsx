"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CalendarDays, CircleCheck, Clock, ShieldCheck } from "lucide-react";
import type { Booking } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/utils";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/ui/states";

interface VerifiedPayment { booking: Booking | null; paymentStatus: "paid" | "unpaid" | "no_payment_required"; status: "complete" | "open" | "expired" }

export function PaymentSuccess() {
  const params = useSearchParams();
  const sessionId = params.get("session_id") ?? "";
  const result = useApi<VerifiedPayment>(`/api/bookings/verify?sessionId=${encodeURIComponent(sessionId)}`);
  if (result.loading) return <div className="container payment-result"><LoadingState label="Verifying your payment and confirming your booking…" /></div>;
  if (result.error || !result.data) return <div className="container payment-result"><ErrorState message={result.error ?? "Payment information could not be verified."} onRetry={result.refresh} /></div>;
  const booking = result.data.booking;
  const paid = result.data.paymentStatus === "paid" && booking;
  return <section className="container payment-result"><div className="panel"><span className="state-icon">{paid ? <CircleCheck size={34} /> : <Clock size={32} />}</span><p className="eyebrow">{paid ? "You’re all set" : "Payment status"}</p><h1>{paid ? <>Your next possibility<br /><em>is booked.</em></> : "Your payment is being checked."}</h1><p>{paid ? "Payment received and rental confirmed. Your booking details are saved in your dashboard." : result.data.status === "expired" ? "This checkout session has expired. Choose your equipment and dates to start a new booking." : "A booking is confirmed only after verified payment. Check again or return to the marketplace."}</p>{paid && <div className="payment-info"><div><span>Equipment</span><strong>{booking.equipment.name}</strong></div><div><span>Rental dates</span><strong>{formatDate(booking.startDate)} – {formatDate(booking.endDate)}</strong></div><div><span>Quantity</span><strong>{booking.quantity} units</strong></div><div><span>Total paid</span><strong>{formatMoney(booking.amountCents, booking.currency)}</strong></div><div><span>Booking reference</span><strong>{booking.id.slice(0, 8).toUpperCase()}</strong></div></div>}<div className="payment-actions"><Button asChild><Link href="/dashboard/customer/rentals">View my rentals <CalendarDays size={17} /></Link></Button>{!paid && <Button variant="outline" onClick={result.refresh}><ShieldCheck size={17} />Check payment again</Button>}<Button asChild variant="outline"><Link href="/equipment">Explore more gear <ArrowRight size={17} /></Link></Button></div></div></section>;
}

export function PaymentCancel() {
  return <section className="container payment-result"><div className="panel"><span className="state-icon"><CalendarDays size={32} /></span><p className="eyebrow">There’s still time for your next idea</p><h1>Checkout wasn’t completed.</h1><p>No booking has been confirmed. Your temporary equipment reservation will be released when the checkout expires. You can explore the marketplace and try again.</p><div className="payment-actions"><Button asChild><Link href="/equipment">Back to equipment <ArrowRight size={17} /></Link></Button><Button asChild variant="outline"><Link href="/dashboard/customer/rentals">My rentals</Link></Button></div></div></section>;
}

"use client";

import { useState, type FormEvent } from "react";
import { CalendarDays, LoaderCircle, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import type { Equipment, Quote, RentalInput } from "@/lib/types";
import { errorMessage, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/field";

export function BookingDialog({ equipment, open, onOpenChange }: { equipment: Equipment; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteInput, setQuoteInput] = useState<RentalInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"quote" | "checkout" | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  function clearQuote() { setQuote(null); setQuoteInput(null); setRequestId(null); setError(null); }
  async function getQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const input: RentalInput = { equipmentId: equipment.id, startDate: String(form.get("startDate")), endDate: String(form.get("endDate")), quantity: Number(form.get("quantity")), contactNumber: String(form.get("contactNumber")).trim(), deliveryAddress: String(form.get("deliveryAddress")).trim(), notes: String(form.get("notes") ?? "").trim() };
    if (input.endDate < input.startDate) { setError("The end date must be on or after the start date."); return; }
    setBusy("quote");
    try {
      const result = await api<Quote>("/api/bookings/quote", { method: "POST", body: JSON.stringify({ equipmentId: input.equipmentId, startDate: input.startDate, endDate: input.endDate, quantity: input.quantity }) });
      setQuote(result);
      setQuoteInput(input);
      setRequestId(crypto.randomUUID());
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(null); }
  }
  async function checkout() {
    if (!quoteInput || !requestId) return;
    setBusy("checkout");
    setError(null);
    try {
      const result = await api<{ url: string; intentId: string; sessionId: string }>("/api/bookings/checkout", { method: "POST", body: JSON.stringify({ ...quoteInput, requestId }) });
      window.location.assign(result.url);
    } catch (failure) { setError(errorMessage(failure)); setBusy(null); }
  }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="booking-dialog"><div className="dialog-heading"><span className="state-icon"><CalendarDays size={23} /></span><DialogTitle>Make time for {equipment.name}.</DialogTitle><DialogDescription>Choose your rental details. We’ll check availability and calculate your total.</DialogDescription></div>{error && <p className="form-alert" role="alert">{error}</p>}<form onSubmit={getQuote} onChange={clearQuote} className="booking-form"><div className="form-grid"><Field label="Rental start date" htmlFor="startDate"><Input type="date" id="startDate" name="startDate" min={today} required /></Field><Field label="Rental end date" htmlFor="endDate"><Input type="date" id="endDate" name="endDate" min={today} required /></Field><Field label="Quantity" htmlFor="quantity"><Input id="quantity" name="quantity" type="number" min={1} max={equipment.quantity} step={1} defaultValue={1} required /></Field><Field label="Contact number" htmlFor="contactNumber"><Input id="contactNumber" name="contactNumber" type="tel" autoComplete="tel" placeholder="Your phone number" minLength={6} maxLength={30} required /></Field></div><Field label="Delivery address" htmlFor="deliveryAddress"><Input id="deliveryAddress" name="deliveryAddress" autoComplete="street-address" placeholder="Where will you use the equipment?" minLength={5} maxLength={500} required /></Field><Field label="Additional notes" htmlFor="notes"><Textarea id="notes" name="notes" placeholder="Anything the owner should know? (optional)" maxLength={1000} rows={2} /></Field><p className="booking-policy">Both dates are included. Weekly rates cover 7 days; monthly rates cover 30 days. Each started period is billed in full.</p><Button variant="outline" className="full-width" type="submit" disabled={busy !== null}>{busy === "quote" ? <LoaderCircle className="animate-spin" size={18} /> : <CalendarDays size={18} />}Check availability & total</Button></form>{quote && <div className="booking-summary" aria-live="polite"><div><span>{quote.days} {quote.days === 1 ? "day" : "days"} · {quote.quantity} {quote.quantity === 1 ? "unit" : "units"}</span><strong>{formatMoney(quote.totalAmountCents, quote.currency)}</strong></div><p>{quote.periods} billed {quote.periods === 1 ? "period" : "periods"} · {quote.availableQuantity} units available for your dates</p><Button className="full-width" onClick={checkout} disabled={busy !== null}>{busy === "checkout" ? <LoaderCircle className="animate-spin" size={18} /> : <ShieldCheck size={18} />}Continue to secure checkout</Button><span className="field-hint">Your booking is confirmed after successful payment.</span></div>}</DialogContent></Dialog>;
}

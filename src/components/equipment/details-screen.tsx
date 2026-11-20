"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CalendarDays, Heart, Mail, MapPin, Package, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { AppUser, Equipment } from "@/lib/types";
import { categoryName, errorMessage, formatMoney } from "@/lib/utils";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { EquipmentImage } from "./equipment-image";
import { BookingDialog } from "./booking-dialog";

export function DetailsScreen({ id, user }: { id: string; user: AppUser }) {
  const result = useApi<Equipment>(`/api/equipment/${id}`);
  const [booking, setBooking] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  async function favorite() {
    setSaving(true);
    try {
      await api(`/api/favorites/${id}`, { method: saved ? "DELETE" : "PUT" });
      setSaved(!saved);
      toast.success(saved ? "Removed from your favorites." : "Saved to your favorites.");
    } catch (failure) { toast.error(errorMessage(failure)); }
    finally { setSaving(false); }
  }
  if (result.loading) return <div className="container page-section"><LoadingState label="Getting your equipment ready…" /></div>;
  if (result.error || !result.data) return <div className="container page-section"><ErrorState message={result.error ?? "Equipment could not be found."} onRetry={result.refresh} /></div>;
  const item = result.data;
  const period = item.rentalType === "daily" ? "day" : item.rentalType === "weekly" ? "7 days" : "30 days";
  return <section className="container details-section"><Link href="/equipment" className="text-link back-link"><ArrowLeft size={17} />Back to equipment</Link><div className="details-grid"><div><div className="details-image"><EquipmentImage src={item.image} alt={item.name} priority sizes="(max-width: 900px) 100vw, 60vw" /><Badge tone={item.availableQuantity > 0 ? "green" : "amber"}>{item.availableQuantity > 0 ? "Available today" : "Fully reserved today"}</Badge></div><div className="details-copy"><p className="eyebrow">About this equipment</p><h2>The details that make a difference.</h2><p>{item.description}</p><div className="spec-grid">{[{ name: "Condition", value: item.condition }, { name: "Brand", value: item.brand }, { name: "Model", value: item.model }, { name: "Total quantity", value: `${item.quantity} units` }].map((spec) => <div key={spec.name}><span>{spec.name}</span><strong>{spec.value || "Not specified"}</strong></div>)}</div><div className="terms-panel"><ShieldCheck size={24} /><div><h3>Rental terms & conditions</h3><p>{item.terms}</p></div></div></div></div><aside className="details-booking-panel"><div className="details-category"><Badge>{categoryName(item.category)}</Badge>{item.status !== "approved" && <StatusBadge status={item.status} />}</div><h1>{item.name}</h1><p className="equipment-location"><MapPin size={17} />{item.location}</p><div className="details-price"><strong>{formatMoney(item.rentalPriceCents)}</strong><span> / {period}</span></div><div className="detail-facts"><p><Package size={18} /><strong>{item.availableQuantity}</strong> units available today</p><p><CalendarDays size={18} />{item.rentalType === "daily" ? "Daily rental" : item.rentalType === "weekly" ? "Weekly rental · 7-day periods" : "Monthly rental · 30-day periods"}</p></div>{user.role === "customer" ? <><Button size="lg" className="full-width" disabled={item.status !== "approved" || item.quantity < 1} onClick={() => setBooking(true)}>Book this equipment <CalendarDays size={19} /></Button><Button variant="outline" className="full-width" disabled={saving || item.status !== "approved"} onClick={favorite}><Heart size={18} fill={saved ? "currentColor" : "none"} />{saving ? "Updating favorites…" : saved ? "Saved · remove favorite" : "Save to favorites"}</Button><p className="booking-side-note">Select your dates to see availability and your exact total before checkout.</p></> : <div className="role-notice"><ShieldCheck size={20} /><p>You’re viewing this listing as an {user.role}. Booking and favorites are available to customers.</p></div>}<div className="owner-card"><span className="owner-avatar"><UserRound size={24} /></span><div><p>Listed by</p><strong>{item.owner?.name ?? "Equipment owner"}</strong>{item.owner?.email && <a href={`mailto:${item.owner.email}`}><Mail size={13} />Contact owner</a>}</div></div></aside></div><BookingDialog equipment={item} open={booking} onOpenChange={setBooking} /></section>;
}

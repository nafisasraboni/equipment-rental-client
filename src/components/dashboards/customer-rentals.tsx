"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import type { Booking, Paginated } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/utils";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState, ErrorState, LoadingState, TableWrap } from "@/components/ui/states";
import { EquipmentImage } from "@/components/equipment/equipment-image";

export function CustomerRentals() {
  const [page, setPage] = useState(1);
  const result = useApi<Paginated<Booking>>(`/api/customer/bookings?page=${page}&limit=10`);
  return <div className="dashboard-page"><div className="page-heading"><div><p className="eyebrow">Good gear. Your plans.</p><h1>My rentals.</h1><p>Everything you’ve booked, with the details that matter.</p></div><Button asChild><Link href="/equipment">Find your next rental <CalendarDays size={17} /></Link></Button></div>{result.loading ? <LoadingState label="Loading your rentals…" /> : result.error ? <ErrorState message={result.error} onRetry={result.refresh} /> : !result.data?.items.length ? <EmptyState title="Your next rental starts here" description="Explore equipment and complete checkout. Your confirmed rentals will appear here." action={<Button asChild><Link href="/equipment">Explore equipment</Link></Button>} /> : <><div className="panel"><div className="panel-header"><h2>Rental history</h2><span className="table-subtext">{result.data.total} bookings</span></div><TableWrap><table className="data-table"><thead><tr><th>Equipment</th><th>Rental dates</th><th>Booked on</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead><tbody>{result.data.items.map((booking) => <tr key={booking.id}><td><Link href={`/equipment/${booking.equipmentId}`} className="table-equipment"><span className="table-thumb"><EquipmentImage src={booking.equipment.image} alt={booking.equipment.name} sizes="43px" /></span><div><strong>{booking.equipment.name}</strong><p>{booking.quantity} {booking.quantity === 1 ? "unit" : "units"} · {booking.durationDays} days</p></div></Link></td><td className="table-date">{formatDate(booking.startDate)}<br /><span className="table-subtext">to {formatDate(booking.endDate)}</span></td><td className="table-date">{formatDate(booking.createdAt)}</td><td><strong>{formatMoney(booking.amountCents, booking.currency)}</strong></td><td><StatusBadge status={booking.paymentStatus} /></td><td><StatusBadge status={booking.status} /></td></tr>)}</tbody></table></TableWrap></div><div className="pagination"><Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}><ArrowLeft size={16} />Previous</Button><span>Page {page} of {result.data.totalPages}</span><Button variant="outline" disabled={page >= result.data.totalPages} onClick={() => setPage(page + 1)}>Next<ArrowRight size={16} /></Button></div></>}</div>;
}

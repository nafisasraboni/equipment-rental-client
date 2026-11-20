"use client";

import { useState } from "react";
import { CheckCircle2, Eye, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Booking, Paginated } from "@/lib/types";
import { errorMessage, formatDate, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, ErrorState, LoadingState, TableWrap } from "@/components/ui/states";
import { useApi } from "@/hooks/use-api";
import { DashboardPagination } from "./dashboard-pagination";

function todayInDhaka() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((value) => value.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function RentalsTable({ admin = false }: { admin?: boolean }) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const { data, error, loading, refresh: reload } = useApi<Paginated<Booking>>(`/api/${admin ? "admin" : "owner"}/bookings?page=${page}&limit=10`);
  const today = todayInDhaka();

  async function complete(booking: Booking) {
    if (busy) return;
    setBusy(booking.id);
    try {
      await api<Booking>(`/api/admin/bookings/${booking.id}`, { method: "PATCH", body: JSON.stringify({ status: "completed" }) });
      toast.success("Rental marked as completed."); reload();
    } catch (failure) { toast.error(errorMessage(failure)); }
    finally { setBusy(null); }
  }

  return <div className="dashboard-page">
    <div className="page-heading"><div><span className="eyebrow">From booking to return</span><h1>{admin ? "All rentals" : "My equipment rentals"}</h1><p>{admin ? "Monitor paid rentals across the marketplace and complete finished bookings." : "Everything you need to know about rentals for your equipment."}</p></div></div>
    <section className="panel">{loading ? <LoadingState label="Loading rental bookings…" /> : error || !data ? <ErrorState message={error ?? "Rental bookings could not be loaded."} onRetry={reload} /> : data.items.length === 0 ? <EmptyState title={admin ? "No rentals yet" : "Your next rental is on its way"} description={admin ? "Verified paid bookings will appear here." : "Customer bookings for your equipment will appear here after payment."} /> : <>
      <TableWrap><table className="data-table"><thead><tr><th>Customer</th>{admin && <th>Owner</th>}<th>Equipment</th><th>Rental duration</th><th>Quantity</th><th>Amount</th><th>Payment</th><th>Booking status</th><th>Actions</th></tr></thead><tbody>{data.items.map((booking) => <tr key={booking.id}>
        <td><strong>{booking.customer.name}</strong><span className="cell-secondary">{booking.customer.email}</span></td>{admin && <td><strong>{booking.owner.name}</strong><span className="cell-secondary">{booking.owner.email}</span></td>}<td><strong>{booking.equipment.name}</strong><span className="cell-secondary">Booked {formatDate(booking.createdAt)}</span></td><td>{formatDate(booking.startDate)}<span className="cell-secondary">to {formatDate(booking.endDate)} · {booking.durationDays} {booking.durationDays === 1 ? "day" : "days"}</span></td><td>{booking.quantity}</td><td>{formatMoney(booking.amountCents, booking.currency)}</td><td><StatusBadge status={booking.paymentStatus} /></td><td><StatusBadge status={booking.status} /></td><td><div className="table-actions"><Button size="sm" variant="ghost" onClick={() => setSelected(booking)} aria-label={`Details for ${booking.equipment.name} rental`}><Eye size={16} /> Details</Button>{admin && booking.status === "confirmed" && <Button size="sm" variant="outline" disabled={busy !== null || booking.endDate >= today} title={booking.endDate >= today ? "A rental can be completed after its end date." : "Mark rental as completed"} onClick={() => complete(booking)}>{busy === booking.id ? <LoaderCircle className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Complete</Button>}</div></td>
      </tr>)}</tbody></table></TableWrap><DashboardPagination data={data} onPageChange={setPage} />
    </>}
    </section>
    <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}><DialogContent><DialogTitle>Rental details</DialogTitle><DialogDescription>{selected?.equipment.name}</DialogDescription>{selected && <dl className="rental-summary"><div><dt>Customer</dt><dd>{selected.customer.name}<span>{selected.customer.email}</span></dd></div><div><dt>Contact number</dt><dd>{selected.contactNumber}</dd></div><div><dt>Delivery address</dt><dd>{selected.deliveryAddress}</dd></div><div><dt>Rental dates</dt><dd>{formatDate(selected.startDate)} – {formatDate(selected.endDate)}</dd></div><div><dt>Quantity</dt><dd>{selected.quantity}</dd></div><div><dt>Total paid</dt><dd>{formatMoney(selected.amountCents, selected.currency)}</dd></div><div><dt>Booking status</dt><dd><StatusBadge status={selected.status} /></dd></div><div><dt>Additional notes</dt><dd>{selected.notes || "No additional notes."}</dd></div></dl>}</DialogContent></Dialog>
  </div>;
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, LoaderCircle, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Equipment, EquipmentStatus, Paginated } from "@/lib/types";
import { categoryName, errorMessage, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Field, Select, Textarea } from "@/components/ui/field";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, ErrorState, LoadingState, TableWrap } from "@/components/ui/states";
import { useApi } from "@/hooks/use-api";
import { DashboardPagination } from "./dashboard-pagination";
import { EquipmentEditor } from "./equipment-editor";

export function AdminEquipment() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [rejecting, setRejecting] = useState<Equipment | null>(null);
  const [deleting, setDeleting] = useState<Equipment | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const { data, error, loading, refresh: reload } = useApi<Paginated<Equipment>>(`/api/admin/equipment?page=${page}&limit=10${status === "all" ? "" : `&status=${status}`}`);

  async function changeStatus(item: Equipment, nextStatus: EquipmentStatus, rejectionReason?: string) {
    if (busy) return;
    setBusy(item.id);
    try {
      await api<Equipment>(`/api/admin/equipment/${item.id}/status`, { method: "PATCH", body: JSON.stringify({ status: nextStatus, ...(rejectionReason ? { rejectionReason } : {}) }) });
      toast.success(nextStatus === "approved" ? "Equipment approved and available to customers." : "Equipment rejected.");
      setRejecting(null);
      if (data?.items.length === 1 && page > 1 && status !== "all") setPage(page - 1); else reload();
    } catch (failure) { toast.error(errorMessage(failure)); }
    finally { setBusy(null); }
  }

  async function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rejecting) return;
    const value = new FormData(event.currentTarget).get("reason");
    await changeStatus(rejecting, "rejected", typeof value === "string" ? value.trim() : undefined);
  }

  async function remove() {
    if (!deleting || busy) return;
    setBusy(deleting.id);
    try {
      await api<{ id: string }>(`/api/equipment/${deleting.id}`, { method: "DELETE" });
      toast.success("Equipment listing deleted."); setDeleting(null);
      if (data?.items.length === 1 && page > 1) setPage(page - 1); else reload();
    } catch (failure) { toast.error(errorMessage(failure)); }
    finally { setBusy(null); }
  }

  return <div className="dashboard-page">
    <div className="page-heading"><div><span className="eyebrow">A marketplace worth trusting</span><h1>All equipment</h1><p>Review listings and keep the rental collection reliable.</p></div></div>
    <section className="panel"><div className="filter-row"><Field label="Listing status" htmlFor="admin-equipment-status"><Select id="admin-equipment-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">All statuses</option><option value="pending">Pending review</option><option value="approved">Approved</option><option value="rejected">Rejected</option></Select></Field></div>
      {loading ? <LoadingState label="Loading equipment listings…" /> : error || !data ? <ErrorState message={error ?? "Equipment listings could not be loaded."} onRetry={reload} /> : data.items.length === 0 ? <EmptyState title="No listings in this view" description="Choose another status or check back when owners submit equipment." /> : <>
        <TableWrap><table className="data-table"><thead><tr><th>Equipment</th><th>Owner</th><th>Rental rate</th><th>Units</th><th>Status</th><th>Actions</th></tr></thead><tbody>{data.items.map((item) => <tr key={item.id}>
          <td><div className="table-item"><Image className="table-thumbnail" src={item.image} alt="" width={48} height={48} unoptimized /><div><strong>{item.name}</strong><span>{categoryName(item.category)} · {item.location}</span></div></div></td>
          <td><strong>{item.owner?.name ?? "Equipment owner"}</strong><span className="cell-secondary">{item.owner?.email}</span></td><td><strong>{formatMoney(item.rentalPriceCents)}</strong><span className="cell-secondary">per {item.rentalType === "daily" ? "day" : item.rentalType === "weekly" ? "7 days" : "30 days"}</span></td><td>{item.availableQuantity} / {item.quantity}</td><td><StatusBadge status={item.status} />{item.rejectionReason && <span className="cell-secondary">{item.rejectionReason}</span>}</td>
          <td><div className="table-actions">{item.status !== "approved" && <Button variant="outline" size="sm" disabled={busy !== null} onClick={() => changeStatus(item, "approved")} aria-label={`Approve ${item.name}`}><Check size={15} /> Approve</Button>}{item.status !== "rejected" && <Button variant="ghost" size="sm" disabled={busy !== null} onClick={() => setRejecting(item)} aria-label={`Reject ${item.name}`}><X size={15} /> Reject</Button>}<Button variant="ghost" size="sm" disabled={busy !== null} onClick={() => setEditing(item)} aria-label={`Edit ${item.name}`}><Pencil size={16} /></Button><Button asChild variant="ghost" size="sm"><Link href={`/equipment/${item.id}`} aria-label={`View ${item.name}`}><ArrowUpRight size={16} /></Link></Button><Button variant="ghost" size="sm" disabled={busy !== null} onClick={() => setDeleting(item)} aria-label={`Delete ${item.name}`}><Trash2 size={16} /></Button></div></td>
        </tr>)}</tbody></table></TableWrap><DashboardPagination data={data} onPageChange={setPage} />
      </>}
    </section>
    <Dialog open={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null); }}><DialogContent className="dialog-large"><DialogTitle>Update equipment</DialogTitle><DialogDescription>Keep the equipment information and rental terms accurate.</DialogDescription>{editing && <EquipmentEditor key={editing.id} equipment={editing} admin onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}</DialogContent></Dialog>
    <Dialog open={rejecting !== null} onOpenChange={(open) => { if (!open && !busy) setRejecting(null); }}><DialogContent><DialogTitle>Reject this listing?</DialogTitle><DialogDescription>Help the owner understand what needs attention in {rejecting?.name}.</DialogDescription><form onSubmit={reject}><Field label="Reason (optional)" htmlFor="equipment-rejection-reason"><Textarea id="equipment-rejection-reason" name="reason" maxLength={500} rows={4} placeholder="Explain what should be improved…" /></Field><div className="form-actions"><Button type="button" variant="outline" disabled={busy !== null} onClick={() => setRejecting(null)}>Cancel</Button><Button type="submit" variant="destructive" disabled={busy !== null}>{busy && <LoaderCircle className="animate-spin" size={17} />}Reject listing</Button></div></form></DialogContent></Dialog>
    <Dialog open={deleting !== null} onOpenChange={(open) => { if (!open && !busy) setDeleting(null); }}><DialogContent><DialogTitle>Delete this listing?</DialogTitle><DialogDescription>{deleting?.name} will stop accepting new rentals. Existing rental history remains available.</DialogDescription><div className="form-actions"><Button variant="outline" disabled={busy !== null} onClick={() => setDeleting(null)}>Keep listing</Button><Button variant="destructive" disabled={busy !== null} onClick={remove}>{busy && <LoaderCircle className="animate-spin" size={17} />}Delete equipment</Button></div></DialogContent></Dialog>
  </div>;
}

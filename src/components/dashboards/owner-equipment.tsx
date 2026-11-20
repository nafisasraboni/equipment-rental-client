"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Equipment, Paginated } from "@/lib/types";
import { categoryName, errorMessage, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, ErrorState, LoadingState, TableWrap } from "@/components/ui/states";
import { useApi } from "@/hooks/use-api";
import { DashboardPagination } from "./dashboard-pagination";
import { EquipmentEditor } from "./equipment-editor";

export function OwnerEquipment() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [deleting, setDeleting] = useState<Equipment | null>(null);
  const [busy, setBusy] = useState(false);
  const { data, error, loading, refresh: reload } = useApi<Paginated<Equipment>>(`/api/owner/equipment?page=${page}&limit=10`);

  async function remove() {
    if (!deleting || busy) return;
    setBusy(true);
    try {
      await api<{ id: string }>(`/api/equipment/${deleting.id}`, { method: "DELETE" });
      toast.success("Equipment listing deleted.");
      setDeleting(null);
      if (data?.items.length === 1 && page > 1) setPage(page - 1); else reload();
    } catch (failure) { toast.error(errorMessage(failure)); }
    finally { setBusy(false); }
  }

  return <div className="dashboard-page">
    <div className="page-heading"><div><span className="eyebrow">Your rental collection</span><h1>My equipment</h1><p>Keep your listings useful, accurate, and ready for their next rental.</p></div><Button asChild><Link href="/dashboard/owner/equipment/new"><Plus size={18} /> Add equipment</Link></Button></div>
    <section className="panel">
      {loading ? <LoadingState label="Loading your equipment…" /> : error || !data ? <ErrorState message={error ?? "Your equipment could not be loaded."} onRetry={reload} /> : data.items.length === 0 ? <EmptyState title="Something useful deserves another outing" description="List your equipment and give customers a reason to choose you." action={<Button asChild><Link href="/dashboard/owner/equipment/new">List your first equipment</Link></Button>} /> : <>
        <TableWrap><table className="data-table"><thead><tr><th>Equipment</th><th>Category</th><th>Rental rate</th><th>Available units</th><th>Status</th><th>Actions</th></tr></thead><tbody>{data.items.map((item) => <tr key={item.id}>
          <td><div className="table-item"><Image className="table-thumbnail" src={item.image} alt="" width={48} height={48} unoptimized /><div><strong>{item.name}</strong><span>{item.location}</span></div></div></td>
          <td>{categoryName(item.category)}</td><td><strong>{formatMoney(item.rentalPriceCents)}</strong><span className="cell-secondary">per {item.rentalType === "daily" ? "day" : item.rentalType === "weekly" ? "7 days" : "30 days"}</span></td><td>{item.availableQuantity} / {item.quantity}</td><td><StatusBadge status={item.status} />{item.rejectionReason && <span className="cell-secondary">{item.rejectionReason}</span>}</td>
          <td><div className="table-actions"><Button variant="outline" size="sm" onClick={() => setEditing(item)} aria-label={`Edit ${item.name}`}><Pencil size={15} /> Edit</Button><Button asChild variant="ghost" size="sm"><Link href={`/equipment/${item.id}`} aria-label={`View ${item.name}`}><ArrowUpRight size={16} /> View</Link></Button><Button variant="ghost" size="sm" onClick={() => setDeleting(item)} aria-label={`Delete ${item.name}`}><Trash2 size={16} /></Button></div></td>
        </tr>)}</tbody></table></TableWrap><DashboardPagination data={data} onPageChange={setPage} />
      </>}
    </section>
    <Dialog open={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null); }}><DialogContent className="dialog-large"><DialogTitle>Edit equipment</DialogTitle><DialogDescription>Owner edits return the listing to pending review.</DialogDescription>{editing && <EquipmentEditor key={editing.id} equipment={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}</DialogContent></Dialog>
    <Dialog open={deleting !== null} onOpenChange={(open) => { if (!open && !busy) setDeleting(null); }}><DialogContent><DialogTitle>Delete this listing?</DialogTitle><DialogDescription>{deleting?.name} will stop accepting new rentals. Existing rental history remains available.</DialogDescription><div className="form-actions"><Button variant="outline" disabled={busy} onClick={() => setDeleting(null)}>Keep listing</Button><Button variant="destructive" disabled={busy} onClick={remove}>{busy && <LoaderCircle className="animate-spin" size={17} />}Delete equipment</Button></div></DialogContent></Dialog>
  </div>;
}

export function NewOwnerEquipment() {
  const router = useRouter();
  return <div className="dashboard-page"><div className="page-heading"><div><span className="eyebrow">Give good equipment another purpose</span><h1>Add equipment</h1><p>Share the details customers need to rent with confidence.</p></div><Button asChild variant="outline"><Link href="/dashboard/owner/equipment">Back to my equipment</Link></Button></div><section className="panel"><EquipmentEditor onSaved={() => router.push("/dashboard/owner/equipment")} /></section></div>;
}

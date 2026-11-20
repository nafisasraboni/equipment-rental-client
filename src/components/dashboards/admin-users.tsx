"use client";

import Image from "next/image";
import { useState } from "react";
import { ShieldCheck, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { AppUser, Paginated } from "@/lib/types";
import { errorMessage, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Select } from "@/components/ui/field";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, ErrorState, LoadingState, TableWrap } from "@/components/ui/states";
import { useApi } from "@/hooks/use-api";
import { DashboardPagination } from "./dashboard-pagination";

export function AdminUsers({ currentUserId }: { currentUserId: string }) {
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState<string | null>(null);
  const [suspending, setSuspending] = useState<AppUser | null>(null);
  const { data, error, loading, refresh: reload } = useApi<Paginated<AppUser>>(`/api/admin/users?page=${page}&limit=10`);

  async function updateUser(user: AppUser, changes: Partial<Pick<AppUser, "role" | "status">>) {
    if (busy) return;
    setBusy(user.id);
    try {
      await api<AppUser>(`/api/admin/users/${user.id}`, { method: "PATCH", body: JSON.stringify(changes) });
      toast.success(changes.role ? `${user.name}’s role is now ${changes.role}.` : changes.status === "active" ? "Account reactivated." : "Account suspended.");
      setSuspending(null); reload();
    } catch (failure) { toast.error(errorMessage(failure)); }
    finally { setBusy(null); }
  }

  return <div className="dashboard-page">
    <div className="page-heading"><div><span className="eyebrow">People make the marketplace</span><h1>All users</h1><p>Assign the right roles and manage account access.</p></div><span className="management-note"><ShieldCheck size={18} /> Elevated roles are assigned here</span></div>
    <section className="panel">{loading ? <LoadingState label="Loading marketplace accounts…" /> : error || !data ? <ErrorState message={error ?? "User accounts could not be loaded."} onRetry={reload} /> : data.items.length === 0 ? <EmptyState title="No accounts to display" description="Registered marketplace users will appear here." /> : <>
      <TableWrap><table className="data-table"><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Registered</th><th>Status</th><th>Account access</th></tr></thead><tbody>{data.items.map((user) => <tr key={user.id}>
        <td><div className="table-item">{user.image ? <Image className="table-avatar" src={user.image} alt="" width={40} height={40} unoptimized /> : <span className="table-avatar avatar-initial">{user.name.charAt(0).toUpperCase()}</span>}<div><strong>{user.name}</strong>{user.id === currentUserId && <span>Your account</span>}</div></div></td><td>{user.email}</td>
        <td><Select aria-label={`Role for ${user.name}`} value={user.role} disabled={busy !== null || user.id === currentUserId} onChange={(event) => { const role = event.target.value; if (role === "customer" || role === "owner" || role === "admin") void updateUser(user, { role }); }}><option value="customer">Customer</option><option value="owner">Owner</option><option value="admin">Admin</option></Select></td><td>{formatDate(user.createdAt)}</td><td><StatusBadge status={user.status} /></td><td>{user.status === "suspended" ? <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => updateUser(user, { status: "active" })}><UserCheck size={16} /> Reactivate</Button> : <Button size="sm" variant="ghost" disabled={busy !== null || user.id === currentUserId} onClick={() => setSuspending(user)}><UserX size={16} /> Suspend</Button>}</td>
      </tr>)}</tbody></table></TableWrap><DashboardPagination data={data} onPageChange={setPage} />
    </>}
    </section>
    <Dialog open={suspending !== null} onOpenChange={(open) => { if (!open && !busy) setSuspending(null); }}><DialogContent><DialogTitle>Suspend this account?</DialogTitle><DialogDescription>{suspending?.name} will lose access to protected marketplace features. Their rental records will remain available.</DialogDescription><div className="form-actions"><Button variant="outline" disabled={busy !== null} onClick={() => setSuspending(null)}>Cancel</Button><Button variant="destructive" disabled={busy !== null} onClick={() => { if (suspending) void updateUser(suspending, { status: "suspended" }); }}>Suspend account</Button></div></DialogContent></Dialog>
  </div>;
}

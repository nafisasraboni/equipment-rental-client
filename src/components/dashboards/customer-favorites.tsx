"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Favorite, Paginated } from "@/lib/types";
import { categoryName, errorMessage, formatMoney } from "@/lib/utils";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState, LoadingState, TableWrap } from "@/components/ui/states";
import { EquipmentImage } from "@/components/equipment/equipment-image";

export function CustomerFavorites() {
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState<string | null>(null);
  const result = useApi<Paginated<Favorite>>(`/api/favorites?page=${page}&limit=10`);
  async function remove(id: string) {
    setRemoving(id);
    try {
      await api(`/api/favorites/${id}`, { method: "DELETE" });
      toast.success("Removed from your favorites.");
      if (result.data?.items.length === 1 && page > 1) setPage(page - 1);
      else result.refresh();
    } catch (failure) { toast.error(errorMessage(failure)); }
    finally { setRemoving(null); }
  }
  return <div className="dashboard-page"><div className="page-heading"><div><p className="eyebrow">A little inspiration, saved</p><h1>Your favorites.</h1><p>Keep great gear close for your next idea.</p></div><Button asChild variant="outline"><Link href="/equipment">Explore equipment <Heart size={17} /></Link></Button></div>{result.loading ? <LoadingState label="Finding your saved gear…" /> : result.error ? <ErrorState message={result.error} onRetry={result.refresh} /> : !result.data?.items.length ? <EmptyState title="Save something worth coming back to" description="Tap Save to favorites on an equipment page. Your saved listings will appear here." action={<Button asChild><Link href="/equipment">Find your favorite gear</Link></Button>} /> : <><div className="panel"><div className="panel-header"><h2>Saved equipment</h2><span className="table-subtext">{result.data.total} favorites</span></div><TableWrap><table className="data-table"><thead><tr><th>Equipment</th><th>Category</th><th>Rental price</th><th>Availability</th><th>Actions</th></tr></thead><tbody>{result.data.items.map((favorite) => <tr key={favorite.id}><td>{favorite.equipment ? <div className="table-equipment"><span className="table-thumb"><EquipmentImage src={favorite.equipment.image} alt={favorite.equipment.name} sizes="43px" /></span><div><strong>{favorite.equipment.name}</strong><p>{favorite.equipment.location}</p></div></div> : <div><strong>Listing no longer available</strong><p className="table-subtext">The owner may have removed this equipment.</p></div>}</td><td>{favorite.equipment ? categoryName(favorite.equipment.category) : "—"}</td><td>{favorite.equipment ? <><strong>{formatMoney(favorite.equipment.rentalPriceCents)}</strong><p className="table-subtext">{favorite.equipment.rentalType}</p></> : "—"}</td><td><Badge tone={favorite.equipment && favorite.equipment.availableQuantity > 0 ? "green" : "neutral"}>{favorite.equipment && favorite.equipment.availableQuantity > 0 ? "Available" : "Unavailable"}</Badge></td><td><div className="table-actions">{favorite.equipment && <Button asChild variant="outline" size="sm"><Link href={`/equipment/${favorite.equipmentId}`}>View details<ArrowUpRight size={14} /></Link></Button>}<Button variant="destructive" size="sm" disabled={removing !== null} onClick={() => remove(favorite.equipmentId)} aria-label="Remove favorite"><Trash2 size={14} />{removing === favorite.equipmentId ? "Removing…" : "Remove"}</Button></div></td></tr>)}</tbody></table></TableWrap></div><div className="pagination"><Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}><ArrowLeft size={16} />Previous</Button><span>Page {page} of {result.data.totalPages}</span><Button variant="outline" disabled={page >= result.data.totalPages} onClick={() => setPage(page + 1)}>Next<ArrowRight size={16} /></Button></div></>}</div>;
}

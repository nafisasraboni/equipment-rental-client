"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Paginated } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function DashboardPagination({ data, onPageChange }: { data: Pick<Paginated<unknown>, "page" | "limit" | "total" | "totalPages">; onPageChange: (page: number) => void }) {
  const first = data.total === 0 ? 0 : (data.page - 1) * data.limit + 1;
  const last = Math.min(data.page * data.limit, data.total);
  return <div className="pagination dashboard-pagination">
    <span className="text-muted">Showing {first}–{last} of {data.total}</span>
    {data.totalPages > 1 && <div className="pagination-buttons">
      <Button variant="outline" size="sm" disabled={data.page <= 1} onClick={() => onPageChange(data.page - 1)} aria-label="Previous page"><ChevronLeft size={16} /> Previous</Button>
      <span aria-live="polite">{data.page} / {data.totalPages}</span>
      <Button variant="outline" size="sm" disabled={data.page >= data.totalPages} onClick={() => onPageChange(data.page + 1)} aria-label="Next page">Next <ChevronRight size={16} /></Button>
    </div>}
  </div>;
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";
import type { FormEvent } from "react";
import type { Equipment, Paginated } from "@/lib/types";
import { categories } from "@/lib/utils";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { SkeletonCards } from "@/components/site/home-screen";
import { EquipmentCard } from "./equipment-card";

export function CatalogScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.toString();
  const result = useApi<Paginated<Equipment>>(`/api/equipment?${query}${query ? "&" : ""}limit=9`, false);
  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    if (!("page" in changes)) next.delete("page");
    router.push(`/equipment${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
  }
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    update({ search: String(data.get("search") ?? "").trim() });
  }
  function filters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    update(Object.fromEntries(["category", "rentalType", "minPrice", "maxPrice", "availability"].map((key) => [key, String(data.get(key) ?? "")])));
  }
  const activeFilters = ["search", "category", "rentalType", "minPrice", "maxPrice", "availability"].filter((key) => params.get(key));
  return <><section className="catalog-heading"><div className="container"><p className="eyebrow">Equipment for whatever comes next</p><h1>Find the right gear.<br /><em>Make it your own moment.</em></h1><form className="catalog-search" onSubmit={search} key={params.get("search") ?? ""}><Search size={22} /><label htmlFor="catalog-search" className="sr-only">Search equipment name, category or location</label><input name="search" id="catalog-search" defaultValue={params.get("search") ?? ""} placeholder="Search equipment, category or location" /><Button type="submit">Search <ArrowRight size={17} /></Button></form></div></section><section className="container catalog-layout"><aside className="catalog-sidebar"><div className="filter-heading"><h2><SlidersHorizontal size={18} />Refine your search</h2>{activeFilters.length > 0 && <Link href="/equipment" className="text-link small">Clear</Link>}</div><form onSubmit={filters} key={`filters-${query}`} className="filter-form"><Field label="Category" htmlFor="category"><Select id="category" name="category" defaultValue={params.get("category") ?? ""}><option value="">All categories</option>{categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</Select></Field><Field label="Rental period" htmlFor="rentalType"><Select id="rentalType" name="rentalType" defaultValue={params.get("rentalType") ?? ""}><option value="">Any period</option><option value="daily">Daily</option><option value="weekly">Weekly · 7 days</option><option value="monthly">Monthly · 30 days</option></Select></Field><div className="field"><label>Price per rental period (USD)</label><div className="price-fields"><Input aria-label="Minimum price" name="minPrice" type="number" min="0" step="0.01" placeholder="Min" defaultValue={params.get("minPrice") ?? ""} /><span>—</span><Input aria-label="Maximum price" name="maxPrice" type="number" min="0" step="0.01" placeholder="Max" defaultValue={params.get("maxPrice") ?? ""} /></div></div><Field label="Availability today" htmlFor="availability"><Select id="availability" name="availability" defaultValue={params.get("availability") ?? ""}><option value="">All equipment</option><option value="available">Available</option><option value="unavailable">Unavailable</option></Select></Field><Button type="submit" className="full-width">Apply filters</Button></form><div className="filter-note"><span className="availability-dot" /><p>Planning ahead? Select your dates on an equipment page to check rental availability.</p></div></aside><div className="catalog-results"><div className="catalog-toolbar"><p>{result.loading ? "Finding your gear…" : <><strong>{result.data?.total ?? 0}</strong> equipment {result.data?.total === 1 ? "listing" : "listings"}</>}</p><div className="sort-field"><label htmlFor="sort">Sort by</label><Select id="sort" value={params.get("sort") ?? "recent"} onChange={(event) => update({ sort: event.target.value })}><option value="recent">Recently added</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></Select></div></div>{activeFilters.length > 0 && <div className="active-filters">{activeFilters.map((key) => <button key={key} onClick={() => update({ [key]: "" })} aria-label={`Remove ${key} filter`}>{key === "category" ? categories.find((category) => category.value === params.get(key))?.label ?? params.get(key) : `${key.replace(/([A-Z])/g, " $1")}: ${params.get(key)}`}<X size={13} /></button>)}</div>}{result.loading ? <SkeletonCards count={6} /> : result.error ? <ErrorState message={result.error} onRetry={result.refresh} /> : result.data?.items.length ? <><div className="equipment-grid">{result.data.items.map((item) => <EquipmentCard item={item} key={item.id} />)}</div><div className="pagination"><Button variant="outline" disabled={result.data.page <= 1} onClick={() => update({ page: String(result.data!.page - 1) })}><ArrowLeft size={16} />Previous</Button><span>Page {result.data.page} of {result.data.totalPages}</span><Button variant="outline" disabled={result.data.page >= result.data.totalPages} onClick={() => update({ page: String(result.data!.page + 1) })}>Next<ArrowRight size={16} /></Button></div></> : <EmptyState title="No gear matches just yet" description="Try another search or adjust the filters to discover more equipment." action={<Button asChild variant="outline"><Link href="/equipment">Clear all filters</Link></Button>} />}</div></section></>;
}

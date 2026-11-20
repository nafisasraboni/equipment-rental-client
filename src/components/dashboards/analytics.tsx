"use client";

import { BarChart3, CheckCircle2, CircleDollarSign, Clock3, Package, Users, type LucideIcon } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AdminAnalytics, OwnerAnalytics } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { useApi } from "@/hooks/use-api";

interface Metric { label: string; value: string | number; icon: LucideIcon; detail: string }
interface MonthlyPoint { month: string; bookings: number; amountCents: number }

function monthLabel(month: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));
}

function AnalyticsPanel({ title, description, metrics, points, revenueLabel }: { title: string; description: string; metrics: Metric[]; points: MonthlyPoint[]; revenueLabel: string }) {
  const hasActivity = points.some((point) => point.bookings > 0 || point.amountCents > 0);
  return <div className="dashboard-page">
    <div className="page-heading"><div><span className="eyebrow">At a glance</span><h1>{title}</h1><p>{description}</p></div></div>
    <div className="stat-grid">{metrics.map(({ label, value, icon: Icon, detail }) => <div className="stat-card" key={label}><div className="stat-card-heading"><span>{label}</span><span className="stat-icon"><Icon size={20} /></span></div><strong>{value}</strong><p>{detail}</p></div>)}</div>
    <div className="analytics-grid">
      <section className="panel"><div className="panel-header"><div><h2>{revenueLabel}</h2><p>Monthly totals from verified payments.</p></div><CircleDollarSign size={22} /></div>
        {hasActivity ? <div className="analytics-chart" role="img" aria-label={`Monthly ${revenueLabel.toLowerCase()} chart`}><ResponsiveContainer width="100%" height="100%"><AreaChart data={points} margin={{ top: 20, right: 14, left: 0, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fontSize: 11 }} minTickGap={25} /><YAxis tickFormatter={(value: number) => `$${value / 100}`} tick={{ fontSize: 11 }} width={65} /><Tooltip labelFormatter={(value) => monthLabel(String(value))} formatter={(value) => [formatMoney(Number(value)), revenueLabel]} /><Area type="monotone" dataKey="amountCents" stroke="var(--primary)" fill="var(--cream)" strokeWidth={3} /></AreaChart></ResponsiveContainer></div> : <EmptyState title="Your first payment starts the story" description="Verified rental payments will appear in this chart." />}
      </section>
      <section className="panel"><div className="panel-header"><div><h2>Monthly bookings</h2><p>See how rental activity changes over time.</p></div><BarChart3 size={22} /></div>
        {hasActivity ? <div className="analytics-chart" role="img" aria-label="Monthly booking count chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={points} margin={{ top: 20, right: 14, left: 0, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fontSize: 11 }} minTickGap={25} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={35} /><Tooltip labelFormatter={(value) => monthLabel(String(value))} formatter={(value) => [Number(value), "Bookings"]} /><Bar dataKey="bookings" fill="var(--accent)" radius={[5, 5, 0, 0]} maxBarSize={32} /></BarChart></ResponsiveContainer></div> : <EmptyState title="Room for your next milestone" description="Confirmed rental bookings will appear here." />}
      </section>
    </div>
  </div>;
}

export function OwnerAnalyticsDashboard() {
  const { data, error, loading, refresh: reload } = useApi<OwnerAnalytics>("/api/owner/analytics");
  if (loading) return <LoadingState label="Loading your rental business…" />;
  if (error || !data) return <ErrorState message={error ?? "Your analytics could not be loaded."} onRetry={reload} />;
  return <AnalyticsPanel title="Your business, growing." description="A clear view of your equipment and paid rental activity." revenueLabel="Gross rental earnings" metrics={[
    { label: "Listed equipment", value: data.totalEquipment, icon: Package, detail: "Your current equipment listings" },
    { label: "Rental bookings", value: data.totalBookings, icon: BarChart3, detail: "Bookings for your equipment" },
    { label: "Completed rentals", value: data.completedRentals, icon: CheckCircle2, detail: "Rentals marked as completed" },
    { label: "Total earnings", value: formatMoney(data.totalEarningsCents), icon: CircleDollarSign, detail: "Gross verified rental payments" },
  ]} points={data.monthlyEarnings.map((point) => ({ month: point.month, bookings: point.bookings, amountCents: point.earningsCents }))} />;
}

export function AdminAnalyticsDashboard() {
  const { data, error, loading, refresh: reload } = useApi<AdminAnalytics>("/api/admin/analytics");
  if (loading) return <LoadingState label="Loading platform performance…" />;
  if (error || !data) return <ErrorState message={error ?? "Platform analytics could not be loaded."} onRetry={reload} />;
  return <AnalyticsPanel title="The bigger picture." description="Live marketplace performance from users, equipment, bookings, and payments." revenueLabel="Platform rental revenue" metrics={[
    { label: "Registered users", value: data.totalUsers, icon: Users, detail: "All marketplace accounts" },
    { label: "Equipment listings", value: data.totalEquipment, icon: Package, detail: "Current marketplace equipment" },
    { label: "Total bookings", value: data.totalBookings, icon: BarChart3, detail: "Verified paid rental bookings" },
    { label: "Pending approvals", value: data.pendingApprovals, icon: Clock3, detail: "Equipment waiting for review" },
    { label: "Completed rentals", value: data.completedRentals, icon: CheckCircle2, detail: "Completed rental activity" },
    { label: "Total revenue", value: formatMoney(data.totalRevenueCents), icon: CircleDollarSign, detail: "Gross verified rental payments" },
  ]} points={data.monthlyBookings.map((point) => ({ month: point.month, bookings: point.bookings, amountCents: point.revenueCents }))} />;
}

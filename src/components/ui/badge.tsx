import { cn } from "@/lib/utils";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "red" }) {
  return <span className={cn("badge", `badge-${tone}`)}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const positive = ["approved", "paid", "completed", "active", "confirmed"];
  const negative = ["rejected", "suspended", "failed", "cancelled"];
  return <Badge tone={positive.includes(status) ? "green" : negative.includes(status) ? "red" : "amber"}>{status.replaceAll("_", " ")}</Badge>;
}

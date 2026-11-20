"use client";

import { ErrorState } from "@/components/ui/states";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="dashboard-page"><ErrorState message="Your workspace couldn’t be loaded. Please try again." onRetry={reset} /></div>;
}

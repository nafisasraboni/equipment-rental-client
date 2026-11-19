"use client";

import { ErrorState } from "@/components/ui/states";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="container page-section"><ErrorState message="This page couldn’t be loaded. Please try again." onRetry={reset} /></div>;
}

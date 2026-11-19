"use client";

import { AlertCircle, LoaderCircle, PackageSearch } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";

export function LoadingState({ label = "Loading your next possibility…" }: { label?: string }) {
  return <div className="state-box" role="status" aria-live="polite"><LoaderCircle className="animate-spin" size={30} /><p>{label}</p></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="state-box state-error" role="alert"><AlertCircle size={32} /><h3>We couldn’t load this</h3><p>{message}</p>{onRetry && <Button variant="outline" onClick={onRetry}>Try again</Button>}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="state-box"><div className="state-icon"><PackageSearch size={30} /></div><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="table-wrap" tabIndex={0} role="region" aria-label="Scrollable data table">{children}</div>;
}

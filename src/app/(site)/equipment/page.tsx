import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogScreen } from "@/components/equipment/catalog-screen";
import { LoadingState } from "@/components/ui/states";

export const metadata: Metadata = { title: "All equipment" };
export default function EquipmentPage() { return <Suspense fallback={<LoadingState />}><CatalogScreen /></Suspense>; }

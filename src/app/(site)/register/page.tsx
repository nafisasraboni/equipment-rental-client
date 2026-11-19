import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";
import { LoadingState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Create an account" };
export default function RegisterPage() { return <Suspense fallback={<LoadingState />}><AuthScreen register /></Suspense>; }

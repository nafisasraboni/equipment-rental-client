import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";
import { LoadingState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Sign in" };
export default function LoginPage() { return <Suspense fallback={<LoadingState />}><AuthScreen /></Suspense>; }

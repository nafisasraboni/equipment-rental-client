"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function SignInFeedback() {
  const { data: session, isPending } = authClient.useSession();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    const linked = searchParams.get("google_linked") === "1";
    if (!isPending && session && (searchParams.get("signed_in") === "google" || linked)) {
      toast.success(linked ? "Google connected. You can now use it to sign in." : "Welcome to GearNest. You’re signed in with Google.", { id: "google-sign-in" });
      const remaining = new URLSearchParams(searchParams.toString());
      remaining.delete("signed_in");
      remaining.delete("google_linked");
      router.replace(`${pathname}${remaining.size ? `?${remaining}` : ""}${window.location.hash}`, { scroll: false });
    }
  }, [session, isPending, searchParams, pathname, router]);
  return null;
}

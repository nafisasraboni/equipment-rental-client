import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { withAuth } from "./auth";
import type { AppUser, Role } from "./types";
import { safeDestination } from "./utils";

interface UserDocument extends Omit<AppUser, "id" | "createdAt"> {
  _id: string;
  createdAt: Date;
}

export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  const requestHeaders = await headers();
  return withAuth(async (auth, db) => {
    const session = await auth.api.getSession({ headers: requestHeaders });
    if (!session) return null;
    const user = await db.collection<UserDocument>("users").findOne({ _id: session.user.id });
    if (!user) return null;
    return {
      id: user._id, name: user.name, email: user.email, image: user.image ?? null,
      role: user.role ?? "customer", status: user.status ?? "active", phone: user.phone ?? "",
      address: user.address ?? "", createdAt: user.createdAt.toISOString(),
    };
  });
});

export async function requireUser(role?: Role, destination = "/dashboard"): Promise<AppUser> {
  const user = await getCurrentUser();
  const next = safeDestination(destination);
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (user.status === "suspended") redirect("/login?error=account-suspended");
  if (role && user.role !== role) redirect("/dashboard");
  return user;
}

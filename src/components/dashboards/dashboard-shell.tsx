"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ArrowUpRight, BarChart3, Boxes, CalendarDays, Heart, LayoutDashboard, LogOut, Menu, Moon, PackagePlus, ShieldCheck, Sun, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import type { AppUser } from "@/lib/types";
import { errorMessage } from "@/lib/utils";
import { useTheme } from "@/components/providers";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const roleLinks = {
  customer: [{ href: "/dashboard/customer/rentals", label: "My rentals", icon: CalendarDays }, { href: "/dashboard/customer/favorites", label: "Favorites", icon: Heart }],
  owner: [{ href: "/dashboard/owner/analytics", label: "Overview", icon: BarChart3 }, { href: "/dashboard/owner/equipment", label: "My equipment", icon: Boxes }, { href: "/dashboard/owner/equipment/new", label: "Add equipment", icon: PackagePlus }, { href: "/dashboard/owner/rentals", label: "Equipment rentals", icon: CalendarDays }],
  admin: [{ href: "/dashboard/admin/analytics", label: "Overview", icon: LayoutDashboard }, { href: "/dashboard/admin/users", label: "All users", icon: Users }, { href: "/dashboard/admin/equipment", label: "All equipment", icon: Boxes }, { href: "/dashboard/admin/rentals", label: "All rentals", icon: CalendarDays }],
};

export function DashboardShell({ user, children }: { user: AppUser; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const initials = user.name.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("");
  const links = [...roleLinks[user.role], { href: "/dashboard/profile", label: "My profile", icon: UserRound }];
  const navigation = <nav className="sidebar-nav" aria-label="Dashboard navigation">{links.map((link) => <Link className={pathname === link.href ? "active" : ""} key={link.href} href={link.href} onClick={() => setOpen(false)}><link.icon size={18} strokeWidth={1.7} />{link.label}</Link>)}</nav>;
  async function logout() {
    setLoggingOut(true);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error(result.error.message ?? "Could not sign out.");
      toast.success("You’re signed out.");
      router.push("/");
      router.refresh();
    } catch (error) { toast.error(errorMessage(error)); }
    finally { setLoggingOut(false); }
  }
  return <div className="dashboard-layout"><aside className="dashboard-sidebar"><Logo /><p className="sidebar-role">{user.role} workspace</p>{navigation}<div className="sidebar-bottom"><Link href="/equipment"><ArrowUpRight size={16} />Back to marketplace</Link><button className="sidebar-logout" disabled={loggingOut} onClick={logout}><LogOut size={16} />{loggingOut ? "Signing out…" : "Log out"}</button><div className="sidebar-user"><span className="user-initials">{initials}</span><div><strong>{user.name}</strong><p>{user.role} account</p></div></div></div></aside><div className="dashboard-main"><header className="dashboard-topbar"><div><Button variant="ghost" size="icon" className="dashboard-menu-trigger" aria-label="Open dashboard navigation" onClick={() => setOpen(true)}><Menu size={22} /></Button><ShieldCheck size={17} /><p>Your workspace, <strong>{user.name.split(" ")[0]}.</strong></p></div><div><Button variant="ghost" size="icon" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={toggle}>{dark ? <Sun size={18} /> : <Moon size={18} />}</Button><Button variant="outline" size="sm" asChild><Link href="/equipment">Marketplace <ArrowUpRight size={14} /></Link></Button></div></header><main id="main-content">{children}</main></div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="dashboard-mobile-nav"><DialogTitle className="sr-only">Dashboard navigation</DialogTitle><DialogDescription className="sr-only">Navigate your {user.role} workspace.</DialogDescription><Logo /><p className="sidebar-role">{user.role} workspace</p>{navigation}<div className="sidebar-bottom"><button className="sidebar-logout" disabled={loggingOut} onClick={logout}><LogOut size={16} />Log out</button></div></DialogContent></Dialog></div>;
}

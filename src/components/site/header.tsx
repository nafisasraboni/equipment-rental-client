"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { errorMessage } from "@/lib/utils";
import { useTheme } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Logo } from "./logo";

const links = [{ href: "/", label: "Home" }, { href: "/equipment", label: "All equipment" }, { href: "/#how-it-works", label: "How it works" }];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  async function logout() {
    setSigningOut(true);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error(result.error.message ?? "Could not sign out.");
      setOpen(false);
      toast.success("You’re signed out.");
      router.push("/");
      router.refresh();
    } catch (error) { toast.error(errorMessage(error)); }
    finally { setSigningOut(false); }
  }
  const navigation = <>{links.map((link) => <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : ""} onClick={() => setOpen(false)}>{link.label}</Link>)}</>;
  const account = isPending ? <span className="account-placeholder" aria-label="Checking session" /> : session ? <><Button asChild variant="outline" size="sm"><Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link></Button><Button variant="ghost" size="sm" disabled={signingOut} onClick={logout}>{signingOut ? "Signing out…" : "Log out"}</Button></> : <><Link href="/login" className="login-link" onClick={() => setOpen(false)}>Log in</Link><Button asChild size="sm"><Link href="/register" onClick={() => setOpen(false)}>Get started <ArrowUpRight size={16} /></Link></Button></>;
  return <header className="site-header"><div className="container header-inner"><Logo /><nav className="desktop-nav" aria-label="Main navigation">{navigation}</nav><div className="header-actions"><Button variant="ghost" size="icon" onClick={toggle} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>{dark ? <Sun size={18} /> : <Moon size={18} />}</Button><div className="desktop-account">{account}</div><Button className="mobile-menu-trigger" variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={23} /></Button></div></div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="mobile-nav-dialog"><DialogTitle className="sr-only">Navigation</DialogTitle><DialogDescription className="sr-only">Browse GearNest and access your account.</DialogDescription><Logo /><nav className="mobile-nav" aria-label="Mobile navigation">{navigation}</nav><div className="mobile-account">{account}</div></DialogContent></Dialog></header>;
}

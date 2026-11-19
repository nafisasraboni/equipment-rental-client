import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/lib/utils";
import { Logo } from "./logo";

export function Footer() {
  return <footer className="site-footer"><div className="container footer-top"><div className="footer-brand"><Logo inverted /><p>Great gear opens up possibilities.<br />Find yours, without buying it.</p><Link href="/equipment" className="footer-cta">Find your next rental <ArrowUpRight size={17} /></Link></div><div><h3>Explore</h3><Link href="/equipment">All equipment</Link><Link href="/#how-it-works">How it works</Link><Link href="/#why-gearnest">Why GearNest</Link></div><div><h3>Categories</h3>{categories.slice(0, 4).map((category) => <Link key={category.value} href={`/equipment?category=${category.value}`}>{category.label}</Link>)}</div><div><h3>Your space</h3><Link href="/dashboard">Dashboard</Link><Link href="/dashboard/customer/favorites">Saved equipment</Link><Link href="/dashboard/profile">Your profile</Link><Link href="/register">Create an account</Link></div></div><div className="container footer-bottom"><p>© {new Date().getFullYear()} GearNest. Built for more possibilities.</p><div className="footer-legal"><Link href="/privacy">Privacy</Link><Link href="/terms">Rental terms</Link></div></div></footer>;
}

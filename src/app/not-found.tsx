import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";

export default function NotFound() {
  return <main id="main-content" className="not-found"><Logo /><div className="state-icon"><Compass size={42} /></div><p className="eyebrow">404 · A little off track</p><h1>This path leads somewhere else.</h1><p>The page may have moved. There’s still plenty of great gear to discover.</p><Button asChild><Link href="/equipment">Explore equipment</Link></Button><Link href="/" className="text-link">Back to home</Link></main>;
}

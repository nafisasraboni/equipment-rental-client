import Link from "next/link";
import { Box } from "lucide-react";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return <Link href="/" className={`logo ${inverted ? "logo-inverted" : ""}`} aria-label="GearNest home"><span className="logo-mark"><Box size={24} strokeWidth={1.8} /></span><span>Gear<span className="logo-light">Nest</span><span className="logo-dot">.</span></span></Link>;
}

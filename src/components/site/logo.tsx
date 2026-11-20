import Link from "next/link";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return <Link href="/" className={`logo ${inverted ? "logo-inverted" : ""}`} aria-label="GearNest home">Gear<span className="logo-light">Nest</span><span className="logo-dot">.</span></Link>;
}

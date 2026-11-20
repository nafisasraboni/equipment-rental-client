import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Equipment } from "@/lib/types";
import { categoryName, formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EquipmentImage } from "./equipment-image";

export function EquipmentCard({ item }: { item: Equipment }) {
  const period = item.rentalType === "daily" ? "day" : item.rentalType === "weekly" ? "7 days" : "30 days";
  return <article className="equipment-card"><Link href={`/equipment/${item.id}`} className="equipment-card-image" aria-label={`View ${item.name}`}><EquipmentImage src={item.image} alt={item.name} /><Badge tone={item.availableQuantity > 0 ? "green" : "neutral"}>{item.availableQuantity > 0 ? "Available" : "Unavailable"}</Badge></Link><div className="equipment-card-body"><p className="eyebrow">{categoryName(item.category)}</p><h3><Link href={`/equipment/${item.id}`}>{item.name}</Link></h3><p className="equipment-location"><MapPin size={14} />{item.location}</p><div className="equipment-card-bottom"><p><strong>{formatMoney(item.rentalPriceCents)}</strong><span> / {period}</span></p><Link href={`/equipment/${item.id}`} className="card-detail-link" aria-label={`View details for ${item.name}`}><span>View details</span><ArrowUpRight size={19} /></Link></div></div></article>;
}

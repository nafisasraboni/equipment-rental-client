"use client";

import Image from "next/image";
import { useState } from "react";
import { fallbackEquipmentImage } from "@/lib/utils";

export function EquipmentImage({ src, alt, priority = false, sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" }: { src: string; alt: string; priority?: boolean; sizes?: string }) {
  const [failed, setFailed] = useState(false);
  return <Image src={failed || !src ? fallbackEquipmentImage : src} alt={alt} fill unoptimized sizes={sizes} priority={priority} className="equipment-image" onError={() => setFailed(true)} />;
}

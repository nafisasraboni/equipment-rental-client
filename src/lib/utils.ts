import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}

export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  return error instanceof Error ? error.message : fallback;
}

export function safeDestination(value: string | null | undefined) {
  if (!value?.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) return "/dashboard";
  const origin = "https://route.invalid";
  const destination = new URL(value, origin);
  if (destination.origin !== origin || destination.pathname.startsWith("//")) return "/dashboard";
  return `${destination.pathname}${destination.search}${destination.hash}`;
}

export const categories = [
  { value: "construction", label: "Construction", description: "Build something bigger" },
  { value: "photography", label: "Photography", description: "Capture every detail" },
  { value: "transportation", label: "Transportation", description: "Keep your plans moving" },
  { value: "agriculture", label: "Agriculture", description: "Make light work of the land" },
  { value: "electronics", label: "Electronics", description: "Power your next idea" },
  { value: "events", label: "Events", description: "Bring people together" },
] as const;

export function categoryName(value: string) {
  return categories.find((item) => item.value === value)?.label ?? value;
}

export const fallbackEquipmentImage = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85";

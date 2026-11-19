export type Role = "customer" | "owner" | "admin";
export type RentalType = "daily" | "weekly" | "monthly";
export type Category = "construction" | "photography" | "transportation" | "agriculture" | "electronics" | "events";
export type EquipmentStatus = "pending" | "approved" | "rejected";

export interface Person {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface AppUser extends Person {
  role: Role;
  status: "active" | "suspended";
  phone: string;
  address: string;
  createdAt: string;
}

export interface Equipment {
  id: string;
  ownerId: string;
  owner: Person | null;
  name: string;
  description: string;
  category: Category;
  location: string;
  rentalPriceCents: number;
  rentalType: RentalType;
  quantity: number;
  availableQuantity: number;
  condition: string;
  brand: string;
  model: string;
  image: string;
  terms: string;
  status: EquipmentStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RentalInput {
  equipmentId: string;
  startDate: string;
  endDate: string;
  quantity: number;
  contactNumber: string;
  deliveryAddress: string;
  notes: string;
}

export interface Quote {
  totalAmountCents: number;
  days: number;
  periods: number;
  quantity: number;
  currency: "USD";
  availableQuantity: number;
}

export interface Booking extends RentalInput {
  id: string;
  intentId: string;
  customerId: string;
  ownerId: string;
  customer: Person;
  owner: Person;
  equipment: Pick<Equipment, "id" | "name" | "image" | "category">;
  rentalType: RentalType;
  rentalPriceCents: number;
  durationDays: number;
  periods: number;
  amountCents: number;
  currency: "USD";
  checkoutSessionId: string;
  paymentIntentId: string | null;
  paymentStatus: "paid";
  status: "confirmed" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  equipmentId: string;
  equipment: Equipment | null;
  createdAt: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalEquipment: number;
  totalBookings: number;
  pendingApprovals: number;
  completedRentals: number;
  totalRevenueCents: number;
  monthlyBookings: { month: string; bookings: number; revenueCents: number }[];
}

export interface OwnerAnalytics {
  totalEquipment: number;
  totalBookings: number;
  completedRentals: number;
  totalEarningsCents: number;
  monthlyEarnings: { month: string; bookings: number; earningsCents: number }[];
}

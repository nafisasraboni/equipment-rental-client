"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, LoaderCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Category, Equipment, RentalType } from "@/lib/types";
import { categories, errorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

type EquipmentFields = Pick<Equipment, "name" | "description" | "category" | "location" | "rentalPriceCents" | "rentalType" | "quantity" | "condition" | "brand" | "model" | "image" | "terms">;

function readText(data: FormData, key: string) { const value = data.get(key); return typeof value === "string" ? value.trim() : ""; }
function isCategory(value: string): value is Category { return categories.some((category) => category.value === value); }
function isRentalType(value: string): value is RentalType { return value === "daily" || value === "weekly" || value === "monthly"; }

export function EquipmentEditor({ equipment, admin = false, onSaved, onCancel }: { equipment?: Equipment; admin?: boolean; onSaved: (equipment: Equipment) => void; onCancel?: () => void }) {
  const [image, setImage] = useState(equipment?.image ?? "");
  const [preview, setPreview] = useState(equipment?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uploadController = useRef<AbortController | null>(null);
  const saveController = useRef<AbortController | null>(null);
  const fieldPrefix = equipment ? `equipment-${equipment.id}` : "new-equipment";

  useEffect(() => () => { uploadController.current?.abort(); saveController.current?.abort(); }, []);
  useEffect(() => { if (preview.startsWith("blob:")) return () => URL.revokeObjectURL(preview); }, [preview]);

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) { setError("Choose a JPEG, PNG, WebP, or GIF image."); return; }
    if (file.size > 8 * 1024 * 1024) { setError("Choose an image smaller than 8 MB."); return; }
    uploadController.current?.abort();
    const controller = new AbortController();
    uploadController.current = controller;
    setUploading(true);
    setError(null);
    setPreview(URL.createObjectURL(file));
    const data = new FormData();
    data.append("image", file);
    try {
      const result = await api<{ url: string; width: number; height: number }>("/api/uploads", { method: "POST", body: data, signal: controller.signal });
      if (!controller.signal.aborted) { setImage(result.url); setPreview(result.url); toast.success("Equipment image uploaded."); }
    } catch (failure) {
      if (!controller.signal.aborted) { setError(errorMessage(failure)); setPreview(image); }
    } finally { if (!controller.signal.aborted) setUploading(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading || saving) return;
    setError(null);
    if (!image) { setError("Upload an equipment image before saving."); return; }
    const data = new FormData(event.currentTarget);
    const category = readText(data, "category");
    const rentalType = readText(data, "rentalType");
    if (!isCategory(category) || !isRentalType(rentalType)) { setError("Choose a valid category and rental period."); return; }
    const price = Number(readText(data, "price"));
    const quantity = Number(readText(data, "quantity"));
    if (!Number.isFinite(price) || price < 0.5 || !Number.isInteger(quantity) || quantity < 1) { setError("Enter a valid rental price and whole-number quantity."); return; }
    const payload: EquipmentFields = {
      name: readText(data, "name"), description: readText(data, "description"), category,
      location: readText(data, "location"), rentalPriceCents: Math.round(price * 100), rentalType,
      quantity, condition: readText(data, "condition"), brand: readText(data, "brand"),
      model: readText(data, "model"), image, terms: readText(data, "terms"),
    };
    const controller = new AbortController();
    saveController.current = controller;
    setSaving(true);
    try {
      const result = await api<Equipment>(equipment ? `/api/equipment/${equipment.id}` : "/api/equipment", { method: equipment ? "PATCH" : "POST", body: JSON.stringify(payload), signal: controller.signal });
      if (!controller.signal.aborted) { toast.success(equipment ? "Equipment updated." : "Equipment submitted for approval."); onSaved(result); }
    } catch (failure) { if (!controller.signal.aborted) setError(errorMessage(failure)); }
    finally { if (!controller.signal.aborted) setSaving(false); }
  }

  return <form onSubmit={submit} className="equipment-form">
    <div className="form-notice"><strong>{admin ? "Keep listing information accurate." : "A little care makes a great listing."}</strong><p>{admin ? "Saved changes are applied to the listing." : "New listings and owner edits are reviewed before customers can book them."}</p></div>
    <div className="form-grid">
      <Field label="Equipment name" htmlFor={`${fieldPrefix}-name`}><Input id={`${fieldPrefix}-name`} name="name" required minLength={3} maxLength={150} defaultValue={equipment?.name} placeholder="e.g. Sony Alpha A7 IV camera" /></Field>
      <Field label="Category" htmlFor={`${fieldPrefix}-category`}><Select id={`${fieldPrefix}-category`} name="category" required defaultValue={equipment?.category ?? "photography"}>{categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</Select></Field>
      <Field label="Location" htmlFor={`${fieldPrefix}-location`}><Input id={`${fieldPrefix}-location`} name="location" required minLength={2} maxLength={150} defaultValue={equipment?.location} placeholder="City or neighborhood" /></Field>
      <Field label="Equipment condition" htmlFor={`${fieldPrefix}-condition`}><Input id={`${fieldPrefix}-condition`} name="condition" required minLength={2} maxLength={80} defaultValue={equipment?.condition} placeholder="e.g. Excellent, regularly serviced" /></Field>
      <Field label="Rental price (USD)" htmlFor={`${fieldPrefix}-price`} hint="The rate for one unit and one rental period."><Input id={`${fieldPrefix}-price`} name="price" type="number" required min={0.5} max={100000} step={0.01} defaultValue={equipment ? equipment.rentalPriceCents / 100 : ""} placeholder="0.00" /></Field>
      <Field label="Rental period" htmlFor={`${fieldPrefix}-period`}><Select id={`${fieldPrefix}-period`} name="rentalType" required defaultValue={equipment?.rentalType ?? "daily"}><option value="daily">Daily — per day</option><option value="weekly">Weekly — per 7 days</option><option value="monthly">Monthly — per 30 days</option></Select></Field>
      <Field label="Total available units" htmlFor={`${fieldPrefix}-quantity`} hint="Reserved units are checked before a quantity reduction."><Input id={`${fieldPrefix}-quantity`} name="quantity" type="number" required min={1} max={10000} step={1} defaultValue={equipment?.quantity ?? 1} /></Field>
      <Field label="Brand" htmlFor={`${fieldPrefix}-brand`}><Input id={`${fieldPrefix}-brand`} name="brand" maxLength={100} defaultValue={equipment?.brand} placeholder="Equipment brand" /></Field>
      <Field label="Model" htmlFor={`${fieldPrefix}-model`}><Input id={`${fieldPrefix}-model`} name="model" maxLength={100} defaultValue={equipment?.model} placeholder="Model name or number" /></Field>
      <div className="equipment-image-field"><Field label="Equipment image" htmlFor={`${fieldPrefix}-image`} hint="JPEG, PNG, WebP, or GIF, up to 8 MB."><Input id={`${fieldPrefix}-image`} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading || saving} onChange={uploadImage} /></Field>{preview ? <div className="equipment-image-preview"><Image src={preview} alt="Equipment image preview" width={240} height={160} unoptimized />{uploading && <span role="status"><LoaderCircle className="animate-spin" size={18} /> Uploading image…</span>}</div> : <div className="equipment-image-placeholder"><ImagePlus size={24} /><span>Your image preview appears here</span></div>}</div>
      <div className="form-full"><Field label="Description" htmlFor={`${fieldPrefix}-description`} hint="Explain what is included and what this equipment is useful for."><Textarea id={`${fieldPrefix}-description`} name="description" required minLength={20} maxLength={6000} rows={5} defaultValue={equipment?.description} placeholder="Describe the equipment, its features, and included accessories…" /></Field></div>
      <div className="form-full"><Field label="Rental terms and conditions" htmlFor={`${fieldPrefix}-terms`}><Textarea id={`${fieldPrefix}-terms`} name="terms" required minLength={10} maxLength={4000} rows={4} defaultValue={equipment?.terms} placeholder="Collection, return, care, and rental conditions…" /></Field></div>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-actions">{onCancel && <Button type="button" variant="outline" disabled={saving || uploading} onClick={onCancel}>Cancel</Button>}<Button type="submit" disabled={saving || uploading}>{saving ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}{saving ? "Saving…" : equipment ? "Save changes" : "Submit for approval"}</Button></div>
  </form>;
}

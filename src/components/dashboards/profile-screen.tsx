"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { LoaderCircle, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { AppUser } from "@/lib/types";
import { errorMessage, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Textarea } from "@/components/ui/field";

export function ProfileScreen({ user }: { user: AppUser }) {
  const router = useRouter();
  const [profile, setProfile] = useState(user);
  const [image, setImage] = useState(user.image ?? "");
  const [busy, setBusy] = useState<"save" | "upload" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initials = profile.name.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("");
  async function linkGoogle() {
    setBusy("google");
    setError(null);
    try {
      const result = await authClient.linkSocial({ provider: "google", callbackURL: "/dashboard/profile?google_linked=1", errorCallbackURL: "/dashboard/profile" });
      if (result.error) throw new Error(result.error.message ?? "Google could not be connected.");
    } catch (failure) { setError(errorMessage(failure)); setBusy(null); }
  }
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setError("Choose an image smaller than 8 MiB."); return; }
    setBusy("upload");
    setError(null);
    try {
      const body = new FormData();
      body.append("image", file);
      const result = await api<{ url: string }>("/api/uploads", { method: "POST", body });
      setImage(result.url);
      toast.success("Photo uploaded. Save your profile to apply it.");
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(null); }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy("save");
    setError(null);
    try {
      const result = await api<AppUser>("/api/me", { method: "PATCH", body: JSON.stringify({ name: String(form.get("name")).trim(), phone: String(form.get("phone") ?? "").trim(), address: String(form.get("address") ?? "").trim(), image: image.trim() || null }) });
      setProfile(result);
      toast.success("Your profile is up to date.");
      router.refresh();
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(null); }
  }
  return <div className="dashboard-page"><div className="page-heading"><div><p className="eyebrow">Your account, your details</p><h1>Make it personal.</h1><p>Keep your profile ready for your next rental.</p></div></div><div className="profile-layout"><aside className="panel profile-card"><div className="profile-avatar">{image ? <Image src={image} alt={profile.name} fill unoptimized sizes="85px" style={{ objectFit: "cover" }} /> : initials}</div><h2>{profile.name}</h2><p>{profile.email}</p><Badge tone="green">{profile.role}</Badge><div className="profile-joined">Member since {formatDate(profile.createdAt)}</div></aside><div className="panel"><div className="panel-header"><div><h2>Profile information</h2><p>Your sign-in email and role are managed separately.</p></div><Button type="button" variant="outline" onClick={linkGoogle} disabled={busy !== null}>Connect Google</Button></div><form method="post" className="profile-form" onSubmit={save}>{error && <p className="form-alert" role="alert">{error}</p>}<div className="form-grid"><Field label="Full name" htmlFor="profile-name"><Input name="name" id="profile-name" defaultValue={profile.name} minLength={2} maxLength={100} autoComplete="name" required /></Field><Field label="Email address" htmlFor="profile-email" hint="Your email is used to sign in."><Input id="profile-email" type="email" value={profile.email} readOnly autoComplete="email" /></Field></div><Field label="Phone number" htmlFor="profile-phone"><Input name="phone" id="profile-phone" type="tel" defaultValue={profile.phone} maxLength={30} autoComplete="tel" placeholder="Your contact number" /></Field><Field label="Address" htmlFor="profile-address"><Textarea name="address" id="profile-address" defaultValue={profile.address} maxLength={500} autoComplete="street-address" placeholder="Your address" rows={3} /></Field><Field label="Profile photo URL" htmlFor="profile-image"><Input id="profile-image" type="url" value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://…" /></Field><div className="upload-area"><label htmlFor="profile-upload" className="profile-upload-label"><Upload size={18} /><strong>{busy === "upload" ? "Uploading your photo…" : "Or upload a new photo"}</strong></label><Input id="profile-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} disabled={busy !== null} /><p className="field-hint">JPEG, PNG, WebP or GIF. Up to 8 MiB.</p></div><div className="form-actions"><Button type="submit" disabled={busy !== null}>{busy ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />}Save profile</Button></div></form></div></div></div>;
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Check, Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { errorMessage, safeDestination } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Logo } from "@/components/site/logo";

export function AuthScreen({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  const destination = safeDestination(params.get("next"));
  const suspended = params.get("error") === "account-suspended";
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!isPending && session && !suspended) router.replace(destination);
  }, [isPending, session, suspended, destination, router]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (register && (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password))) {
      setError("Use at least 6 characters, including one uppercase and one lowercase letter.");
      return;
    }
    setBusy("email");
    try {
      const result = register ? await authClient.signUp.email({ name: String(form.get("name") ?? "").trim(), email, password, image: String(form.get("image") ?? "").trim() || undefined }) : await authClient.signIn.email({ email, password });
      if (result.error) throw new Error(result.error.message ?? "Could not access your account.");
      toast.success(register ? "Welcome to GearNest. Your account is ready!" : "Welcome back. You’re signed in.");
      router.replace(destination);
      router.refresh();
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(null); }
  }
  async function google() {
    setError(null);
    setBusy("google");
    try {
      const callbackURL = `${destination}${destination.includes("?") ? "&" : "?"}signed_in=google`;
      const result = await authClient.signIn.social({ provider: "google", callbackURL, errorCallbackURL: "/login" });
      if (result.error) throw new Error(result.error.message ?? "Google sign-in could not be started.");
    } catch (failure) { setError(errorMessage(failure)); setBusy(null); }
  }
  return <section className="container auth-layout"><aside className="auth-story"><Logo inverted /><div><p className="eyebrow">A world of gear. A world of possibility.</p><h1>{register ? <>Your next great idea<br />starts <em>right here.</em></> : <>Welcome back to<br /><em>what’s possible.</em></>}</h1><p>Keep your plans, bookings, and favorite equipment together. Get the gear you need and make something happen.</p><ul><li><Check size={17} />Discover approved equipment</li><li><Check size={17} />Book the time you need</li><li><Check size={17} />Track everything in your dashboard</li></ul></div><p className="auth-story-note"><ShieldCheck size={18} />Your account. Your possibilities.</p></aside><div className="auth-form-panel"><p className="eyebrow">{register ? "A fresh start" : "Good to see you again"}</p><h2>{register ? "Make yourself at home." : "Let’s get you signed in."}</h2><p>{register ? "Create a customer account to start exploring." : "Pick up where your last idea left off."}</p><Button type="button" variant="outline" className="google-button full-width" onClick={google} disabled={isPending || busy !== null}>{busy === "google" ? <LoaderCircle className="animate-spin" size={18} /> : <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M43.6 20.5H24v8h11.2c-.9 5.1-5.4 8-11.2 8-6.9 0-12.5-5.6-12.5-12.5S17.1 11.5 24 11.5c3.4 0 6.4 1.2 8.7 3.4l6.2-6.2A21.9 21.9 0 0 0 24 3C12.4 3 3 12.4 3 24s9.4 21 21 21c12.1 0 20.2-8.5 20.2-20.4 0-1.5-.2-2.8-.6-4.1Z" /><path fill="#34A853" d="M24 45c5.8 0 10.7-1.9 14.3-5.2l-6.6-5.1c-1.8 1.2-4.4 1.8-7.7 1.8-5.6 0-10.3-3.7-11.9-8.7l-6.8 5.3A21 21 0 0 0 24 45Z" /><path fill="#FBBC05" d="M12.1 27.8a12.6 12.6 0 0 1 0-7.6l-6.8-5.3a21 21 0 0 0 0 18.2l6.8-5.3Z" /><path fill="#EA4335" d="M24 11.5c3.4 0 6.4 1.2 8.7 3.4l6.2-6.2A21 21 0 0 0 5.3 14.9l6.8 5.3c1.6-5 6.3-8.7 11.9-8.7Z" /></svg>}Continue with Google</Button><div className="auth-divider"><span>or continue with email</span></div>{suspended && <p className="form-alert" role="alert">This account is suspended. Contact the platform administrator to restore access.</p>}{params.get("error") === "account_not_linked" && <p className="form-alert" role="alert">Sign in with your password, then connect Google from your profile.</p>}{error && <p className="form-alert" role="alert">{error}</p>}<form method="post" onSubmit={submit} className="auth-form">{register && <Field label="Full name" htmlFor="name"><Input id="name" name="name" autoComplete="name" placeholder="Your name" required minLength={2} maxLength={100} /></Field>}<Field label="Email address" htmlFor="email"><Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></Field>{register && <Field label="Profile photo URL" htmlFor="image" hint="Optional: a direct link to your profile photo."><Input id="image" name="image" type="url" placeholder="https://…" /></Field>}<Field label="Password" htmlFor="password" hint={register ? "At least 6 characters, with uppercase and lowercase letters." : undefined}><div className="password-field"><Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} placeholder={register ? "Create a password" : "Enter your password"} required minLength={register ? 6 : undefined} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></Field><Button className="full-width" size="lg" type="submit" disabled={isPending || busy !== null}>{busy === "email" ? <LoaderCircle className="animate-spin" size={18} /> : <ArrowRight size={18} />}{register ? "Create my account" : "Sign in"}</Button></form><p className="auth-switch">{register ? "Already part of GearNest?" : "New to GearNest?"} <Link href={`${register ? "/login" : "/register"}${params.get("next") ? `?next=${encodeURIComponent(destination)}` : ""}`}>{register ? "Sign in" : "Create an account"}</Link></p></div></section>;
}

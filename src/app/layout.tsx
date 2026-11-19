import type { Metadata } from "next";
import { Suspense } from "react";
import { Providers } from "@/components/providers";
import { SignInFeedback } from "@/components/auth/sign-in-feedback";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "GearNest — Great gear. More possibilities.", template: "%s | GearNest" },
  description: "Find and rent equipment for your next project, adventure, or event. Flexible rental periods, trusted owners, and secure checkout.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.dataset.theme=localStorage.getItem('gearnest-theme')||'light'}catch{document.documentElement.dataset.theme='light'}" }} /></head><body><a className="skip-link" href="#main-content">Skip to content</a><Providers>{children}<Suspense fallback={null}><SignInFeedback /></Suspense></Providers></body></html>;
}

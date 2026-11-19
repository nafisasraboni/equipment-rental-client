"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { Toaster } from "sonner";

const ThemeContext = createContext({ dark: false, toggle: () => {} });

function subscribeTheme(callback: () => void) {
  window.addEventListener("gearnest-theme-change", callback);
  return () => window.removeEventListener("gearnest-theme-change", callback);
}

function getThemeSnapshot() { return document.documentElement.dataset.theme === "dark"; }

export function Providers({ children }: { children: ReactNode }) {
  const dark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => false);
  function toggle() {
    const next = !dark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try { localStorage.setItem("gearnest-theme", next ? "dark" : "light"); }
    catch (error) { console.warn("Theme preference could not be saved.", error); }
    window.dispatchEvent(new Event("gearnest-theme-change"));
  }
  return <ThemeContext.Provider value={{ dark, toggle }}>{children}<Toaster richColors position="top-right" theme={dark ? "dark" : "light"} /></ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }

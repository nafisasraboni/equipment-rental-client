"use client";

import { authClient } from "./auth-client";

export class ApiError extends Error {
  constructor(message: string, public status: number, public code = "REQUEST_FAILED") {
    super(message);
    this.name = "ApiError";
  }
}

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { message?: string; code?: string };
}

export async function api<T>(path: string, options: RequestInit & { authenticated?: boolean } = {}): Promise<T> {
  const { authenticated = true, ...init } = options;
  const headers = new Headers(init.headers);
  if (typeof init.body === "string" && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (authenticated) {
    const { data, error } = await authClient.token();
    if (error || !data?.token) throw new ApiError("Please sign in to continue.", 401, "UNAUTHENTICATED");
    headers.set("Authorization", `Bearer ${data.token}`);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  const signal = init.signal ? AbortSignal.any([init.signal, controller.signal]) : controller.signal;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}${path}`, {
      ...init, headers, signal, cache: "no-store",
    });
    let result: Envelope<T>;
    try { result = await response.json(); }
    catch { throw new ApiError("The server returned an unreadable response. Please try again.", response.status || 502, "INVALID_RESPONSE"); }
    if (!response.ok || !result.success || result.data === undefined) {
      throw new ApiError(result.error?.message ?? "The request could not be completed.", response.status, result.error?.code);
    }
    return result.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") throw new ApiError("The request timed out. Please try again.", 408, "TIMEOUT");
    throw new ApiError("Unable to reach the server. Check your connection and try again.", 503, "NETWORK_ERROR");
  } finally { clearTimeout(timer); }
}

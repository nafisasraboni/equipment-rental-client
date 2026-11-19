"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/utils";

export function useApi<T>(path: string, authenticated = true) {
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ key: string; data: T | null; error: string | null }>({ key: "", data: null, error: null });
  const key = `${path}:${authenticated}:${retry}`;
  useEffect(() => {
    const controller = new AbortController();
    api<T>(path, { authenticated, signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setResult({ key, data, error: null }); })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResult({ key, data: null, error: errorMessage(error) });
      });
    return () => controller.abort();
  }, [path, authenticated, retry, key]);
  return { data: result.key === key ? result.data : null, error: result.key === key ? result.error : null, loading: result.key !== key, refresh: () => setRetry((value) => value + 1) };
}

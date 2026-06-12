"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  clearStoredSession,
  getAuthRedirectPath,
  readAccessToken,
  validateAccessToken,
} from "@/lib/auth";

function AuthLoadingShell() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 px-4 text-center text-sm text-zinc-400"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3 border border-zinc-800 bg-black/40 px-5 py-4 shadow-2xl">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-violet-500/25 border-t-violet-400" />
        <div>Checking session...</div>
      </div>
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function run() {
      setStatus("loading");
      const token = readAccessToken();
      if (!token) {
        const redirect = getAuthRedirectPath(pathname, false);
        if (redirect && active) {
          router.replace(redirect);
          return;
        }
        if (active) setStatus("ready");
        return;
      }

      const result = await validateAccessToken(token, controller.signal);
      if (!active) return;

      if (result.status === "valid") {
        const redirect = getAuthRedirectPath(pathname, true);
        if (redirect) {
          router.replace(redirect);
          return;
        }
        setStatus("ready");
        return;
      }

      if (result.status === "invalid") {
        clearStoredSession();
        const redirect = getAuthRedirectPath(pathname, false);
        if (redirect) {
          router.replace(redirect);
          return;
        }
        setStatus("ready");
        return;
      }

      // Degrade gracefully: keep current page interactive when verification API is unavailable.
      setStatus("ready");
    }

    void run();
    return () => {
      active = false;
      controller.abort();
    };
  }, [pathname, router]);

  if (status === "loading") {
    return <AuthLoadingShell />;
  }

  return <>{children}</>;
}

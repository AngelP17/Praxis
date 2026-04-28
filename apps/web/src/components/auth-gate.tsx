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
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-800 bg-black/40 px-5 py-4 shadow-2xl">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-500/25 border-t-amber-400" />
        <div>Checking session...</div>
      </div>
    </div>
  );
}

function AuthErrorShell({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 w-full max-w-md px-2" aria-live="polite">
      <div className="pointer-events-auto rounded-2xl border border-amber-500/25 bg-zinc-950/90 px-5 py-4 shadow-2xl">
        <div className="text-xs uppercase tracking-[0.28em] text-red-300">
          Session verification failed
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-300">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-500/22"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function run() {
      setStatus("loading");
      setErrorMessage("");
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
      setErrorMessage(result.message || "Session verification failed");
      setStatus("error");
    }

    void run();
    return () => {
      active = false;
      controller.abort();
    };
  }, [pathname, router, nonce]);

  if (status === "loading") {
    return <AuthLoadingShell />;
  }

  if (status === "error") {
    return (
      <>
        {children}
        <AuthErrorShell
          message={`${errorMessage}. Continuing in resilient mode while command surfaces use live/demo fallback.`}
          onRetry={() => setNonce((value) => value + 1)}
        />
      </>
    );
  }

  return <>{children}</>;
}

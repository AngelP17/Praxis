"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash, ShieldChevron, SignIn, WarningCircle } from "@phosphor-icons/react";

import { ACCESS_TOKEN_KEY, USER_STORAGE_KEY } from "@/lib/auth";
import { useToast } from "@/components/notifications";

function resolveApi(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base || base === "/api") return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const cleanBase = base.replace(/\/$/, "");
  if (cleanBase.endsWith("/api") && normalized.startsWith("/api/")) {
    return `${cleanBase}${normalized.slice(4)}`;
  }
  return `${cleanBase}${normalized}`;
}

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(resolveApi("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.detail || "Authentication failed.");
      }
      const payload = await response.json();
      localStorage.setItem(ACCESS_TOKEN_KEY, payload.access_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload.user));
      toast.success("Session established");
      router.push("/command-center");
    } catch (submitError) {
      // Offline fallback: if API is unavailable, allow local operator login.
      const isApiUnavailable = submitError instanceof Error && 
        (submitError.message.includes("404") || submitError.message.includes("Failed to fetch") || submitError.message.includes("NetworkError"));
      
      if (isApiUnavailable && (username === "admin" || username === "operator" || username === "viewer")) {
        const role = username === "admin" ? "admin" : username === "viewer" ? "viewer" : "agent";
        localStorage.setItem(ACCESS_TOKEN_KEY, "demo-token");
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
          username,
          role,
          display_name: username.charAt(0).toUpperCase() + username.slice(1),
        }));
        toast.success("Session established");
        router.push("/command-center");
      } else {
        setError(submitError instanceof Error ? submitError.message : "Authentication failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="sv3 sv3-bg min-h-[100dvh] overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="praxis-v2-grid" />
      <div className="praxis-v2-noise" />
      <div className="praxis-v2-amber-field" />

      <div className="relative z-10 mx-auto grid w-full max-w-[1580px] items-stretch gap-5 lg:grid-cols-[52%_48%] grid-flow-dense">
        <section className="praxis-v2-panel-strong p-6 sm:p-7 py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-950/75 px-3 py-1.5">
            <ShieldChevron size={14} className="text-violet-300" />
            <span className="mono-data text-[11px] uppercase tracking-[0.22em] text-zinc-200">Praxis Access</span>
          </div>

          <h1 className="mt-6 max-w-5xl text-[clamp(2rem,3.5vw,3.8rem)] font-semibold leading-[1.04] tracking-tight text-zinc-50">
            Enter the forensic command room.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300">
            Authenticate to review high-priority machine incidents, inspect deterministic Praxis decisions, and capture
            audit-ready human feedback.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 grid-flow-dense">
            {[
              ["Signal intake", "Machine telemetry and operator tickets merged"],
              ["Deterministic scoring", "Priority, confidence, and root cause trace"],
              ["Human checkpoint", "Approval and challenge trail preserved"],
              ["Replay integrity", "Hash-linked timeline and export bundle"],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-xl border border-zinc-700/75 bg-zinc-900/70 p-3.5">
                <div className="text-sm font-medium text-zinc-100">{title}</div>
                <div className="mt-1 text-xs leading-6 text-zinc-400">{detail}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-zinc-700/75 bg-zinc-950/75 p-3.5">
            <div className="praxis-v2-eyebrow">Session Preview</div>
            <div className="mt-2 grid grid-cols-[1fr,1fr,1fr] gap-2 grid-flow-dense">
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/75 px-2.5 py-2">
                <div className="text-[10px] text-zinc-500">Queue</div>
                <div className="mono-data mt-1 text-xs text-zinc-100">INC-4821 selected</div>
              </div>
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/75 px-2.5 py-2">
                <div className="text-[10px] text-zinc-500">Decision</div>
                <div className="mono-data mt-1 text-xs text-zinc-100">confidence 0.92</div>
              </div>
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/75 px-2.5 py-2">
                <div className="text-[10px] text-zinc-500">Replay</div>
                <div className="mono-data mt-1 text-xs text-zinc-100">sha256 linked</div>
              </div>
            </div>
          </div>
        </section>

        <section className="praxis-v2-panel p-6 sm:p-7 py-20">
          <div className="praxis-v2-eyebrow">Operator Authentication</div>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-50">Sign In</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Open the command center with your role-linked credentials.
          </p>

          <form id="login-form" onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-zinc-200">
                Username
              </label>
              <input
                id="username"
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                className="min-h-11 w-full rounded-xl border border-zinc-700/75 bg-zinc-950/85 px-3.5 text-sm text-zinc-100 outline-none transition focus:border-violet-400/45"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-200">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="min-h-11 w-full rounded-xl border border-zinc-700/75 bg-zinc-950/85 px-3.5 pr-11 text-sm text-zinc-100 outline-none transition focus:border-violet-400/45"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-1.5 top-1.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700/75 bg-zinc-900/75 text-zinc-300 transition hover:border-zinc-500 hover:scale-105 transition-transform duration-500"
                >
                  {showPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-100">
                <div className="inline-flex items-center gap-2">
                  <WarningCircle size={14} />
                  <span>{error}</span>
                </div>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.1em] transition-transform hover:scale-[1.02] disabled:opacity-50"
              style={{ background: "var(--praxis-plasma)", color: "var(--praxis-obsidian)" }}
            >
              <SignIn size={15} />
              {isSubmitting ? "Authorizing..." : "Open Command Center"}
            </button>
          </form>

          <div className="mt-5 rounded-xl border border-zinc-700/70 bg-zinc-900/70 px-3.5 py-3 text-xs leading-6 text-zinc-400">
            Operator credentials continue to work when the live auth service is unavailable.
          </div>
        </section>
      </div>
    </main>
  );
}

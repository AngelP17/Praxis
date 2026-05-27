"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash, ShieldChevron, SignIn, WarningCircle } from "@phosphor-icons/react";

import { ACCESS_TOKEN_KEY, USER_STORAGE_KEY } from "@/lib/auth";
import { IS_DEMO_MODE } from "@/lib/demo-mode";
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
      // Deterministic local credentials exist only for explicit demo mode.
      const isApiUnavailable = submitError instanceof Error && 
        (submitError.message.includes("404") || submitError.message.includes("Failed to fetch") || submitError.message.includes("NetworkError"));
      
      if (IS_DEMO_MODE && isApiUnavailable && (username === "admin" || username === "operator" || username === "viewer")) {
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
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[var(--praxis-obsidian)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(139,92,255,0.16),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(62,255,168,0.08),transparent_18%),linear-gradient(180deg,rgba(19,18,31,0.24),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(241,237,223,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(241,237,223,0.04)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(circle_at_top,black,transparent_78%)]" />

      <div className="relative z-10 mx-auto grid w-full max-w-[1580px] items-stretch gap-5 lg:grid-cols-[52%_48%] grid-flow-dense">
        <section className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.94),rgba(10,10,20,0.9))] px-6 py-20 sm:px-7 md:py-24">
          <div className="inline-flex items-center gap-2 border border-[var(--praxis-plasma)] bg-[color-mix(in_srgb,var(--praxis-plasma)_12%,transparent)] px-3 py-1.5">
            <ShieldChevron size={14} className="text-[var(--praxis-plasma)]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--praxis-bone)]">Praxis Access</span>
          </div>

          <h1 className="mt-6 max-w-5xl font-display text-[clamp(2rem,3.5vw,3.8rem)] font-semibold leading-[1.04] tracking-tight text-[var(--praxis-bone)]">
            Enter the forensic command room.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--praxis-muted)]">
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
              <div key={title} className="overflow-hidden border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.6)] p-3.5 transition-transform duration-700 hover:scale-[1.02]">
                <div className="text-sm font-medium text-[var(--praxis-bone)]">{title}</div>
                <div className="mt-1 text-xs leading-6 text-[var(--praxis-muted)]">{detail}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 overflow-hidden border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.68)] p-3.5">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-mute)]">Session Preview</div>
            <div className="mt-2 grid grid-cols-[1fr,1fr,1fr] gap-2 grid-flow-dense">
              <div className="overflow-hidden border border-[var(--praxis-line)] bg-[rgba(19,18,31,0.72)] px-2.5 py-2">
                <div className="text-[10px] text-[var(--praxis-mute)]">Queue</div>
                <div className="mt-1 font-mono text-xs text-[var(--praxis-bone)]">Session ready</div>
              </div>
              <div className="overflow-hidden border border-[var(--praxis-line)] bg-[rgba(19,18,31,0.72)] px-2.5 py-2">
                <div className="text-[10px] text-[var(--praxis-mute)]">Decision</div>
                <div className="mt-1 font-mono text-xs text-[var(--praxis-bone)]">confidence 0.92</div>
              </div>
              <div className="overflow-hidden border border-[var(--praxis-line)] bg-[rgba(19,18,31,0.72)] px-2.5 py-2">
                <div className="text-[10px] text-[var(--praxis-mute)]">Replay</div>
                <div className="mt-1 font-mono text-xs text-[var(--praxis-bone)]">sha256 linked</div>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.94),rgba(10,10,20,0.88))] px-6 py-20 sm:px-7 md:py-24">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-mute)]">Operator Authentication</div>
          <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--praxis-bone)]">Sign In</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--praxis-muted)]">
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
                className="min-h-11 w-full border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.85)] px-3.5 text-sm text-[var(--praxis-bone)] outline-none transition focus:border-[var(--praxis-plasma)]"
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
                  className="min-h-11 w-full border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.85)] px-3.5 pr-11 text-sm text-[var(--praxis-bone)] outline-none transition focus:border-[var(--praxis-plasma)]"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-1.5 top-1.5 inline-flex h-8 w-8 items-center justify-center border border-[var(--praxis-line)] bg-[rgba(19,18,31,0.75)] text-[var(--praxis-muted)] transition-transform duration-700 hover:scale-105 hover:border-[var(--praxis-plasma)] hover:text-[var(--praxis-bone)]"
                >
                  {showPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="border border-[var(--praxis-crit)] bg-[color-mix(in_srgb,var(--praxis-crit)_12%,transparent)] px-3.5 py-2.5 text-sm text-[var(--praxis-bone)]">
                <div className="inline-flex items-center gap-2">
                  <WarningCircle size={14} />
                  <span>{error}</span>
                </div>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 border border-[var(--praxis-plasma)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.1em] transition-transform duration-700 hover:scale-[1.02] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--praxis-plasma), color-mix(in srgb, var(--praxis-plasma) 70%, var(--praxis-bone)))", color: "var(--praxis-obsidian)" }}
            >
              <SignIn size={15} />
              {isSubmitting ? "Authorizing..." : "Open Command Center"}
            </button>
          </form>

          <div className="mt-5 border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.6)] px-3.5 py-3 text-xs leading-6 text-[var(--praxis-muted)]">
            Operator credentials continue to work when the live auth service is unavailable.
          </div>
        </section>
      </div>
    </main>
  );
}

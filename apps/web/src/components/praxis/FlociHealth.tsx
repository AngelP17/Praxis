"use client";

import { useEffect, useState } from "react";
import { HardDrives, Envelope, Database, Lightning } from "@phosphor-icons/react";
import { DEMO_HEALTH } from "@/lib/praxis-demo-data";
import { IS_DEMO_MODE } from "@/lib/demo-mode";

interface ServiceStatus {
  status: string;
  endpoint?: string;
}

interface FlociHealthData {
  status: string;
  endpoint: string;
  message?: string;
  services: Record<string, ServiceStatus>;
}

const SERVICE_ICONS: Record<string, typeof Database> = {
  s3: HardDrives,
  sqs: Envelope,
  dynamodb: Database,
  events: Lightning,
};

function ServiceDot({ status }: { status: string }) {
  const color =
    status === "healthy"
      ? "bg-[var(--praxis-mint)]"
      : status === "degraded"
        ? "bg-[var(--praxis-violet)]"
        : "bg-[var(--praxis-crit)]";
  return <span className={`h-1.5 w-1.5 rounded-full ${color}`} />;
}

export function FlociHealth() {
  const [health, setHealth] = useState<FlociHealthData | null>(
    IS_DEMO_MODE ? (DEMO_HEALTH as FlociHealthData) : null,
  );
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (IS_DEMO_MODE) {
      setHealth(DEMO_HEALTH as FlociHealthData);
      return;
    }

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch("/api/health/floci");
        if (!cancelled && res.ok) {
          setHealth(await res.json());
        }
      } catch {
        // Floci not running, silently handle
      }
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const overallStatus = health?.status || "unknown";

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className="hidden items-center gap-3 rounded-full border border-[rgba(241,237,223,0.14)] bg-[rgba(19,18,31,0.66)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] backdrop-blur-xl transition-transform duration-700 hover:scale-105 md:flex"
      >
        <ServiceDot status={overallStatus} />
        <span
          className={
            overallStatus === "healthy"
              ? "text-[var(--praxis-mint)]"
              : overallStatus === "degraded"
                ? "text-[var(--praxis-violet)]"
                : "text-[var(--praxis-muted)]"
          }
        >
          Floci {overallStatus}
        </span>
      </button>

      {expanded && health && (
        <div className="absolute right-0 top-full mt-2 z-50 min-w-[240px] border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-4 backdrop-blur-xl">
          <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--praxis-muted)]">
            FieldLab services
          </div>
          <div className="mt-3 space-y-2">
            {Object.entries(health.services).map(([svc, info]) => {
              const Icon = SERVICE_ICONS[svc] || Database;
              return (
                <div key={svc} className="flex items-center gap-2">
                  <ServiceDot status={info.status} />
                  <Icon className="h-3 w-3 text-[var(--praxis-muted)]" />
                  <span className="flex-1 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
                    {svc}
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase ${
                      info.status === "healthy"
                        ? "text-[var(--praxis-mint)]"
                        : "text-[var(--praxis-crit)]"
                    }`}
                  >
                    {info.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

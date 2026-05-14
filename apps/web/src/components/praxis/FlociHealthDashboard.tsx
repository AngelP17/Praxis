"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Warning, XCircle } from "@phosphor-icons/react";

interface ServiceHealth {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  uptime: string;
}

export default function FlociHealthDashboard() {
  const [health, setHealth] = useState<Record<string, ServiceHealth>>({
    s3: { name: "S3", status: "healthy", uptime: "2h 34m" },
    sqs: { name: "SQS", status: "healthy", uptime: "2h 34m" },
    dynamodb: { name: "DynamoDB", status: "healthy", uptime: "2h 34m" },
    eventbridge: { name: "EventBridge", status: "healthy", uptime: "2h 34m" },
  });

  const checkHealth = async () => {
    try {
      const response = await fetch("/api/floci/health");
      const data = await response.json();

      setHealth({
        s3: { ...health.s3, ...data.s3 },
        sqs: { ...health.sqs, ...data.sqs },
        dynamodb: { ...health.dynamodb, ...data.dynamodb },
        eventbridge: { ...health.eventbridge, ...data.eventbridge },
      });
    } catch (error) {
      console.error("Failed to fetch Floci health:", error);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ServiceHealth["status"]) => {
    switch (status) {
      case "healthy":
        return "bg-[var(--praxis-mint)]";
      case "degraded":
        return "bg-[var(--praxis-violet)]";
      case "unhealthy":
        return "bg-[var(--praxis-crit)]";
      default:
        return "bg-[var(--praxis-line)]";
    }
  };

  const getStatusIcon = (status: ServiceHealth["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-[var(--praxis-mint)]" weight="fill" />;
      case "degraded":
        return <Warning className="h-5 w-5 text-[var(--praxis-violet)]" weight="fill" />;
      case "unhealthy":
        return <XCircle className="h-5 w-5 text-[var(--praxis-crit)]" weight="fill" />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-[100dvh] bg-[var(--praxis-bg)] p-8 text-[var(--praxis-bone)]">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-5xl font-medium tracking-normal">
            Floci Health Dashboard
          </h1>
          <p className="text-lg text-[var(--praxis-muted)]">
            Real-time status of local AWS runtime services
          </p>
        </div>

        <div className="grid grid-flow-dense gap-4 md:grid-cols-2">
          {Object.entries(health).map(([key, service]) => (
            <div
              key={key}
              className={`border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6 transition-all duration-700 hover:scale-105 ${getStatusColor(service.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full transition-colors duration-700 ${getStatusColor(service.status)}`} />
                  <span className="font-mono text-sm uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
                    {service.name}
                  </span>
                </div>
                <div className="text-right font-mono text-sm">
                  {getStatusIcon(service.status)}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs uppercase tracking-[0.12em] text-[var(--praxis-muted)] mb-1">
                  Status
                </div>
                <div className="text-xl font-medium">
                  {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs uppercase tracking-[0.12em] text-[var(--praxis-muted)] mb-1">
                  Uptime
                </div>
                <div className="text-2xl font-mono">
                  {service.uptime}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-[var(--praxis-line)] pt-8 text-center text-sm text-[var(--praxis-muted)]">
          <p className="mb-2">
            <span className="text-[var(--praxis-violet)]">Last updated:</span> Just now
          </p>
          <p className="mb-4">
            Floci services are running locally at{" "}
            <code className="font-mono text-[var(--praxis-bone)]">http://localhost:4566</code>
          </p>
          <p className="text-[var(--praxis-muted)]">
            Health checks run every 30 seconds. Refresh to see current status.
          </p>
        </div>
      </div>
    </main>
  );
}

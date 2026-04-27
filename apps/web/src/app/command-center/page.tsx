"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Stack, Gauge, CheckCircle, ShieldWarning } from "@phosphor-icons/react";

import { useToast } from "@/components/notifications";
import { clearStoredSession } from "@/lib/auth";
import { useCommandFeed } from "@/lib/hooks/use-command-feed";
import { CommandRoomShell } from "@/components/sentinel/command-room-shell";
import { SystemStatusRail } from "@/components/system-status-rail";
import { CommandTopBar } from "@/components/sentinel/command-top-bar";
import { SignalQueue } from "@/components/sentinel/signal-queue";
import { IncidentDetailPanel } from "@/components/sentinel/incident-detail-panel";
import { DecisionExplanationPanel } from "@/components/sentinel/decision-explanation-panel";
import { LoadingState } from "@/components/sentinel/loading-state";
import { ErrorState } from "@/components/sentinel/error-state";
import { MotionPriorityStack } from "@/components/motion/motion-priority-stack";
import { MotionReplayRail } from "@/components/motion/motion-replay-rail";

export default function CommandCenterPage() {
  const router = useRouter();
  const toast = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const {
    feed,
    hydrate,
    lastSyncSeconds,
    search,
    setSearch,
    selectedTicketId,
    setSelectedTicketId,
    filteredQueue,
    selectedTicket,
    linkedIncident,
    totalTickets,
    openTickets,
    closedResolved,
    criticalOpen,
    slaRisk,
  } = useCommandFeed();

  const handleExport = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const response = await fetch("/api/reports/excel", { method: "GET", cache: "no-store" });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "aether_report.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export started", "aether_report.xlsx");
    } catch (error) {
      toast.error("Export failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, toast]);

  const handleLogout = useCallback(async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", cache: "no-store" }).catch(() => null);
    } finally {
      clearStoredSession();
      router.replace("/login");
      setIsSigningOut(false);
    }
  }, [isSigningOut, router]);

  const metrics = [
    { label: "Total Signals", value: totalTickets, note: "Live volume from ingest pipeline.", icon: Stack, color: "#f59e0b" },
    { label: "Open Queue", value: openTickets, note: `${slaRisk} cases drifting toward SLA risk.`, icon: Gauge, color: "#f59e0b" },
    { label: "Closed / Resolved", value: closedResolved, note: "Completed work in live stream.", icon: CheckCircle, color: "#22c55e" },
    { label: "Critical Open", value: criticalOpen, note: "Requires immediate operator attention.", icon: ShieldWarning, color: "#f43f5e" },
  ];

  return (
    <CommandRoomShell>
      <SystemStatusRail activeLabel="Overview" />

      <main className="flex-1 overflow-auto ops-safe-bottom px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="ops-glass rounded-[28px] px-4 py-4 sm:px-6 sm:py-6">
          <CommandTopBar
            feedStatus={feed.status}
            lastSyncSeconds={lastSyncSeconds}
            warnings={feed.warnings}
            search={search}
            onSearchChange={setSearch}
            isExporting={isExporting}
            onExport={handleExport}
            onLogout={handleLogout}
            isSigningOut={isSigningOut}
          />

          {feed.status === "loading" && <LoadingState />}

          {feed.status === "error" && (
            <ErrorState message={feed.errorMessage} onRetry={() => void hydrate({ notifyOnError: true })} />
          )}

          {feed.status === "ready" && (
            <>
              <section id="overview" className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MotionPriorityStack items={metrics} />
              </section>

              <section className="mt-6">
                <MotionReplayRail
                  nodes={[
                    { id: "ingest", label: "Ingest", href: "#", status: "complete" },
                    { id: "normalize", label: "Normalize", href: "#", status: "complete" },
                    { id: "decide", label: "Decide", href: "#", status: "active" },
                    { id: "route", label: "Route", href: "#", status: "pending" },
                    { id: "audit", label: "Audit", href: "#", status: "pending" },
                  ]}
                />
              </section>

              <section id="decision" className="mt-6 grid gap-6 2xl:grid-cols-[1.15fr,0.85fr]">
                <SignalQueue
                  tickets={filteredQueue}
                  selectedId={selectedTicketId}
                  onSelect={setSelectedTicketId}
                  searchTerm={search}
                />
                <div className="space-y-6">
                  <IncidentDetailPanel ticket={selectedTicket} linkedIncident={linkedIncident} />
                  <DecisionExplanationPanel
                    decision={
                      feed.tickets.find((t) => t.ticket_id === selectedTicket?.ticketId)
                        ? {
                            priority_score: selectedTicket?.score,
                            confidence_score: 0.87,
                            root_cause_hypothesis: selectedTicket?.category,
                            sla_risk_score: selectedTicket ? Math.min(100, selectedTicket.daysOpen * 12) : 0,
                            actionability_score: selectedTicket ? Math.max(30, 95 - selectedTicket.daysOpen * 5) : 0,
                          }
                        : null
                    }
                  />
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </CommandRoomShell>
  );
}

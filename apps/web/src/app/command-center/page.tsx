"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/notifications";
import { clearStoredSession } from "@/lib/auth";
import { useCommandFeed } from "@/lib/hooks/use-command-feed";
import { CommandRoomV3 } from "@/components/sentinel-v3/command-room/command-room-v3";

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
  } = useCommandFeed();
  const visibleCountForStatus = feed.tickets.filter((ticket) => ticket.status !== "Closed" && ticket.status !== "Resolved").length;

  const handleExport = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const response = await fetch("/api/reports/excel", { method: "GET", cache: "no-store" });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "aether_sentinel_audit_bundle.xlsx";
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Audit export started");
    } catch (error) {
      toast.error("Export failed", error instanceof Error ? error.message : "Unknown export error");
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

  return (
    <CommandRoomV3
      feedStatus={feed.status}
      feedMode={feed.mode}
      lastSyncSeconds={lastSyncSeconds}
      warnings={feed.warnings}
      search={search}
      onSearchChange={setSearch}
      onRefresh={() => void hydrate({ notifyOnError: true })}
      onExport={handleExport}
      isExporting={isExporting}
      onLogout={handleLogout}
      isSigningOut={isSigningOut}
      tickets={filteredQueue}
      selectedTicketId={selectedTicketId}
      onSelectTicket={setSelectedTicketId}
      selectedTicket={selectedTicket}
      linkedIncident={linkedIncident}
      visibleCountForStatus={visibleCountForStatus}
    />
  );
}

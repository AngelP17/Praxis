import type { FeedMode, FeedStatus, QueueTicket } from "@/lib/hooks/use-command-feed";

export type DataStatus = "loading" | "error" | "live" | "demo" | "stale" | "empty";

export type EvidenceRecord = {
  id: string;
  label: string;
  source: string;
  timestamp: string;
};

export type FeedbackRecord = {
  id: string;
  author: string;
  verdict: "approve" | "question";
  comment: string;
  timestamp: string;
};

export type AuditRecord = {
  id: string;
  label: string;
  hash: string;
  timestamp: string;
};

export function normalizeRootCause(raw?: string | null) {
  if (!raw) return "Unknown";
  return raw.replace(/[_-]+/g, " ");
}

export function displayStatus(feedStatus: FeedStatus, feedMode: FeedMode, visibleCount: number): DataStatus {
  if (feedStatus === "loading") return "loading";
  if (feedStatus === "error") return "error";
  if (feedMode === "demo") return "demo";
  if (feedMode === "stale") return "stale";
  if (feedMode === "live" && visibleCount > 0) return "live";
  return "empty";
}

export function statusLabel(status: DataStatus) {
  if (status === "live") return "Live data active";
  if (status === "demo") return "Demo scenario active";
  if (status === "stale") return "Stale data with last known records";
  if (status === "loading") return "Syncing live data";
  if (status === "error") return "API unavailable with demo fallback";
  return "No visible live signals; demo fallback requested";
}

export function recommendationFor(ticket?: QueueTicket) {
  if (!ticket) return "Select a signal to inspect deterministic recommendation details.";
  if (ticket.ticketId === "INC-4821") return "Route to mechanical team and schedule bearing replacement.";
  return ticket.recommendation;
}

export function sourceFor(ticket?: QueueTicket) {
  if (!ticket) return "--";
  return ticket.requester || "machine telemetry + operator ticket";
}

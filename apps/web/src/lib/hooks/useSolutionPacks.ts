"use client";

import { useCallback, useEffect, useState } from "react";
import { praxisClient, type SolutionPack } from "@/lib/praxis-client";

const IS_DEMO = typeof window !== "undefined" && window.location.hostname.includes("vercel.app");

const DEMO_PACKS: SolutionPack[] = [
  {
    id: "manufacturing-printer-gpo",
    name: "Manufacturing Printer Deployment Failure",
    industry: "Manufacturing",
    buyer: "VP of Manufacturing Operations",
    primary_pain: "Recurring printer GPO failures delay shipments by 4-6 hours per incident",
    demo_length_minutes: 7,
    event_count: 12,
    sources: ["active_directory", "print_server", "helpdesk", "network_monitor", "observability", "erp_shipping", "sccm_client"],
    eventCount: 12,
    score: "0.77",
    annualValue: "$38,482",
    status: "production",
    rootCause: "printer_deployment_policy_drift",
    recommendedAction: "approve_remediation",
    priorityScore: 0.7708,
    evidenceTrust: 0.829,
    valueConfidence: 0.77,
    nextBestQuestions: ["delayed_shipments", "support_hours", "vendor_escalations"],
    objectsCreated: 12,
    linksCreated: 45,
    mappingConfidence: 0.84,
    primaryValueDriver: "Downtime reduction",
    technicalPersona: "Active Directory Administrator",
  },
  {
    id: "erp-access-disruption",
    name: "ERP Access Disruption",
    industry: "Logistics",
    buyer: "Director of Supply Chain",
    primary_pain: "ERP access failures block warehouse operations for 2-3 hours per event",
    demo_length_minutes: 5,
    event_count: 9,
    sources: ["identity_provider", "erp_shipping", "helpdesk", "network_monitor", "wms_integration"],
    eventCount: 9,
    score: "0.72",
    annualValue: "$31,200",
    status: "staging",
    rootCause: "identity_provider_token_expiry",
    recommendedAction: "rotate_idp_tokens",
    priorityScore: 0.72,
    evidenceTrust: 0.78,
    valueConfidence: 0.72,
    nextBestQuestions: ["wms_sync_latency", "fallback_auth_configured"],
    objectsCreated: 8,
    linksCreated: 28,
    mappingConfidence: 0.79,
    primaryValueDriver: "Labor savings",
    technicalPersona: "Identity Platform Engineer",
  },
  {
    id: "k8s-ingress-degradation",
    name: "Kubernetes Ingress Degradation",
    industry: "Technology",
    buyer: "VP of Platform Engineering",
    primary_pain: "Ingress controller misconfiguration degrades API response times by 800%",
    demo_length_minutes: 6,
    event_count: 10,
    sources: ["kubernetes", "observability", "network_monitor", "gitops", "helpdesk", "ingress_controller"],
    eventCount: 10,
    score: "0.75",
    annualValue: "$35,600",
    status: "staging",
    rootCause: "ingress_annotation_drift",
    recommendedAction: "rollback_ingress_config",
    priorityScore: 0.75,
    evidenceTrust: 0.86,
    valueConfidence: 0.75,
    nextBestQuestions: ["replica_count", "node_pool_utilization"],
    objectsCreated: 10,
    linksCreated: 38,
    mappingConfidence: 0.87,
    primaryValueDriver: "API availability",
    technicalPersona: "Platform SRE",
  },
];

export function useSolutionPacks() {
  const [packs, setPacks] = useState<SolutionPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    if (IS_DEMO) {
      setPacks(DEMO_PACKS);
      setLoading(false);
      return;
    }

    praxisClient
      .listSolutionPacks()
      .then(setPacks)
      .catch((err) => setError(err instanceof Error ? err : new Error("Could not load packs")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { packs, loading, error, reload: load, isDemo: IS_DEMO };
}

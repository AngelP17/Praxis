import {
  getPackIdForScenario,
  getScenarioById,
  getScenarioByTicketId,
  getScenarioForPack,
  SCENARIOS,
  type Scenario,
} from "@/lib/scenarios";
import { getDemoProof } from "@/lib/praxis-demo-data";

export type ActiveCase = {
  scenario: Scenario;
  scenarioId: string;
  packId: string;
  ticketId: string;
  incidentId: string;
  runId: string;
  proofHref: string;
};

export function caseFromScenario(scenario: Scenario): ActiveCase {
  const packId = getPackIdForScenario(scenario.id);
  const proof = getDemoProof(packId);
  return {
    scenario,
    scenarioId: scenario.id,
    packId,
    ticketId: scenario.ticketId,
    incidentId: scenario.incidentId,
    runId: proof.run_id,
    proofHref: `/proof/${proof.run_id}?pack=${packId}`,
  };
}

export function getActiveCase(packId?: string | null, scenarioId?: string | null, ticketId?: string | null): ActiveCase {
  if (ticketId) return caseFromScenario(getScenarioByTicketId(ticketId));
  if (scenarioId) return caseFromScenario(getScenarioById(scenarioId));
  if (packId) return caseFromScenario(getScenarioForPack(packId));
  return caseFromScenario(SCENARIOS[0]);
}

export function activeCaseParams(activeCase: ActiveCase) {
  const params = new URLSearchParams();
  params.set("pack", activeCase.packId);
  params.set("scenario", activeCase.scenarioId);
  params.set("ticket", activeCase.ticketId);
  return params;
}

export function hrefWithActiveCase(pathname: string, activeCase: ActiveCase, extra?: Record<string, string | undefined>) {
  const params = activeCaseParams(activeCase);
  Object.entries(extra ?? {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return `${pathname}?${params.toString()}`;
}

export {
  formatCurrency,
  formatPercent,
  praxisClient,
  type ActionCaptureResponse,
  type FieldLabExecuteResponse,
  type FieldLabRun,
  type FieldLabTimeline,
  type PraxisProof,
  type ProofVerificationResponse,
  type SolutionPack,
  type SolutionPackId,
} from "@/lib/praxis-client";

import type { SolutionPack } from "@/lib/praxis-client";

export function getPackById(_id: string): SolutionPack | undefined {
  return undefined;
}

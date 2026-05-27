"use client";

import { useCallback, useEffect, useState } from "react";
import {
  praxisClient,
  type PraxisProof,
  type ProofVerificationResponse,
} from "@/lib/praxis-client";
import { getDemoProof } from "@/lib/praxis-demo-data";
import { IS_DEMO_MODE } from "@/lib/demo-mode";

export function useProof(packId: string) {
  const [proof, setProof] = useState<PraxisProof | null>(null);
  const [verification, setVerification] = useState<ProofVerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    if (!packId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setVerification(null);

    if (IS_DEMO_MODE) {
      // On Vercel, show static demo data, API Gateway deploys separately
      const demoProof = getDemoProof(packId);
      setProof(demoProof);
      setVerification({ valid: true, proof_hash: demoProof.proof_hash, status: "verified", errors: [] });
      setLoading(false);
      return;
    }

    praxisClient
      .getProofByPack(packId)
      .then(async (nextProof) => {
        setProof(nextProof);
        setVerification(await praxisClient.verifyProof(nextProof));
      })
      .catch((err) => setError(err instanceof Error ? err : new Error("Could not load proof")))
      .finally(() => setLoading(false));
  }, [packId]);

  useEffect(() => {
    load();
  }, [load]);

  return { proof, verification, loading, error, reload: load, isDemo: IS_DEMO_MODE };
}

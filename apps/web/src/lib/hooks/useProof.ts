"use client";

import { useCallback, useEffect, useState } from "react";
import {
  praxisClient,
  type PraxisProof,
  type ProofVerificationResponse,
} from "@/lib/praxis-client";
import { DEMO_PROOF } from "@/lib/praxis-demo-data";

const IS_DEMO = typeof window !== "undefined" && window.location.hostname.includes("vercel.app");

export function useProof(packId: string) {
  const [proof, setProof] = useState<PraxisProof | null>(null);
  const [verification, setVerification] = useState<ProofVerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setVerification(null);

    if (IS_DEMO) {
      // On Vercel, show static demo data — API Gateway deploys separately
      setProof(DEMO_PROOF);
      setVerification({ valid: true, proof_hash: DEMO_PROOF.proof_hash, status: "verified", errors: [] });
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

  return { proof, verification, loading, error, reload: load, isDemo: IS_DEMO };
}

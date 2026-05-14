"use client";

import { useCallback, useEffect, useState } from "react";
import {
  praxisClient,
  type PraxisProof,
  type ProofVerificationResponse,
} from "@/lib/praxis-client";

export function useProof(packId: string) {
  const [proof, setProof] = useState<PraxisProof | null>(null);
  const [verification, setVerification] = useState<ProofVerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setVerification(null);
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

  return { proof, verification, loading, error, reload: load };
}

"use client";

import { BracketsCurly, Check, Copy } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useProof } from "@/lib/hooks/useProof";
import { praxisClient, type PraxisProof, type ProofVerificationResponse } from "@/lib/praxis-client";

interface ProofObjectViewerProps {
  packId?: string;
  proof?: PraxisProof | null;
  verification?: ProofVerificationResponse | null;
}

export function ProofObjectViewer({
  packId = "manufacturing-printer-gpo",
  proof: providedProof,
  verification: providedVerification,
}: ProofObjectViewerProps) {
  const live = useProof(packId);
  const proof = providedProof ?? live.proof;
  const [providedProofVerification, setProvidedProofVerification] =
    useState<ProofVerificationResponse | null>(providedVerification ?? null);
  const verification = providedProof ? providedProofVerification : live.verification;
  const loading = !providedProof && live.loading;
  const [copied, setCopied] = useState(false);
  const jsonString = proof ? JSON.stringify(proof, null, 2) : "";

  useEffect(() => {
    if (!providedProof) {
      setProvidedProofVerification(providedVerification ?? null);
      return;
    }
    let cancelled = false;
    praxisClient.verifyProof(providedProof).then((result) => {
      if (!cancelled) setProvidedProofVerification(result);
    });
    return () => {
      cancelled = true;
    };
  }, [providedProof, providedVerification]);

  const handleCopy = async () => {
    if (!jsonString) return;
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
          <BracketsCurly className="h-4 w-4 text-[var(--praxis-violet)]" />
          Proof object
        </div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!proof}
          className="flex items-center gap-2 border border-[var(--praxis-line)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-muted)] transition hover:scale-105 hover:text-[var(--praxis-bone)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {copied ? <Check className="h-3 w-3 text-[var(--praxis-mint)]" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy JSON"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--praxis-muted)]">
        <span>Verifier: <span className={verification?.valid ? "text-[var(--praxis-mint)]" : "text-[var(--praxis-muted)]"}>{verification?.status ?? "pending"}</span></span>
        <span>Hash: <span className="text-[var(--praxis-bone)]">{proof?.proof_hash ?? "pending"}</span></span>
      </div>

      <pre className="mt-5 max-h-[560px] overflow-auto border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4 font-mono text-xs leading-relaxed text-[var(--praxis-muted)]">
        {loading ? "Loading proof object from /api/proofs..." : jsonString}
      </pre>
    </article>
  );
}

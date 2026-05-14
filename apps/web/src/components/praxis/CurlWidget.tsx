"use client";

import { useState, useCallback } from "react";
import { BracketsCurly, Check, Copy } from "@phosphor-icons/react";
import { PraxisMark } from "./PraxisMark";

interface CurlWidgetProps {
  proofHash?: string;
  packId?: string;
  showDeterminism?: boolean;
}

export function CurlWidget({
  proofHash = "",
  packId = "manufacturing-printer-gpo",
  showDeterminism = true,
}: CurlWidgetProps) {
  const [copied, setCopied] = useState(false);
  const [determinismChecked, setDeterminismChecked] = useState(false);
  const [determinismResult, setDeterminismResult] = useState<boolean | null>(null);

  const verifyCommand = `uvx praxis-verify artifacts/latest/${packId}/praxis_proof.json`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(verifyCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeterminismCheck = useCallback(async () => {
    setDeterminismChecked(true);
    setDeterminismResult(null);
    try {
      const res = await fetch(`/api/proofs/${packId}/replay`);
      if (res.ok) {
        const data = await res.json();
        setDeterminismResult(data.equal === true);
      } else {
        setDeterminismResult(false);
      }
    } catch {
      setDeterminismResult(false);
    }
  }, [packId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] px-4 py-3">
        <BracketsCurly className="h-5 w-5 text-[var(--praxis-violet)] shrink-0" />
        <code className="flex-1 overflow-x-auto font-mono text-xs text-[var(--praxis-muted)]">
          {verifyCommand}
        </code>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 border border-[var(--praxis-line)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-muted)] transition-all duration-700 hover:scale-105 hover:text-[var(--praxis-bone)]"
        >
          {copied ? <Check className="h-3 w-3 text-[var(--praxis-mint)]" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {showDeterminism && (
        <button
          onClick={handleDeterminismCheck}
          disabled={determinismChecked}
          className={`flex items-center gap-2 w-full border p-3 font-mono text-[10px] uppercase tracking-[0.1em] transition-all duration-700 ${
            determinismResult === true
              ? "border-[var(--praxis-mint)] bg-[rgba(62,255,168,0.04)] text-[var(--praxis-mint)]"
              : determinismResult === false
                ? "border-[var(--praxis-crit)] bg-[rgba(239,68,68,0.04)] text-[var(--praxis-crit)]"
                : "border-[var(--praxis-line)] text-[var(--praxis-muted)] hover:scale-105"
          }`}
          >
          <PraxisMark size={16} />
          {determinismChecked
            ? determinismResult
              ? "Determinism Verified — Hashes Match"
              : "Determinism Failed — Hashes Diverge"
            : "Check Replay Determinism"}
        </button>
      )}
    </div>
  );
}

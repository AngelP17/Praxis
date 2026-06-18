"use client";

import { useState } from "react";
import { DownloadSimple } from "@phosphor-icons/react";
import { authFetch } from "@/lib/api";

export function ProofDownloadButton({
  packId,
  label = "Download proof JSON",
  className,
}: {
  packId: string;
  label?: string;
  className?: string;
}) {
  const [downloading, setDownloading] = useState(false);

  async function downloadProof() {
    if (downloading) return;
    setDownloading(true);
    try {
      const response = await authFetch(`/api/proofs/${packId}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Proof export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `praxis-proof-${packId}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={downloadProof}
      disabled={downloading}
      className={`transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] ${className ?? "inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[var(--praxis-line)] px-7 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--praxis-bone)] disabled:opacity-60"}`}
    >
      <DownloadSimple className="h-4 w-4" />
      {downloading ? "Downloading" : label}
    </button>
  );
}

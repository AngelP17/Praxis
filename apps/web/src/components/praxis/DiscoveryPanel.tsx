"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Binoculars, GitBranch, Question } from "@phosphor-icons/react";

import { useProof } from "@/lib/hooks/useProof";
import { useSolutionPacks } from "@/lib/hooks/useSolutionPacks";

type DiscoverySnapshot = {
  object_candidates: Array<{ object_key?: string; object_type?: string; display_name?: string; confidence?: number }>;
  inferred_links: Array<{ source: string; target: string; relation?: string; confidence?: number }>;
  mapping_confidence: number;
  next_best_questions: Array<string | Record<string, unknown>>;
  recommended_solution_pack: string;
};

function questionText(entry: string | Record<string, unknown>) {
  if (typeof entry === "string") return entry;
  const question = typeof entry.question === "string" ? entry.question : null;
  const field = typeof entry.field === "string" ? entry.field : null;
  return question ?? field ?? "Missing field";
}

export function DiscoveryPanel({ packId = "manufacturing-printer-gpo" }: { packId?: string }) {
  const searchParams = useSearchParams();
  const resolvedPackId = searchParams.get("pack") ?? packId;
  const { proof } = useProof(resolvedPackId);
  const { packs } = useSolutionPacks();
  const [snapshot, setSnapshot] = useState<DiscoverySnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    const pack = packs.find((entry) => entry.id === resolvedPackId);
    const load = async () => {
      try {
        const response = await fetch("/api/discovery/discover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_signals: (proof?.evidence.sources ?? []).map((source) => ({ source })),
            adapter_profile: pack?.technicalPersona ?? "generic",
            customer_context: { packId: resolvedPackId, buyer: pack?.buyer, industry: pack?.industry },
          }),
        });
        if (!response.ok) throw new Error("Discovery unavailable");
        const data = await response.json();
        if (!cancelled) setSnapshot(data);
      } catch {
        if (!cancelled && proof) {
          setSnapshot({
            object_candidates: proof.evidence.sources.slice(0, proof.ontology.objects_created).map((source, index) => ({
              object_key: `${source}-${index}`,
              object_type: "Service",
              display_name: source.replace(/_/g, " "),
              confidence: proof.ontology.mapping_confidence,
            })),
            inferred_links: [
              { source: proof.evidence.sources[0] ?? "signal", target: proof.decision.root_cause_hypothesis, relation: "correlates_with", confidence: proof.decision.confidence },
            ],
            mapping_confidence: proof.ontology.mapping_confidence,
            next_best_questions: proof.decision.next_best_questions,
            recommended_solution_pack: resolvedPackId,
          });
        }
      }
    };
    if (proof) {
      void load();
    }
    return () => {
      cancelled = true;
    };
  }, [packs, proof, resolvedPackId]);

  if (!proof || !snapshot) return null;

  const recommendedPack = packs.find((entry) => entry.id === snapshot.recommended_solution_pack);

  return (
    <div className="grid grid-flow-dense gap-4 lg:grid-cols-12">
      <article className="lg:col-span-4 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <Binoculars className="h-10 w-10 text-[var(--praxis-violet)]" weight="duotone" />
        <div className="mt-8 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Recommended solution pack</div>
        <div className="mt-3 font-display text-4xl leading-tight">{recommendedPack?.name ?? snapshot.recommended_solution_pack}</div>
        <div className="mt-4 text-sm leading-6 text-[var(--praxis-muted)]">
          Mapping confidence {snapshot.mapping_confidence.toFixed(2)} across {snapshot.object_candidates.length} discovered objects.
        </div>
      </article>
      <article className="lg:col-span-4 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
          <GitBranch className="h-4 w-4 text-[var(--praxis-violet)]" />
          Inferred links
        </div>
        <div className="mt-5 space-y-3">
          {snapshot.inferred_links.map((link, index) => (
            <div key={`${link.source}-${link.target}-${index}`} className="border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)] p-4">
              <div className="text-sm">{link.source} → {link.target}</div>
              <div className="mt-1 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
                {link.relation ?? "correlates_with"} {typeof link.confidence === "number" ? `· conf ${link.confidence.toFixed(2)}` : ""}
              </div>
            </div>
          ))}
        </div>
      </article>
      <article className="lg:col-span-4 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
          <Question className="h-4 w-4 text-[var(--praxis-violet)]" />
          Next best questions
        </div>
        <div className="mt-5 space-y-3">
          {snapshot.next_best_questions.map((entry, index) => (
            <div key={`${questionText(entry)}-${index}`} className="border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)] p-4 text-sm leading-6">
              {questionText(entry)}
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

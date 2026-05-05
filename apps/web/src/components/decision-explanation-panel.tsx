"use client";

import { useState } from "react";
import { Info, CaretDown, CaretUp, Shield, Graph, ArrowsCounterClockwise, UserCheck } from "@phosphor-icons/react";
import type { DecisionExplanation } from "@/types";

export function DecisionExplanationPanel({
  explanation,
  compact = false,
}: {
  explanation?: DecisionExplanation;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(!compact);

  if (!explanation) {
    return (
      <div className="sv3-plate" style={{ padding: 12 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--sv3-muted)" }}>
          <Info size={12} />
          <span className="label" style={{ fontSize: 10 }}>Explanation pending</span>
        </div>
      </div>
    );
  }

  const integrity = explanation.integrity_score;
  const counterfactuals = explanation.counterfactuals;
  const factors = explanation.top_causal_factors ?? [];
  const missing = explanation.missing_evidence ?? [];
  const calibration = explanation.calibration_trace ?? [];

  return (
    <div className="sv3-plate" style={{ padding: 0, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="hover:opacity-80 hover:scale-[1.01] transition-all duration-300"
        style={{
          width: "100%", textAlign: "left",
          padding: "10px 14px",
          background: "transparent", border: 0, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          color: "var(--sv3-fg)",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Shield size={12} className="text-amber-200" />
          <span className="label" style={{ fontSize: 10 }}>Why this decision holds</span>
          {integrity && (
            <span className="mono" style={{ fontSize: 10, color: "var(--sv3-amber)" }}>
              I{integrity.integrity_score.toFixed(2)}
            </span>
          )}
        </span>
        {expanded ? <CaretUp size={11} /> : <CaretDown size={11} />}
      </button>

      {expanded && (
        <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Integrity score */}
          {integrity && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              <Metric label="Replayability" value={integrity.replayability} />
              <Metric label="Evidence" value={integrity.evidence_coverage} />
              <Metric label="Stability" value={integrity.counterfactual_stability} />
              <Metric label="Review" value={integrity.human_review_state} amber={integrity.human_review_state > 0} />
            </div>
          )}

          {/* Top causal factors */}
          {factors.length > 0 && (
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Graph size={11} />
                <span className="label" style={{ fontSize: 9 }}>Top causal factors</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {factors.map((f) => (
                  <div key={f.node_id} className="sv3-plate" style={{ padding: "6px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>{f.node_id}</span>
                      <span className="label" style={{ fontSize: 9, marginLeft: 8, color: "var(--sv3-subtle)" }}>{f.node_type}</span>
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--sv3-amber)" }}>
                      W{f.provenance_weight.toFixed(2)} &middot; C{f.confidence.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Counterfactuals */}
          {counterfactuals && counterfactuals.perturbations.length > 0 && (
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <ArrowsCounterClockwise size={11} />
                <span className="label" style={{ fontSize: 9 }}>Counterfactual replay</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>S{counterfactuals.stability_score.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {counterfactuals.perturbations.slice(0, 3).map((p, i) => (
                  <div key={i} className="sv3-plate" style={{ padding: "6px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "var(--sv3-fg)" }}>{p.name}</span>
                    <span className="mono" style={{ fontSize: 10, color: p.score_delta < 0 ? "var(--sv3-warn)" : "var(--sv3-ok)" }}>
                      {p.score_delta > 0 ? "+" : ""}{p.score_delta.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calibration trace */}
          {calibration.length > 0 && (
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <UserCheck size={11} />
                <span className="label" style={{ fontSize: 9 }}>Operator calibration</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {calibration.map((c, i) => (
                  <div key={i} className="sv3-plate" style={{ padding: "6px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "var(--sv3-fg)" }}>{c.operator_id} &middot; {c.feedback_type}</span>
                    <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>
                      {c.calibration_delta > 0 ? "+" : ""}{c.calibration_delta.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing evidence */}
          {missing.length > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--sv3-warn)" }}>
              <Info size={11} />
              <span className="label" style={{ fontSize: 9, color: "inherit" }}>Missing evidence: {missing.join(", ")}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, amber }: { label: string; value: number; amber?: boolean }) {
  return (
    <div className="sv3-plate" style={{ padding: "6px 8px", textAlign: "center" }}>
      <div className="label" style={{ fontSize: 8 }}>{label}</div>
      <div className="mono" style={{ fontSize: 13, marginTop: 4, color: amber ? "var(--sv3-amber)" : "var(--sv3-fg)" }}>
        {value.toFixed(2)}
      </div>
    </div>
  );
}

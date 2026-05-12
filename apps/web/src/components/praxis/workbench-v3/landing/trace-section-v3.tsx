"use client";

/** V3 trace section — five hash-tagged steps with amber rule and narrative copy.
 * Replaces v2's "How it works" cards with a continuous numbered rail. */

import { SvIco } from "@/components/praxis/workbench-v3/primitives";

const STEPS = [
  {
    n: "01",
    tag: "SIGNAL",
    title: "Fuse every operational input.",
    body: "Telemetry, ticket events, Kubernetes alerts, and operator notes flow into a single inbox. Lineage is preserved — every signal carries its source, hash, and timestamp.",
    icon: "Wave" as const,
  },
  {
    n: "02",
    tag: "DECISION",
    title: "Praxis ranks impact and proposes action.",
    body: "Each signal cluster is scored against active SLOs and business impact. The decision agent produces a priority, a recommended workflow, and a confidence band — never a hidden score.",
    icon: "Bolt" as const,
  },
  {
    n: "03",
    tag: "WORKFLOW",
    title: "Route to the right runbook with a checkpoint.",
    body: "Mid- and high-confidence actions are routed to mechanical, IAM, or platform runbooks. A human checkpoint pauses execution before anything irreversible — approve, edit, or reject with one keystroke.",
    icon: "Doc" as const,
  },
  {
    n: "04",
    tag: "FEEDBACK",
    title: "Capture the human's reasoning, not just the click.",
    body: "Every approval, override, and edit is recorded with rationale. Praxis uses these to recalibrate priors — the system learns the way your team actually operates, not what a generic policy assumes.",
    icon: "Q" as const,
  },
  {
    n: "05",
    tag: "REPLAY",
    title: "A signed, replayable trail of every decision.",
    body: "Each incident produces a hash-chained replay: signals, decision context, evidence, human inputs, and outcome. Auditors get an immutable record. Operators get a learning artifact.",
    icon: "Hash" as const,
  },
];

export function TraceSectionV3() {
  return (
    <section className="py-20" style={{ padding: "72px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <header style={{ marginBottom: 40 }}>
          <span className="label label-amber">[ Decision trace ]</span>
          <h2 style={{
            margin: "8px 0 0",
            fontSize: "clamp(1.8rem, 2.6vw, 2.4rem)",
            fontWeight: 600, letterSpacing: "-0.018em",
            color: "var(--sv3-fg)",
          }}>
            Five steps. Hash-chained end to end.
          </h2>
          <p style={{ marginTop: 12, maxWidth: 640, fontSize: 14, lineHeight: 1.65, color: "var(--sv3-muted)" }}>
            From the first signal to the final replay artifact, every transition is recorded,
            attributable, and reviewable. Praxis doesn't ask you to trust the model —
            it gives you the evidence to verify it.
          </p>
        </header>

        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 0 }}>
          {STEPS.map((s, i) => {
            const Icon = SvIco[s.icon];
            const last = i === STEPS.length - 1;
            return (
              <li key={s.n} style={{ position: "relative" }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr",
                  gap: 32,
                  padding: "24px 0",
                  borderTop: "1px solid var(--sv3-line)",
                  ...(last ? { borderBottom: "1px solid var(--sv3-line)" } : null),
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span className="num" style={{ fontSize: 36, color: "var(--sv3-amber)", letterSpacing: "-0.02em" }}>{s.n}</span>
                      <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)", letterSpacing: "0.2em" }}>/{STEPS.length.toString().padStart(2, "0")}</span>
                    </div>
                    <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, color: "var(--sv3-amber)" }}>
                      <Icon size={11} />
                      <span className="mono" style={{ fontSize: 10, color: "inherit", letterSpacing: "0.2em" }}>{s.tag}</span>
                    </div>
                  </div>

                  <div>
                    <h3 style={{
                      margin: 0,
                      fontSize: "clamp(1.15rem, 1.6vw, 1.45rem)",
                      fontWeight: 500, letterSpacing: "-0.012em",
                      color: "var(--sv3-fg)", lineHeight: 1.25,
                    }}>
                      {s.title}
                    </h3>
                    <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.65, color: "var(--sv3-muted)", maxWidth: 640 }}>
                      {s.body}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

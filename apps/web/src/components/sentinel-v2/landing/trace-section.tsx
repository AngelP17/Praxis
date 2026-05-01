"use client";

import { motion } from "framer-motion";

const steps = [
  {
    id: "signal",
    title: "Signal",
    description:
      "A vibration threshold breach on Press Line 3 triggers a composite telemetry event and an operator ticket within the same millisecond window.",
  },
  {
    id: "decision",
    title: "Decision",
    description:
      "Astraea scores the composite signal as P96 with 0.92 confidence, isolating bearing degradation as the root cause.",
  },
  {
    id: "workflow",
    title: "Workflow",
    description:
      "The orchestrator opens a mechanical route and schedules replacement without requiring human approval for standard degradation patterns.",
  },
  {
    id: "replay",
    title: "Replay",
    description:
      "The entire chain is hashed, linked, and exportable for audit or deterministic replay at any point in the future.",
  },
];

export function TraceSection() {
  return (
    <section className="trace-section relative min-h-[200vh]">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-32 md:flex-row sm:px-6 lg:px-8">
        <div className="md:sticky md:top-24 md:h-fit md:w-2/5">
          <div className="mono-data text-[10px] uppercase tracking-[0.18em] text-zinc-400">Trace</div>
          <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.1] tracking-tight text-zinc-50">
            The Decision Trace
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-400">
            How a raw signal becomes an auditable decision. Every step is immutable, hash-linked, and replayable.
          </p>
        </div>

        <div className="flex flex-col gap-20 md:w-3/5 md:gap-28">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0.4, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.55 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.03 }}
              className="trace-step-item"
            >
              <div className="flex items-baseline gap-4">
                <span className="mono-data text-[10px] text-zinc-500">0{index + 1}</span>
                <h3 className="font-display text-xl font-medium text-zinc-200">{step.title}</h3>
              </div>
              <motion.p
                initial={{ opacity: 0.3, x: 8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.06 + index * 0.03 }}
                className="trace-step-text mt-4 max-w-lg pl-8 text-base leading-8 text-zinc-300"
              >
                {step.description}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

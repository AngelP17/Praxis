"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

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
  const scope = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const pin = scope.current?.querySelector(".trace-pin");
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        if (!pin) return undefined;
        ScrollTrigger.create({
          trigger: scope.current,
          start: "top 12%",
          end: "bottom bottom",
          pin,
          pinSpacing: false,
        });
        return undefined;
      });

      gsap.fromTo(
        ".trace-step-item",
        { opacity: 0.72, y: 28, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.16,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".trace-gallery",
            start: "top 86%",
            end: "bottom 52%",
            scrub: true,
          },
        }
      );

      gsap.fromTo(
        ".trace-copy-word",
        { opacity: 0.48, y: 6 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.035,
          ease: "none",
          scrollTrigger: {
            trigger: ".trace-copy",
            start: "top 90%",
            end: "bottom 58%",
            scrub: true,
          },
        }
      );

      return () => mm.revert();
    },
    { scope }
  );

  return (
    <section ref={scope} className="trace-section relative px-4 py-24 sm:px-6 md:min-h-[145vh] md:py-32 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 md:flex-row">
        <div className="trace-pin md:h-fit md:w-2/5">
          <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.1] tracking-tight text-zinc-50">
            The Decision Trace
          </h2>
          <p className="trace-copy mt-5 max-w-sm text-sm leading-7 text-zinc-400">
            {"How a raw signal becomes an auditable decision. Every step is immutable, hash-linked, and replayable."
              .split(" ")
              .map((word, index) => (
                <span key={`${word}-${index}`} className="trace-copy-word inline-block pr-1">
                  {word}
                </span>
              ))}
          </p>
        </div>

        <div className="trace-gallery flex flex-col gap-8 md:w-3/5 md:gap-14">
          {steps.map((step, index) => (
            <article
              key={step.id}
              className="trace-step-item group relative overflow-hidden rounded-2xl border border-zinc-700/50 bg-zinc-900/45 p-6 transition-transform duration-700 ease-out hover:scale-[1.02]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20 grayscale contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url('https://picsum.photos/seed/aether-${step.id}/960/640')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/90 via-zinc-950/72 to-amber-950/18" />
              <div className="flex items-baseline gap-4">
                <span className="mono-data text-[10px] text-zinc-500">0{index + 1}</span>
                <h3 className="font-display text-xl font-medium text-zinc-200">{step.title}</h3>
              </div>
              <p className="trace-step-text relative mt-4 max-w-lg pl-8 text-base leading-8 text-zinc-300">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Play } from "@phosphor-icons/react";
import { SOLUTION_PACKS } from "@/lib/praxis-api";
import { getWorkflowRun, getFullProofHash } from "@/lib/praxis-workflow";
import { HiFiOverviewPanel, HiFiDecisionPanel, HiFiReadoutPanel } from "./HiFiPanels";

gsap.registerPlugin(ScrollTrigger);

const PLASMA = "#8B5CFF";
const ARGON = "#3EFFA8";
const BONE = "#F1EDDF";
const OBSIDIAN = "#0A0A14";
const SURFACE = "#13121F";
const LINE = "#2A263F";
const MUTE = "#86819F";
const FAINT = "#48455A";

function PraxisMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <g fill="currentColor">
        <polygon points="43,50 44.23,4.02 50,50" opacity="0.96" />
        <polygon points="50,50 44.23,4.02 56.77,48.78" opacity="0.48" />
        <polygon points="44.86,44.86 83.72,16.72 50,50" opacity="0.96" />
        <polygon points="50,50 83.72,16.72 55.14,55.14" opacity="0.5" />
        <polygon points="51.04,44.09 78.19,60.26 50,50" opacity="0.96" />
        <polygon points="50,50 78.19,60.26 48.96,55.91" opacity="0.48" />
        <polygon points="56.93,49.02 10.61,55.57 50,50" opacity="0.96" />
        <polygon points="50,50 10.61,55.57 43.07,50.98" opacity="0.5" />
        <polygon points="54.46,54.01 20.35,72.86 50,50" opacity="0.96" />
        <polygon points="50,50 20.35,72.86 45.54,45.99" opacity="0.5" />
        <polygon points="48.06,56.72 86.05,65.08 50,50" opacity="0.96" />
        <polygon points="50,50 86.05,65.08 51.94,43.28" opacity="0.48" />
      </g>
    </svg>
  );
}

function FloatingNav() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[18px] z-50 flex justify-center">
      <nav
        className="pointer-events-auto flex items-center gap-7 rounded-full border px-[14px] py-[10px] pl-[18px] backdrop-blur-xl"
        style={{ background: "rgba(15,14,31,0.7)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <Link href="/" className="flex items-center gap-[10px] border-r pr-[14px] transition-transform hover:scale-105" style={{ borderColor: "rgba(255,255,255,0.08)", color: BONE }}>
          <PraxisMark size={22} />
          <span className="font-display text-[17px] font-semibold tracking-[-0.02em]">Praxis</span>
        </Link>
        <div className="hidden items-center gap-[22px] font-mono text-[11px] uppercase tracking-[0.08em] md:flex" style={{ color: MUTE }}>
          <Link href="/solution-packs" className="transition-transform hover:scale-105 hover:text-[color:var(--bone)]" style={{ ["--bone" as string]: BONE }}>Platform</Link>
          <Link href="/field-workbench" className="transition-transform hover:scale-105 hover:text-[color:var(--bone)]" style={{ ["--bone" as string]: BONE }}>Workbench</Link>
          <Link href="/fieldlab" className="transition-transform hover:scale-105 hover:text-[color:var(--bone)]" style={{ ["--bone" as string]: BONE }}>FieldLab</Link>
          <Link href="/console" className="transition-transform hover:scale-105 hover:text-[color:var(--bone)]" style={{ ["--bone" as string]: BONE }}>Console</Link>
        </div>
        <Link
          href="/console"
          className="rounded-full px-[14px] py-[8px] font-mono text-[11px] font-medium uppercase tracking-[0.06em] transition-transform duration-300 hover:scale-105"
          style={{ background: BONE, color: OBSIDIAN }}
        >
          Request demo
        </Link>
      </nav>
    </div>
  );
}

function HeroSection() {
  return (
    <section
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 py-32 pt-[130px] text-center"
      style={{ color: BONE }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <radialGradient id="hg1" cx=".7" cy=".4" r=".7">
              <stop offset="0" stopColor={PLASMA} stopOpacity=".55" />
              <stop offset=".4" stopColor={ARGON} stopOpacity=".15" />
              <stop offset="1" stopColor={OBSIDIAN} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hg2" cx=".25" cy=".7" r=".5">
              <stop offset="0" stopColor={ARGON} stopOpacity=".35" />
              <stop offset="1" stopColor={OBSIDIAN} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="rb" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={PLASMA} stopOpacity="0" />
              <stop offset=".5" stopColor={PLASMA} stopOpacity=".8" />
              <stop offset="1" stopColor={ARGON} stopOpacity="0" />
            </linearGradient>
            <filter id="bl">
              <feGaussianBlur stdDeviation="22" />
            </filter>
          </defs>
          <rect width="1600" height="900" fill="url(#hg1)" />
          <rect width="1600" height="900" fill="url(#hg2)" />
          <g filter="url(#bl)" opacity=".85">
            <path d="M-100 540 Q 400 380 800 460 T 1700 360" stroke="url(#rb)" strokeWidth="60" fill="none" />
            <path d="M-100 620 Q 500 470 900 540 T 1700 460" stroke={ARGON} strokeOpacity=".25" strokeWidth="34" fill="none" />
            <path d="M-100 440 Q 600 280 1000 360 T 1700 280" stroke={PLASMA} strokeOpacity=".25" strokeWidth="28" fill="none" />
          </g>
        </svg>
      </div>

      <div
        data-reveal
        className="relative z-10 inline-flex items-center gap-2 rounded-full border px-[14px] py-[6px] font-mono text-[11px] tracking-[0.18em] uppercase backdrop-blur"
        style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(15,14,31,0.6)", color: MUTE }}
      >
        <span
          className="block h-[6px] w-[6px] rounded-full"
          style={{ background: ARGON, boxShadow: `0 0 12px ${ARGON}` }}
        />
        <span>Forward-deployed v1.0 &mdash; generally available</span>
      </div>

      <h1
        data-reveal
        className="relative z-10 mx-auto mt-[30px] max-w-[1180px] font-display font-medium"
        style={{
          fontSize: "clamp(3.2rem, 7.2vw, 6.4rem)",
          lineHeight: 0.96,
          letterSpacing: "-0.04em",
          textWrap: "balance" as const,
        }}
      >
        Turn messy operations<br />
        into an executable{" "}
        <span
          style={{
            background: `linear-gradient(110deg, ${PLASMA} 20%, ${ARGON} 85%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          decision graph
        </span>
        .
      </h1>

      <p
        data-reveal
        className="relative z-10 mx-auto mt-[28px] max-w-[580px] text-[17px] leading-[1.55]"
        style={{ color: MUTE }}
      >
        Praxis ingests signals from your tickets, telemetry, and tribal knowledge &mdash; then deploys explainable decisions, human-approved actions, and replayable audit artifacts. In the field, on day one.
      </p>

      <div data-reveal className="relative z-10 mt-[38px] flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/fieldlab"
          className="group inline-flex items-center gap-[10px] px-[22px] py-[14px] font-mono text-[12px] font-medium uppercase tracking-[0.1em] transition-transform duration-300 hover:-translate-y-[1px]"
          style={{ background: BONE, color: OBSIDIAN }}
        >
          Launch FieldLab <ArrowRight weight="bold" className="transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/executive-readout/manufacturing-printer-gpo"
          className="inline-flex items-center gap-[10px] border px-[22px] py-[14px] font-mono text-[12px] font-medium uppercase tracking-[0.1em] transition-transform hover:-translate-y-[1px]"
          style={{ color: BONE, borderColor: "rgba(255,255,255,0.16)" }}
        >
          <Play weight="fill" size={12} /> Watch 90-sec demo
        </Link>
      </div>

      <div
        className="absolute inset-x-6 bottom-9 z-10 flex justify-between font-mono text-[10px] uppercase tracking-[0.16em]"
        style={{ color: MUTE }}
      >
        <span>Deployed &middot; 4 plants &middot; 12 GTM teams &middot; 2 SE orgs</span>
        <span className="hidden md:block">SOC 2 &middot; Air-gapped &middot; Local-first</span>
      </div>
    </section>
  );
}

function CapabilitiesBento() {
  const proofHash = getFullProofHash("manufacturing-printer-gpo");
  return (
    <section id="what" className="relative py-32">
      <div className="mx-auto max-w-[1440px] px-8 py-[120px] md:py-[160px]">
        <div data-reveal className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: MUTE }}>
          What Praxis does
        </div>
        <h2
          data-reveal
          className="mb-[60px] mt-[18px] max-w-[1000px] font-display font-medium"
          style={{ fontSize: "clamp(2.4rem, 5vw, 4.8rem)", letterSpacing: "-0.035em", lineHeight: 1, textWrap: "balance" as const, color: BONE }}
        >
          Dashboards show state.<br />
          <span
            style={{
              background: `linear-gradient(110deg, ${PLASMA}, ${ARGON})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Praxis drives the decision.
          </span>
        </h2>

        <div className="grid grid-cols-12 grid-flow-dense gap-4">
          {/* 01 — Ontology — 5 col × 2 row */}
          <div
            data-reveal
            className="relative col-span-12 overflow-hidden border p-7 md:col-span-5 md:row-span-2"
            style={{ background: SURFACE, borderColor: LINE, minHeight: 460, color: BONE }}
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>
              01 &mdash; Operational Ontology
            </div>
            <h3 className="mt-4 font-display text-[32px] font-medium leading-[1.1]" style={{ letterSpacing: "-0.02em", textWrap: "balance" as const }}>
              Compile messy customer data into a queryable operational model.
            </h3>
            <p className="mt-[14px] max-w-[460px] text-[14.5px] leading-[1.6]" style={{ color: MUTE }}>
              Tickets, telemetry, asset inventory, ERP, runbooks &mdash; Praxis maps them into objects, links and governed actions with a confidence score you can show your CISO.
            </p>

            <svg viewBox="0 0 360 230" className="mt-7 w-full">
              <g stroke={LINE} strokeWidth="1" fill="none">
                <line x1="60" y1="60" x2="170" y2="40" />
                <line x1="170" y1="40" x2="290" y2="80" />
                <line x1="290" y1="80" x2="230" y2="170" />
                <line x1="60" y1="60" x2="80" y2="160" />
                <line x1="80" y1="160" x2="230" y2="170" />
              </g>
              <g fontFamily="Geist Mono, monospace" fontSize="10" fill={BONE}>
                <rect x="30" y="48" width="60" height="22" fill={SURFACE} stroke={FAINT} />
                <text x="60" y="63" textAnchor="middle">Site</text>
                <rect x="140" y="28" width="60" height="22" fill={SURFACE} stroke={FAINT} />
                <text x="170" y="43" textAnchor="middle">Asset</text>
                <rect x="260" y="68" width="64" height="22" fill={SURFACE} stroke={PLASMA} />
                <text x="292" y="83" textAnchor="middle" fill={PLASMA}>Incident</text>
                <rect x="200" y="158" width="60" height="22" fill={SURFACE} stroke={FAINT} />
                <text x="230" y="173" textAnchor="middle">Process</text>
                <rect x="50" y="148" width="60" height="22" fill={SURFACE} stroke={FAINT} />
                <text x="80" y="163" textAnchor="middle">Vendor</text>
              </g>
              <text x="50" y="210" fontFamily="Geist Mono, monospace" fontSize="9" fill={MUTE}>
                mapping_confidence 0.86 &middot; 9 object types &middot; 14 links
              </text>
            </svg>

            <div
              className="pointer-events-none absolute -bottom-20 -right-16 h-[260px] w-[260px] rounded-full"
              style={{ background: `radial-gradient(closest-side, ${PLASMA}66, transparent)`, filter: "blur(20px)" }}
            />
            <Link
              href="/ontology"
              className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors transition-transform hover:scale-105 hover:text-[color:var(--p)]"
              style={{ color: MUTE, ["--p" as string]: BONE }}
            >
              Open ontology map <ArrowRight size={12} weight="bold" />
            </Link>
          </div>

          {/* 02 — FieldLab — 7 col */}
          <div
            data-reveal
            className="relative col-span-12 overflow-hidden border p-7 md:col-span-7"
            style={{ background: SURFACE, borderColor: LINE, minHeight: 220, color: BONE }}
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>
              02 &mdash; FieldLab
            </div>
            <h3 className="mt-3 max-w-[540px] font-display text-[32px] font-medium leading-[1.1]" style={{ letterSpacing: "-0.02em" }}>
              A local AWS-compatible deployment twin you can demo from your laptop.
            </h3>
            <p className="mt-[14px] max-w-[540px] text-[14.5px] leading-[1.6]" style={{ color: MUTE }}>
              SQS, S3, DynamoDB, EventBridge, Lambda &mdash; running through Floci on{" "}
              <span className="font-mono" style={{ color: PLASMA }}>localhost:4566</span>. No cloud credentials, no production access required.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: MUTE }}>
              {["SQS", "S3", "DynamoDB", "EventBridge", "Lambda"].map((s) => (
                <span key={s} className="border px-2 py-1" style={{ borderColor: LINE, color: BONE }}>
                  {s}
                </span>
              ))}
            </div>
            <Link
              href="/fieldlab"
              className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-transform hover:translate-x-1"
              style={{ color: BONE }}
            >
              Start a local run <ArrowRight size={12} weight="bold" />
            </Link>
          </div>

          {/* 03 — Evidence Trust — 4 col */}
          <div
            data-reveal
            className="col-span-12 overflow-hidden border p-7 md:col-span-4"
            style={{ background: SURFACE, borderColor: LINE, minHeight: 220, color: BONE }}
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>
              03 &mdash; Evidence Trust
            </div>
            <h3 className="mt-3 font-display text-[24px] font-medium leading-[1.15]" style={{ letterSpacing: "-0.01em" }}>
              Grade the evidence behind every recommendation.
            </h3>
            <pre className="mt-[18px] whitespace-pre-wrap font-mono text-[11px] leading-[1.7]" style={{ color: MUTE }}>
{`evidence_trust =
  0.25 · source_reliability
+ 0.20 · freshness
+ 0.20 · corroboration
+ 0.15 · completeness
+ 0.10 · consistency
+ 0.10 · auditability`}
            </pre>
          </div>

          {/* 04 — Solution Packs — 3 col */}
          <div
            data-reveal
            className="col-span-12 overflow-hidden border p-7 md:col-span-3"
            style={{ background: SURFACE, borderColor: LINE, minHeight: 220, color: BONE }}
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>
              04 &mdash; Solution Packs
            </div>
            <h3 className="mt-3 font-display text-[24px] font-medium leading-[1.15]" style={{ letterSpacing: "-0.01em" }}>
              Repeatable customer scenarios.
            </h3>
            <ul className="mt-4 space-y-2 font-mono text-[11px]" style={{ color: MUTE }}>
              {SOLUTION_PACKS.slice(0, 3).map((p) => (
                <li key={p.id} className="flex items-center justify-between border-b pb-2" style={{ borderColor: LINE }}>
                  <Link href={`/proof/${p.id}`} className="truncate transition-transform hover:scale-105 hover:text-[color:var(--p)]" style={{ ["--p" as string]: BONE }}>
                    {p.name}
                  </Link>
                  <span style={{ color: ARGON }}>{p.score}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/solution-packs"
              className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-transform hover:translate-x-1"
              style={{ color: BONE }}
            >
              All packs <ArrowRight size={12} weight="bold" />
            </Link>
          </div>

          {/* 05 — Outcomes — full 12 col */}
          <div
            data-reveal
            className="col-span-12 overflow-hidden border p-9"
            style={{ background: SURFACE, borderColor: LINE, minHeight: 280, color: BONE }}
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>
              05 &mdash; Outcomes &middot; manufacturing-printer-gpo pilot
            </div>
            <div className="mt-6 grid grid-cols-2 grid-flow-dense gap-8 md:grid-cols-4">
              <div>
                <div className="font-display font-medium leading-[0.9]" style={{ fontSize: 64 }}>
                  7<span style={{ color: MUTE, fontSize: 26 }}>min</span>
                </div>
                <div className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em]" style={{ color: MUTE }}>
                  signal &rarr; readout
                </div>
              </div>
              <div>
                <div className="font-display font-medium leading-[0.9]" style={{ fontSize: 64 }}>0.82</div>
                <div className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em]" style={{ color: MUTE }}>
                  avg evidence trust
                </div>
              </div>
              <div>
                <div
                  className="font-display font-medium leading-[0.9]"
                  style={{
                    fontSize: 64,
                    background: `linear-gradient(110deg, ${PLASMA}, ${ARGON})`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  $38K
                </div>
                <div className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em]" style={{ color: MUTE }}>
                  demonstrated value &middot; gpo pilot
                </div>
              </div>
              <div>
                <div className="font-display font-medium leading-[0.9]" style={{ fontSize: 64 }}>
                  &minus;50<span style={{ color: MUTE, fontSize: 26 }}>%</span>
                </div>
                <div className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em]" style={{ color: MUTE }}>
                  recurrence in 10 weeks
                </div>
              </div>
            </div>
            <div
              className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4 font-mono text-[10.5px] uppercase tracking-[0.14em]"
              style={{ borderColor: LINE, color: MUTE }}
            >
              <span>proof_hash &middot; <span style={{ color: BONE }}>{proofHash.slice(0, 24)}&hellip;</span></span>
              <Link href={`/proof/manufacturing-printer-gpo`} className="inline-flex items-center gap-2 transition-transform hover:translate-x-1" style={{ color: ARGON }}>
                Inspect signed proof <ArrowRight size={12} weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PinnedShowcase() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return;

    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      endTrigger: track,
      end: "bottom bottom",
      pin: stage,
      pinSpacing: false,
      scrub: 0.6,
      onUpdate: (self) => {
        const idx = Math.min(2, Math.floor(self.progress * 3));
        setActive(idx);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const labels = ["01 / 03 — Operational Overview", "02 / 03 — Decision Detail", "03 / 03 — Executive Readout"];

  return (
    <section id="showcase" className="relative py-32">
      <div className="mx-auto max-w-[1440px] px-8 pb-[60px] pt-[120px] md:pt-[160px]">
        <div data-reveal className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: MUTE }}>
          Inside the workbench
        </div>
        <h2
          data-reveal
          className="mt-[18px] max-w-[1100px] font-display font-medium"
          style={{ fontSize: "clamp(2.4rem, 5vw, 4.8rem)", lineHeight: 1, letterSpacing: "-0.035em", textWrap: "balance" as const, color: BONE }}
        >
          Built for operators &mdash;<br />not for dashboards.
        </h2>
        <p
          data-reveal
          className="mt-[22px] max-w-[580px] text-[16px] leading-[1.6]"
          style={{ color: MUTE }}
        >
          Praxis is a single workbench across nine surfaces, pinned to the same operational graph. Below: the three that matter most.
        </p>
      </div>

      <div
        ref={stageRef}
        className="relative flex min-h-[720px] items-center justify-center overflow-hidden px-8 pb-[60px]"
        style={{ height: "100vh" }}
      >
        <div
          className="relative w-full max-w-[1440px] overflow-hidden border"
          style={{ aspectRatio: "16/10", maxHeight: 900, background: OBSIDIAN, borderColor: LINE, boxShadow: "0 60px 140px rgba(0,0,0,0.5)" }}
        >
          <div
            className="absolute -top-9 left-0 right-0 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{ color: MUTE }}
          >
            <span>{labels[active]}</span>
            <span>1440 &times; 900 &middot; live composition</span>
          </div>

          <div className={`absolute inset-0 transition-opacity duration-500 ${active === 0 ? "opacity-100" : "opacity-0"}`}>
            <HiFiOverviewPanel />
          </div>
          <div className={`absolute inset-0 transition-opacity duration-500 ${active === 1 ? "opacity-100" : "opacity-0"}`}>
            <HiFiDecisionPanel />
          </div>
          <div className={`absolute inset-0 transition-opacity duration-500 ${active === 2 ? "opacity-100" : "opacity-0"}`}>
            <HiFiReadoutPanel />
          </div>
        </div>
      </div>

      <div className="sticky bottom-10 z-30 flex -translate-y-8 justify-center gap-2">
        {["Overview", "Decision Detail", "Executive Readout"].map((label, i) => {
          const on = i === active;
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                setActive(i);
                const stage = stageRef.current;
                const track = trackRef.current;
                if (!stage || !track) return;
                const stageRect = stage.getBoundingClientRect();
                const trackRect = track.getBoundingClientRect();
                const total = trackRect.bottom - stageRect.top;
                const target = window.scrollY + stageRect.top + (total * (i + 0.5)) / 3;
                window.scrollTo({ top: target, behavior: "smooth" });
              }}
              className="rounded-full border px-3 py-[6px] font-mono text-[10px] uppercase tracking-[0.14em] backdrop-blur transition-transform hover:scale-105"
              style={{
                color: on ? BONE : MUTE,
                borderColor: on ? BONE : "rgba(255,255,255,0.08)",
                background: "rgba(15,14,31,0.6)",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div ref={trackRef} style={{ height: "240vh" }} />
    </section>
  );
}

function FlowRibbon() {
  const steps: Array<[string, string, string]> = [
    ["01", "Select pack", "12 packs available · printer-gpo (live)"],
    ["02", "Load context", "Industry · plant · buyer · vendors"],
    ["03", "Compile ontology", "mapping_confidence · 0.86"],
    ["04", "Start FieldLab", "floci :4566 · sqs · s3 · ddb"],
    ["05", "Stream events", "12 messy signals · 0.74 trust"],
    ["06", "Decide", "priority 0.74 · review required"],
    ["07", "Capture action", "human approval · audit hash 9f3a…"],
    ["08", "Generate readout", "$38.4K / yr · pdf · cfo-ready"],
  ];
  return (
    <section id="flow" className="relative py-32">
      <div className="mx-auto max-w-[1440px] px-8 pb-[60px] pt-[120px] md:pt-[160px]">
        <div data-reveal className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: MUTE }}>
          Signal &rarr; readout &middot; in seven minutes
        </div>
        <h2
          data-reveal
          className="mb-[60px] mt-[18px] max-w-[920px] font-display font-medium"
          style={{ fontSize: "clamp(2rem, 4.5vw, 4rem)", lineHeight: 1.02, letterSpacing: "-0.03em", textWrap: "balance" as const, color: BONE }}
        >
          The same workflow your forward-deployed team would run &mdash; but reproducible by anyone on your GTM org.
        </h2>

        <div data-stagger className="grid grid-cols-2 grid-flow-dense gap-3 md:grid-cols-4 xl:grid-cols-8">
          {steps.map(([n, t, d], i) => (
            <Link
              key={n}
              href={
                i === 0 ? "/solution-packs" :
                i === 3 ? "/fieldlab" :
                i === 5 ? "/decision" :
                i === 6 ? "/proof/manufacturing-printer-gpo" :
                i === 7 ? "/executive-readout/manufacturing-printer-gpo" :
                "/field-workbench"
              }
              className="relative flex min-h-[160px] flex-col gap-[10px] border p-4 transition-transform hover:-translate-y-[2px]"
              style={{ background: SURFACE, borderColor: LINE, color: BONE }}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: PLASMA }}>{n}</span>
              <span className="font-display text-[17px] font-medium leading-[1.15]" style={{ letterSpacing: "-0.01em" }}>{t}</span>
              <span className="mt-auto font-mono text-[10.5px]" style={{ color: MUTE }}>{d}</span>
              {i < steps.length - 1 && (
                <span className="absolute -right-[10px] top-1/2 hidden -translate-y-1/2 text-[16px] xl:block" style={{ color: FAINT }}>
                  &rarr;
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ActionCTA() {
  return (
    <section id="action" className="relative overflow-hidden px-8 py-32 pb-[120px] pt-[200px] text-center">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ opacity: 0.7 }}>
        <svg viewBox="0 0 1600 600" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <radialGradient id="ag" cx=".5" cy=".5" r=".6">
              <stop offset="0" stopColor={PLASMA} stopOpacity=".4" />
              <stop offset=".5" stopColor={ARGON} stopOpacity=".15" />
              <stop offset="1" stopColor={OBSIDIAN} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1600" height="600" fill="url(#ag)" />
        </svg>
      </div>
      <div data-reveal className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: MUTE }}>
        Take the workbench to a customer
      </div>
      <h2
        data-reveal
        className="mx-auto max-w-[1100px] font-display font-medium"
        style={{ fontSize: "clamp(3rem, 8vw, 7rem)", lineHeight: 0.94, letterSpacing: "-0.045em", textWrap: "balance" as const, color: BONE }}
      >
        Day one in the field.<br />
        <span
          style={{
            background: `linear-gradient(110deg, ${PLASMA}, ${ARGON})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Decision graph on day two.
        </span>
      </h2>
      <div data-reveal className="mt-[56px] flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/console"
          className="inline-flex items-center gap-[10px] px-[22px] py-[14px] font-mono text-[12px] font-medium uppercase tracking-[0.1em] transition-transform duration-300 hover:-translate-y-[1px]"
          style={{ background: BONE, color: OBSIDIAN }}
        >
          Book a deployment review <ArrowRight weight="bold" />
        </Link>
        <Link
          href="/solution-packs"
          className="inline-flex items-center gap-[10px] border px-[22px] py-[14px] font-mono text-[12px] font-medium uppercase tracking-[0.1em] transition-transform hover:-translate-y-[1px]"
          style={{ color: BONE, borderColor: "rgba(255,255,255,0.16)" }}
        >
          Open the docs
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  const cols: Array<[string, Array<[string, string]>]> = [
    ["Platform", [["FieldLab", "/fieldlab"], ["Ontology Compiler", "/ontology"], ["Decision Engine", "/decision"], ["Value Case", "/value-case"]]],
    ["For roles", [["Solutions Engineering", "/solution-packs"], ["GTM Engineering", "/solution-packs"], ["Forward-deployed", "/console"], ["Platform / SRE", "/field-workbench"]]],
    ["Resources", [["Solution packs", "/solution-packs"], ["Implementation plans", "/executive-readout"], ["Security review", "/audit"], ["Changelog", "/reports"]]],
  ];
  return (
    <>
      <footer
        className="mx-auto grid max-w-[1440px] grid-cols-1 grid-flow-dense gap-10 border-t px-8 pb-10 pt-[60px] text-[13px] md:grid-cols-[2fr_repeat(3,1fr)]"
        style={{ borderColor: LINE, color: MUTE }}
      >
        <div>
          <Link href="/" className="flex items-center gap-[10px] transition-transform hover:scale-105" style={{ color: BONE }}>
            <PraxisMark size={22} />
            <span className="font-display text-[22px] font-semibold">Praxis</span>
          </Link>
          <p className="mt-[18px] max-w-[360px] leading-[1.6]">
            A forward-deployed operating layer for messy enterprise workflows. Built for operators, by operators.
          </p>
        </div>
        {cols.map(([heading, items]) => (
          <div key={heading}>
            <h4 className="mb-[14px] font-mono text-[10.5px] font-medium uppercase tracking-[0.16em]" style={{ color: BONE }}>
              {heading}
            </h4>
            <ul className="m-0 flex list-none flex-col gap-[10px] p-0">
              {items.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="transition-transform hover:scale-105 hover:text-[color:var(--p)]" style={{ ["--p" as string]: BONE }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </footer>
      <div
        className="mx-auto flex max-w-[1440px] justify-between border-t px-8 py-6 font-mono text-[10px] uppercase tracking-[0.12em]"
        style={{ borderColor: LINE, color: MUTE }}
      >
        <span>Praxis &middot; v1.0 &middot; 2026</span>
        <span>SOC 2 &middot; GDPR &middot; audit-ready</span>
      </div>
    </>
  );
}

export function PraxisLanding() {
  useEffect(() => {
    const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    const cleanups: Array<() => void> = [];
    reveals.forEach((el) => {
      const tween = gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
      cleanups.push(() => tween.kill());
    });
    const staggers = gsap.utils.toArray<HTMLElement>("[data-stagger]");
    staggers.forEach((el) => {
      const tween = gsap.fromTo(
        el.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }
      );
      cleanups.push(() => tween.kill());
    });
    return () => {
      cleanups.forEach((fn) => fn());
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <main className="w-full max-w-full overflow-x-hidden" style={{ background: OBSIDIAN, color: BONE }}>
      <FloatingNav />
      <HeroSection />
      <CapabilitiesBento />
      <PinnedShowcase />
      <FlowRibbon />
      <ActionCTA />
      <Footer />
    </main>
  );
}

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BracketsCurly,
  Circuitry,
  Compass,
  Database,
  FileText,
  GitBranch,
  Graph,
  MapTrifold,
  ShieldCheck,
  Stack,
  TreeStructure,
  Waveform,
} from "@phosphor-icons/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const flow = ["Select", "Context", "Compile", "FieldLab", "Stream", "Decide", "Action", "Readout"];

export type PraxisScreenId =
  | "overview"
  | "solution-packs"
  | "fieldlab"
  | "ontology"
  | "decision"
  | "discovery"
  | "value-case"
  | "expansion"
  | "readout";

const workbenchNav: Array<[PraxisScreenId, string, string]> = [
  ["overview", "Overview", "/field-workbench"],
  ["solution-packs", "Solution Packs", "/solution-packs"],
  ["fieldlab", "FieldLab", "/fieldlab"],
  ["ontology", "Ontology", "/ontology"],
  ["decision", "Decision", "/decision"],
  ["discovery", "Discovery", "/discovery"],
  ["value-case", "Value Case", "/value-case"],
  ["expansion", "Expansion Map", "/expansion-map"],
  ["readout", "Executive Readout", "/executive-readout"],
];

const solutionPacks = [
  ["Manufacturing Printer GPO", "Director of Operations", "0.86", "$38.4K", "pilot now"],
  ["ERP Access Disruption", "IT Manager", "0.74", "$56.2K", "demo + scope"],
  ["K8s Ingress Degradation", "SRE Lead", "0.69", "$92.0K", "demo + scope"],
  ["Machine Cascade Maintenance", "Plant Engineer", "0.81", "$110K", "pilot now"],
];

const decisionWeights = [
  ["operational severity", 82, 16],
  ["business criticality", 91, 14],
  ["customer impact", 74, 13],
  ["recurrence risk", 68, 12],
  ["evidence trust", 82, 5],
];

function PraxisMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
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

function Spark({ color = "var(--praxis-violet)" }: { color?: string }) {
  return (
    <svg viewBox="0 0 180 54" className="h-12 w-full">
      <path d="M0 43 L16 36 L32 38 L48 25 L64 29 L80 16 L96 22 L112 12 L128 18 L144 8 L164 13 L180 6" fill="none" stroke={color} strokeWidth="2" />
      <path d="M0 52 L0 43 L16 36 L32 38 L48 25 L64 29 L80 16 L96 22 L112 12 L128 18 L144 8 L164 13 L180 6 L180 52 Z" fill={color} opacity="0.12" />
    </svg>
  );
}

function PraxisNav() {
  return (
    <nav className="fixed left-1/2 top-5 z-50 flex w-[min(1120px,calc(100%-32px))] -translate-x-1/2 items-center justify-between border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.76)] px-4 py-3 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-3 text-[var(--praxis-bone)] transition-transform duration-500 hover:scale-105">
        <PraxisMark className="h-8 w-8" />
        <span className="font-display text-xl font-medium tracking-normal">Praxis</span>
      </Link>
      <div className="hidden items-center gap-7 font-mono text-xs uppercase tracking-[0.14em] text-[var(--praxis-muted)] md:flex">
        <Link className="transition-transform duration-500 hover:scale-105" href="/field-workbench">Workbench</Link>
        <Link className="transition-transform duration-500 hover:scale-105" href="/solution-packs">Packs</Link>
        <Link className="transition-transform duration-500 hover:scale-105" href="/fieldlab">FieldLab</Link>
        <Link className="transition-transform duration-500 hover:scale-105" href="/executive-readout">Readout</Link>
      </div>
      <Link className="bg-[var(--praxis-bone)] px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-[var(--praxis-bg)] transition-transform duration-500 hover:scale-105" href="/command-center">
        Open
      </Link>
    </nav>
  );
}

function WorkbenchShell({ screen }: { screen: PraxisScreenId }) {
  return (
    <div className="grid min-h-[640px] overflow-hidden border border-[var(--praxis-line)] bg-[var(--praxis-bg)] text-[var(--praxis-bone)] md:grid-cols-[224px_1fr]">
      <aside className="hidden border-r border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5 md:flex md:flex-col">
        <div className="flex items-center gap-3">
          <PraxisMark className="h-7 w-7" />
          <span className="font-display text-xl font-medium">Praxis</span>
        </div>
        <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--praxis-muted)]">Workbench</div>
        <div className="mt-4 flex flex-col">
          {workbenchNav.map(([id, item, href]) => {
            const active = id === screen;
            return (
              <Link key={item} href={href} className={`border-l-2 px-4 py-2.5 text-sm transition-colors ${active ? "border-[var(--praxis-violet)] bg-[rgba(113,91,255,0.12)] text-[var(--praxis-bone)]" : "border-transparent text-[var(--praxis-muted)] hover:text-[var(--praxis-bone)]"}`}>
                {item}
              </Link>
            );
          })}
        </div>
        <div className="mt-auto border-t border-[var(--praxis-line)] pt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-muted)]">
          Ava Chen<br />
          Forward-deployed
        </div>
      </aside>
      <main className="min-w-0">
        {screen === "overview" && <OverviewScreen />}
        {screen === "solution-packs" && <SolutionPacksScreen />}
        {screen === "fieldlab" && <FieldLabScreen />}
        {screen === "ontology" && <OntologyScreen />}
        {screen === "decision" && <DecisionScreen />}
        {screen === "discovery" && <DiscoveryScreen />}
        {screen === "value-case" && <ValueCaseScreen />}
        {screen === "expansion" && <ExpansionScreen />}
        {screen === "readout" && <ReadoutScreen />}
      </main>
    </div>
  );
}

function OverviewScreen() {
  return (
    <div className="flex min-h-[640px] flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--praxis-line)] px-6 py-4">
        <div>
          <h3 className="font-display text-2xl font-medium">Operational Overview</h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Real-time posture · 7 sites · 24 active runs</p>
        </div>
        <button className="bg-[var(--praxis-violet)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bg)]">Export readout</button>
      </header>
      <div className="grid grid-flow-dense gap-4 p-6 lg:grid-cols-4">
        {[
          ["Mission Readiness", "98.6%", "+2.4% vs yesterday", "var(--praxis-mint)"],
          ["Active Operations", "24", "across 7 theaters", "var(--praxis-violet)"],
          ["Signal Quality", "93.2%", "stable", "var(--praxis-mint)"],
        ].map(([label, value, delta, color]) => (
          <article key={label} className="group min-h-36 overflow-hidden border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5 transition-transform duration-700 hover:scale-[1.02]">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">{label}</div>
            <div className="mt-4 font-display text-5xl font-medium">{value}</div>
            <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.08em]" style={{ color }}>{delta}</div>
            <Spark color={color} />
          </article>
        ))}
        <article className="row-span-2 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Alerts requiring action</div>
          <div className="mt-4 font-display text-4xl font-medium">3 open</div>
          <div className="mt-6 space-y-3">
            {["Network Anomaly", "Device Offline", "Intel Update"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-3">
                <span className={`h-2 w-2 rounded-full ${index === 1 ? "bg-[var(--praxis-crit)]" : "bg-[var(--praxis-mint)]"}`} />
                <div>
                  <div className="text-sm">{item}</div>
                  <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Georgia plant</div>
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="min-h-64 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5 lg:col-span-3">
          <div className="flex justify-between gap-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Signal density · last 24h</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--praxis-muted)]">Signals · Decisions · Actions</div>
          </div>
          <div className="mt-8 h-44">
            <Spark />
          </div>
        </article>
        {["Assets Online", "Incidents", "Data Ingested", "Response Time"].map((item, index) => (
          <article key={item} className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">{item}</div>
            <div className="mt-4 font-display text-4xl font-medium">{["1,248", "12", "4.7 TB", "02:34"][index]}</div>
          </article>
        ))}
      </div>
    </div>
  );
}

function SolutionPacksScreen() {
  return (
    <div className="min-h-[640px] p-6">
      <header className="flex flex-wrap items-start justify-between gap-5 border-b border-[var(--praxis-line)] pb-5">
        <div>
          <h3 className="font-display text-3xl font-medium">Solution Pack Launcher</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--praxis-muted)]">Repeatable GTM demos with scenario files, sample events, security answers, ROI assumptions, and implementation plans.</p>
        </div>
        <button className="bg-[var(--praxis-bone)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bg)]">Validate pack</button>
      </header>
      <div className="mt-6 grid grid-flow-dense gap-4 lg:grid-cols-12">
        {solutionPacks.map(([name, buyer, score, value, bucket], index) => (
          <article key={name} className={`group min-h-56 overflow-hidden border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5 transition-transform duration-700 hover:scale-[1.02] ${index === 0 ? "lg:col-span-6 lg:row-span-2" : "lg:col-span-3"}`}>
            <div className="flex items-start justify-between gap-4">
              <Stack className="h-8 w-8 text-[var(--praxis-mint)]" weight="duotone" />
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">{bucket}</span>
            </div>
            <h4 className={`${index === 0 ? "mt-14 text-5xl" : "mt-10 text-3xl"} font-display font-medium leading-none`}>{name}</h4>
            <div className="mt-7 grid grid-cols-3 gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Buyer</div>
                <div className="mt-1 text-sm">{buyer}</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Score</div>
                <div className="mt-1 font-display text-3xl text-[var(--praxis-violet)]">{score}</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Value</div>
                <div className="mt-1 font-display text-3xl text-[var(--praxis-mint)]">{value}</div>
              </div>
            </div>
          </article>
        ))}
        <article className="lg:col-span-6 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Pack contents</div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
            {["scenario", "context", "events", "ontology", "demo script", "roi model", "objections", "security", "implementation"].map((item) => (
              <div key={item} className="border border-[var(--praxis-line)] px-3 py-2 text-[var(--praxis-muted)]">{item}</div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function FieldLabScreen() {
  return (
    <div className="min-h-[640px] p-6">
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[var(--praxis-line)] pb-5">
        <div>
          <h3 className="font-display text-3xl font-medium">FieldLab Environment</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--praxis-muted)]">Floci-backed local AWS substrate for queues, archives, state, workflow events, and replay proof before production access.</p>
        </div>
        <button className="bg-[var(--praxis-mint)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bg)]">Start run</button>
      </header>
      <div className="mt-6 grid grid-flow-dense gap-4 lg:grid-cols-12">
        <article className="lg:col-span-5 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
          <Circuitry className="h-10 w-10 text-[var(--praxis-violet)]" weight="duotone" />
          <h4 className="mt-10 font-display text-5xl font-medium leading-none">localhost:4566</h4>
          <p className="mt-5 text-sm leading-6 text-[var(--praxis-muted)]">No cloud credentials. No customer production mutation. Everything is replayable from raw event archive to executive artifact.</p>
          <Spark color="var(--praxis-mint)" />
        </article>
        <article className="lg:col-span-7 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Workflow services</div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              ["SQS", "praxis-incident-events", "streaming"],
              ["S3", "praxis-audit-artifacts", "archiving"],
              ["DynamoDB", "PraxisIncidentState", "state"],
              ["EventBridge", "praxis-workflow-events", "routing"],
            ].map(([service, name, status]) => (
              <div key={name} className="border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4">
                <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-muted)]">
                  <span>{service}</span>
                  <span className="text-[var(--praxis-mint)]">{status}</span>
                </div>
                <div className="mt-4 font-display text-2xl">{name}</div>
              </div>
            ))}
          </div>
        </article>
        <article className="lg:col-span-12 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5">
          <div className="grid grid-flow-dense gap-3 md:grid-cols-6">
            {flow.slice(2).map((item, index) => (
              <div key={item} className="border border-[var(--praxis-line)] p-4">
                <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">run {index + 1}</div>
                <div className="mt-4 font-display text-2xl">{item}</div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function OntologyScreen() {
  const nodes = ["Site", "Asset", "Incident", "Ticket", "Vendor", "Runbook", "Stakeholder", "BusinessProcess"];
  return (
    <div className="min-h-[640px] p-6">
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[var(--praxis-line)] pb-5">
        <div>
          <h3 className="font-display text-3xl font-medium">Operational Ontology</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--praxis-muted)]">Messy records become objects, links, action types, value metrics, confidence, and discovery gaps.</p>
        </div>
        <button className="bg-[var(--praxis-violet)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bg)]">Compile</button>
      </header>
      <div className="mt-6 grid grid-flow-dense gap-4 lg:grid-cols-12">
        <article className="lg:col-span-8 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Object graph</div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {nodes.map((node, index) => (
              <div key={node} className="group min-h-28 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4 transition-transform duration-700 hover:scale-105">
                <TreeStructure className="h-6 w-6 text-[var(--praxis-mint)]" />
                <div className="mt-5 font-display text-2xl">{node}</div>
                <div className="mt-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">{index + 2} links</div>
              </div>
            ))}
          </div>
        </article>
        <article className="lg:col-span-4 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Mapping confidence</div>
          <div className="mt-5 font-display text-7xl text-[var(--praxis-mint)]">0.78</div>
          <div className="mt-8 space-y-4">
            {["schema coverage", "field consistency", "relationship density", "source reliability", "semantic match"].map((item, index) => (
              <div key={item}>
                <div className="mb-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">{item}</div>
                <div className="h-2 bg-[var(--praxis-line)]"><div className="h-full bg-[var(--praxis-violet)]" style={{ width: `${86 - index * 7}%` }} /></div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function DecisionScreen() {
  return (
    <div className="flex min-h-[640px] flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--praxis-line)] px-6 py-4">
        <div>
          <h3 className="font-display text-2xl font-medium">Decision · GA-PRINT-GPO-042</h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-violet)]">review required</p>
        </div>
        <button className="bg-[var(--praxis-violet)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bg)]">Route action</button>
      </header>
      <div className="grid grid-flow-dense gap-4 p-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Praxis priority</div>
          <div className="mt-5 font-display text-8xl font-medium text-[var(--praxis-violet)]">0.74</div>
          <p className="mt-5 max-w-md text-sm leading-6 text-[var(--praxis-muted)]">
            Printer deployment policy drift is delaying shipping documentation and needs assisted human-approved routing.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="border border-[var(--praxis-line)] p-4">
              <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Evidence trust</div>
              <div className="mt-2 font-display text-4xl text-[var(--praxis-mint)]">0.82</div>
            </div>
            <div className="border border-[var(--praxis-line)] p-4">
              <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Mode</div>
              <div className="mt-2 font-display text-4xl">Human</div>
            </div>
          </div>
        </article>
        <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Rationale weights</div>
          <div className="mt-6 space-y-4">
            {decisionWeights.map(([label, value, weight]) => (
              <div key={label}>
                <div className="mb-2 grid grid-cols-[1fr_auto_auto] gap-4 font-mono text-[10px] uppercase tracking-[0.08em]">
                  <span className="text-[var(--praxis-muted)]">{label}</span>
                  <span>{value}</span>
                  <span className="text-[var(--praxis-muted)]">w {weight}</span>
                </div>
                <div className="h-2 bg-[var(--praxis-line)]">
                  <div className="h-full bg-[var(--praxis-violet)]" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Next best question</div>
            <p className="mt-3 text-sm text-[var(--praxis-bone)]">How many production minutes were lost or delayed?</p>
          </div>
        </article>
      </div>
    </div>
  );
}

function DiscoveryScreen() {
  return (
    <div className="min-h-[640px] p-6">
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[var(--praxis-line)] pb-5">
        <div>
          <h3 className="font-display text-3xl font-medium">Discovery · VOI</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--praxis-muted)]">When confidence is low, Praxis ranks the next customer question by business impact and decision sensitivity.</p>
        </div>
        <button className="bg-[var(--praxis-bone)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bg)]">Open brief</button>
      </header>
      <div className="mt-6 grid grid-flow-dense gap-4 lg:grid-cols-12">
        <article className="lg:col-span-5 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
          <Compass className="h-10 w-10 text-[var(--praxis-violet)]" weight="duotone" />
          <h4 className="mt-10 font-display text-5xl font-medium leading-none">Ask less. Learn more.</h4>
          <p className="mt-5 text-sm leading-6 text-[var(--praxis-muted)]">Ranked questions prevent discovery from becoming a generic interview and focus the next field conversation.</p>
        </article>
        <article className="lg:col-span-7 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Next best questions</div>
          <div className="mt-6 space-y-3">
            {[
              ["downtime_minutes", "How many production minutes were lost or delayed?", "0.18"],
              ["asset_owner", "Who owns the affected asset or system?", "0.11"],
              ["vendor_sla", "What SLA applies to the current vendor?", "0.09"],
              ["affected_department", "Which department absorbs the operational delay?", "0.07"],
            ].map(([field, question, gain]) => (
              <div key={field} className="grid gap-4 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-violet)]">{field}</div>
                  <div className="mt-2 text-sm">{question}</div>
                </div>
                <div className="font-display text-3xl text-[var(--praxis-mint)]">{gain}</div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function ValueCaseScreen() {
  return (
    <div className="min-h-[640px] p-6">
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[var(--praxis-line)] pb-5">
        <div>
          <h3 className="font-display text-3xl font-medium">Value Case Builder</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--praxis-muted)]">ROI assumptions, formulas, confidence, and evidence references become a CFO-ready value case.</p>
        </div>
        <button className="bg-[var(--praxis-mint)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bg)]">Recalculate</button>
      </header>
      <div className="mt-6 grid grid-flow-dense gap-4 lg:grid-cols-12">
        <article className="lg:col-span-4 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
          <FileText className="h-10 w-10 text-[var(--praxis-mint)]" weight="duotone" />
          <div className="mt-10 font-display text-7xl text-[var(--praxis-mint)]">$38.4K</div>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">estimated annual value</div>
          <p className="mt-7 text-sm leading-6 text-[var(--praxis-muted)]">Based on 12 monthly incidents, triage reduction, labor cost, and shipment delay avoidance.</p>
        </article>
        <article className="lg:col-span-8 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Assumptions</div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              ["incidents per month", "12"],
              ["minutes lost per incident", "35"],
              ["loaded labor rate", "$48/hr"],
              ["shipment delay cost", "$250/hr"],
              ["current triage", "45 min"],
              ["praxis triage", "12 min"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-end justify-between border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4">
                <span className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">{label}</span>
                <span className="font-display text-3xl">{value}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function ExpansionScreen() {
  return (
    <div className="min-h-[640px] p-6">
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[var(--praxis-line)] pb-5">
        <div>
          <h3 className="font-display text-3xl font-medium">Expansion Map</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--praxis-muted)]">The first workflow expands through shared data models, stakeholder overlap, implementation reuse, and executive visibility.</p>
        </div>
        <button className="bg-[var(--praxis-violet)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bg)]">Prioritize</button>
      </header>
      <div className="mt-6 grid grid-flow-dense gap-4 lg:grid-cols-12">
        <article className="lg:col-span-5 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
          <MapTrifold className="h-10 w-10 text-[var(--praxis-violet)]" weight="duotone" />
          <h4 className="mt-10 font-display text-5xl font-medium leading-none">Printer GPO failure</h4>
          <p className="mt-5 text-sm leading-6 text-[var(--praxis-muted)]">Initial proof path for manufacturing operations, IT management, and CFO value narrative.</p>
        </article>
        <article className="lg:col-span-7 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Adjacent use cases</div>
          <div className="mt-6 space-y-3">
            {[
              ["asset inventory accuracy", "0.82"],
              ["vendor SLA tracking", "0.78"],
              ["ticket routing", "0.73"],
              ["ERP access incidents", "0.68"],
              ["plant downtime reporting", "0.66"],
              ["security quarantine workflow", "0.61"],
            ].map(([label, score]) => (
              <div key={label} className="grid grid-cols-[1fr_auto] gap-4 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4">
                <span className="text-sm">{label}</span>
                <span className="font-display text-3xl text-[var(--praxis-mint)]">{score}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function ReadoutScreen() {
  return (
    <div className="grid min-h-[640px] gap-4 p-6 lg:grid-cols-[1.15fr_0.85fr]">
      <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)]">Executive readout</div>
        <h3 className="mt-8 max-w-3xl font-display text-6xl font-medium leading-[0.96] tracking-normal">
          Printer GPO failure costs <span className="text-[var(--praxis-mint)]">$38.4K</span> per year.
        </h3>
        <p className="mt-8 max-w-xl text-base leading-7 text-[var(--praxis-muted)]">
          Praxis found repeat deployment drift, linked it to shipping documentation delays, and produced an approval-safe remediation path with replayable evidence.
        </p>
        <div className="mt-10 grid grid-flow-dense gap-3 md:grid-cols-3">
          {["Evidence trust 0.82", "Priority 0.74", "Human approval required"].map((item) => (
            <div key={item} className="border border-[var(--praxis-line)] p-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-muted)]">{item}</div>
          ))}
        </div>
      </article>
      <aside className="space-y-4">
        {[
          ["Action", "Validate Point and Print policy, GPO read permissions, and local IP printer drift."],
          ["Expansion", "Asset governance, vendor SLA tracking, endpoint configuration drift."],
          ["Deployment", "Start read-only, prove in FieldLab, then enable assisted action with approval."],
        ].map(([title, copy]) => (
          <article key={title} className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5">
            <div className="font-display text-2xl font-medium">{title}</div>
            <p className="mt-3 text-sm leading-6 text-[var(--praxis-muted)]">{copy}</p>
          </article>
        ))}
      </aside>
    </div>
  );
}

function BentoCard({
  title,
  copy,
  icon: Icon,
  className = "",
}: {
  title: string;
  copy: string;
  icon: typeof Circuitry;
  className?: string;
}) {
  return (
    <article className={`group min-h-72 overflow-hidden border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6 transition-transform duration-700 hover:scale-[1.02] ${className}`}>
      <div className="flex items-start justify-between gap-6">
        <Icon className="h-8 w-8 text-[var(--praxis-mint)] transition duration-700 group-hover:scale-110" weight="duotone" />
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--praxis-muted)]">Praxis</span>
      </div>
      <h3 className="mt-14 max-w-sm font-display text-4xl font-medium leading-none tracking-normal">{title}</h3>
      <p className="mt-5 max-w-md text-sm leading-6 text-[var(--praxis-muted)]">{copy}</p>
    </article>
  );
}

function Storyboard() {
  return (
    <div className="grid grid-flow-dense gap-3 md:grid-cols-4">
      {flow.map((item, index) => (
        <article key={item} className="min-h-44 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-4">
          <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)]">
            <span>Step {String(index + 1).padStart(2, "0")}</span>
            <span className={index > 4 ? "text-[var(--praxis-mint)]" : "text-[var(--praxis-violet)]"}>{index > 4 ? "proof" : "field"}</span>
          </div>
          <h3 className="mt-8 font-display text-3xl font-medium">{item}</h3>
          <div className="mt-8 h-1 bg-[var(--praxis-line)]">
            <div className="h-full bg-[var(--praxis-violet)]" style={{ width: `${((index + 1) / flow.length) * 100}%` }} />
          </div>
        </article>
      ))}
    </div>
  );
}

export function PraxisExperience({ initialScreen = "overview" }: { initialScreen?: PraxisScreenId } = {}) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(".praxis-hero-copy", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.12 });

      gsap.utils.toArray<HTMLElement>(".praxis-stack-card").forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 120, scale: 0.86, opacity: 0.2 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: card, start: "top 92%", end: "top 32%", scrub: true },
          },
        );
        card.style.zIndex = String(index + 1);
      });

      ScrollTrigger.create({
        trigger: ".praxis-pinned",
        start: "top top",
        end: "bottom bottom",
        pin: ".praxis-pinned-copy",
        pinSpacing: false,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={rootRef} className="praxis-theme w-full max-w-full overflow-x-hidden bg-[var(--praxis-bg)] text-[var(--praxis-bone)]">
      <PraxisNav />

      <section className="relative flex min-h-[100dvh] items-center overflow-hidden px-5 py-36 md:px-10 md:py-44">
        <video className="absolute inset-0 h-full w-full object-cover opacity-[0.38] grayscale contrast-125" autoPlay muted loop playsInline poster="/praxis-assets/operator-poster.png">
          <source src="/praxis-assets/field-operator-loop.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(113,91,255,0.34),transparent_30%),radial-gradient(circle_at_72%_64%,rgba(62,255,168,0.18),transparent_24%),linear-gradient(180deg,rgba(10,10,20,0.58),var(--praxis-bg)_92%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center text-center">
          <h1 className="praxis-hero-copy max-w-6xl font-display text-[clamp(3rem,6vw,6.4rem)] font-medium leading-[0.92] tracking-normal">
            Turn messy operations into executable field proof.
          </h1>
          <p className="praxis-hero-copy mt-8 max-w-3xl text-lg leading-8 text-[var(--praxis-muted)]">
            Praxis converts customer-specific signals into ontology, FieldLab simulation, explainable decisions, human-approved actions, and executive-ready value cases.
          </p>
          <div className="praxis-hero-copy mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/field-workbench" className="group inline-flex items-center gap-3 bg-[var(--praxis-bone)] px-6 py-4 font-mono text-xs uppercase tracking-[0.12em] text-[var(--praxis-bg)] transition-transform duration-700 hover:scale-105">
              Launch workbench <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/executive-readout" className="inline-flex items-center gap-3 border border-[var(--praxis-bone)] px-6 py-4 font-mono text-xs uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform duration-700 hover:scale-105">
              View readout
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 py-32 md:px-10 md:py-48">
        <div className="mx-auto max-w-7xl">
          <h2 className="max-w-6xl font-display text-[clamp(2.8rem,5vw,5.8rem)] font-medium leading-[0.96] tracking-normal">
            Canvas language, now live
            <span className="mx-3 inline-block h-10 w-28 rounded-full bg-[url('/praxis-assets/pasted-1778618948193-0.png')] bg-cover bg-center align-middle grayscale contrast-125" />
            in the product.
          </h2>
          <div className="mt-16 grid grid-flow-dense gap-4 md:grid-cols-12">
            <BentoCard className="md:col-span-5" title="Operational ontology" copy="Compile sites, assets, incidents, stakeholders, actions, and value metrics into one inspectable customer model." icon={Graph} />
            <BentoCard className="md:col-span-4" title="Praxis FieldLab" copy="Reproduce customer workflows locally before production access, using Floci-backed queues, state, event buses, and audit archives." icon={Circuitry} />
            <BentoCard className="md:col-span-3" title="Solution packs" copy="Package demo scripts, security answers, ROI assumptions, sample events, and implementation plans." icon={Stack} />
            <BentoCard className="md:col-span-6" title="Value proof" copy="Translate implementation evidence into a CFO-ready annual value case and deployment plan." icon={Waveform} />
            <BentoCard className="md:col-span-3" title="Decision graph" copy="Show weighted priority, evidence trust, missing-data questions, and approval gates." icon={BracketsCurly} />
            <BentoCard className="md:col-span-3" title="Expansion map" copy="Turn the first workflow into adjacent account motion." icon={GitBranch} />
          </div>
        </div>
      </section>

      <section className="px-5 py-32 md:px-10 md:py-48">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-4xl font-display text-[clamp(2.8rem,5vw,5.6rem)] font-medium leading-[0.96] tracking-normal">Solution packs become GTM assets.</h2>
            <p className="max-w-md text-sm leading-6 text-[var(--praxis-muted)]">Pulled from the canvas catalog pattern: qualification score, buyer, value, and launch posture in one compact card.</p>
          </div>
          <div className="grid grid-flow-dense gap-4 md:grid-cols-4">
            {solutionPacks.map(([name, buyer, score, value, bucket]) => (
              <article key={name} className="group min-h-64 overflow-hidden border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5 transition-transform duration-700 hover:scale-[1.025]">
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">{buyer}</div>
                <h3 className="mt-5 min-h-20 font-display text-3xl font-medium leading-none">{name}</h3>
                <div className="mt-8 flex items-end justify-between">
                  <div>
                    <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">score</div>
                    <div className="font-display text-4xl text-[var(--praxis-violet)]">{score}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">{bucket}</div>
                    <div className="font-display text-3xl text-[var(--praxis-mint)]">{value}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="praxis-pinned relative grid grid-flow-dense gap-12 px-5 py-32 md:px-10 md:py-48 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="praxis-pinned-copy h-fit">
          <h2 className="max-w-xl font-display text-[clamp(2.8rem,5vw,5.6rem)] font-medium leading-[0.96] tracking-normal">The three hi-fi boards are now native screens.</h2>
          <p className="mt-7 max-w-md text-base leading-7 text-[var(--praxis-muted)]">All nine Field Workbench boards are now live screens with the same dense editorial rhythm as the reference canvas.</p>
        </div>
        <div className="space-y-10">
          {[initialScreen, ...workbenchNav.map(([id]) => id).filter((id) => id !== initialScreen)].map((screen) => (
            <article key={screen} className="praxis-stack-card sticky top-24 overflow-hidden transition-transform duration-700 hover:scale-[1.01]">
              <WorkbenchShell screen={screen} />
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 py-32 md:px-10 md:py-48">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-14 max-w-5xl font-display text-[clamp(2.8rem,5vw,5.6rem)] font-medium leading-[0.96] tracking-normal">End-to-end storyboard, from select to readout.</h2>
          <Storyboard />
        </div>
      </section>

      <section className="overflow-hidden border-y border-[var(--praxis-line)] py-24 md:py-32">
        <div className="praxis-marquee flex w-max gap-10 font-display text-5xl text-[var(--praxis-faint)]">
          {Array.from({ length: 2 }).flatMap((_, i) =>
            ["Ontology", "FieldLab", "Human approval", "Value case", "Replay", "Expansion map"].map((item) => (
              <span key={`${item}-${i}`} className="mx-4 whitespace-nowrap">{item}</span>
            )),
          )}
        </div>
      </section>

      <footer className="px-5 py-32 md:px-10 md:py-48">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-8 md:flex-row md:items-end">
          <div>
            <PraxisMark className="h-14 w-14 text-[var(--praxis-bone)]" />
            <h2 className="mt-10 max-w-3xl font-display text-[clamp(2.8rem,5vw,5.8rem)] font-medium leading-[0.96] tracking-normal">
              Praxis is now the minimum design standard.
            </h2>
          </div>
          <Link href="/field-workbench" className="inline-flex w-fit items-center gap-3 bg-[var(--praxis-mint)] px-6 py-4 font-mono text-xs uppercase tracking-[0.12em] text-[var(--praxis-bg)] transition-transform duration-700 hover:scale-105">
            Enter workbench <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useLandingData } from "@/lib/hooks/use-landing-data";
import { NavBar } from "./nav-bar";
import { HeroSection } from "./hero-section";
import { BentoSection } from "./bento-section";
import { TraceSection } from "./trace-section";
import { FooterSection } from "./footer-section";

export function SentinelLandingPage() {
  const { metrics, recentIncidents, liveSignals, status, errorMessage } = useLandingData();

  return (
    <main className="relative overflow-x-hidden w-full max-w-full min-h-[100dvh] bg-[#070809]">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.06),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.03),transparent_30%),#070809]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(circle_at_center,black_20%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.014),rgba(255,255,255,0.014)_1px,transparent_1px,transparent_3px)] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(40%_34%_at_74%_14%,rgba(245,158,11,0.14),transparent_68%),radial-gradient(26%_20%_at_12%_76%,rgba(245,158,11,0.08),transparent_72%)] opacity-60" />
      </div>

      <div className="relative z-10">
        <NavBar />
        <HeroSection />
        <BentoSection metrics={metrics} recentIncidents={recentIncidents} liveSignals={liveSignals} status={status} errorMessage={errorMessage} />
        <TraceSection />
        <FooterSection />
      </div>
    </main>
  );
}

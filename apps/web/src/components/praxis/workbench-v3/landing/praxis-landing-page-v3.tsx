"use client";

/** V3 landing composer. Wraps every section in a single .sv3 scope so the
 * tokens and primitives only activate inside this surface. */

import { useLandingData } from "@/lib/hooks/use-landing-data";
import { NavBarV3 } from "./nav-bar-v3";
import { HeroSectionV3 } from "./hero-section-v3";
import { BentoSectionV3 } from "./bento-section-v3";
import { TraceSectionV3 } from "./trace-section-v3";
import { FooterSectionV3 } from "./footer-section-v3";

export function PraxisLandingPageV3() {
  const { metrics, recentIncidents, errorMessage } = useLandingData();

  return (
    <main className="sv3 sv3-bg" style={{ minHeight: "100vh", color: "var(--sv3-fg)" }}>
      <NavBarV3 />
      <div style={{ height: 76 }} />

      {errorMessage && (
        <div style={{ padding: "0 24px" }}>
          <div
            className="sv3-plate"
            style={{
              maxWidth: 1500, margin: "0 auto",
              padding: "8px 14px",
              borderColor: "var(--sv3-amber-line)",
              background: "linear-gradient(90deg, rgba(229,168,59,0.08), transparent 70%)",
            }}
          >
            <span className="label label-amber" style={{ marginRight: 8 }}>Simulated operations feed</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>{errorMessage}</span>
          </div>
        </div>
      )}

      <HeroSectionV3 />
      <BentoSectionV3 metrics={metrics} recentIncidents={recentIncidents} />
      <TraceSectionV3 />
      <FooterSectionV3 />
    </main>
  );
}

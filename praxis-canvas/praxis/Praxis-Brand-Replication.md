# Praxis Brand Replication

**Version:** 1.0  
**Last updated:** 2026-05-12  
**Status:** Single source of truth for reproducing the Praxis brand exactly.

---

## 1. Brand Thesis

Praxis is **forward-deployed operational intelligence** — not a generic SaaS dashboard, not another analytics overlay, and not an AI chatbot pretending to be infrastructure.

The visual system exists to communicate three truths:

1. **Operational density.** The people closest to the work need signal, not summaries. Every surface must tolerate high information density without feeling chaotic.
2. **Human review as a constraint.** Decisions are explainable, auditable, and human-approved. The UI must make the approval boundary visible — never hide it behind automation rhetoric.
3. **Forward deployment.** Praxis runs in the field, on day one, against messy real-world data. The visual language is industrial, mineral, and warm — never clinical corporate blue, never cheerful consumer SaaS.

The palette is built on warm-black mineral surfaces (Obsidian, Onyx, Mineral) with reserved chromatic signal (Plasma Violet, Argon Mint). The two together are intentional — rarely paired in operational software — and communicate that Praxis is a different kind of tool.

---

## 2. Logo Rules

### The Mark

The Praxis mark is a **six-point radial faceted form** — six asymmetric kite-shaped arms converging on a center node. Each arm is rendered as two triangular facets (light and shadow) sharing a center-to-tip spine, creating a folded-paper / origami depth effect.

- **Geometry:** Built on 12-point radial geometry. Six diamond rays at 60° intervals converge on a unit-1 center node.
- **Variants:** `origami` (default, 3D facets), `flat` (solid fill), `outline` (stroke only), `node` (line-and-dot network).
- **Minimum size:** 16px for the icon mark; 24px for the lockup.
- **Clearspace:** Equal to the height of the "x" in "Praxis" — roughly the width of the mark's center node. No text, imagery, or graphic elements may enter this space.
- **Format:** SVG-native. The mark is drawn with `<polygon>` elements, not paths, for crisp rendering at any size.

### Mono Execution

**The Praxis logo is mono only.**

- **No accent arm.** Do not highlight one arm in a different color.
- **No orange/amber arm.** The old amber accent has been retired.
- **No gradients** on the mark itself.

On dark surfaces, the mark uses **Bone (#F1EDDF)** for light facets and **opacity-based shadow facets** (typically `opacity: 0.48` or `opacity: 0.5` on the shadow triangles). On light surfaces, the mark uses **Obsidian (#0A0A14)** for light facets and **opacity-based shadow facets** (`rgba(0,0,0,.22)` or similar).

### Implementation

Current canonical React implementation:

```tsx
// apps/web/src/components/praxis/PraxisLogo.tsx
export function PraxisLogo({ className = "" }: { className?: string }) {
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
```

Canvas reference implementation (with all variants):
`praxis-canvas/praxis/shared.jsx` — `PraxisMark` and `PraxisLockup` components.

---

## 3. Mono Logo Usage

### Lockup vs Icon Mark

| Context | Usage |
|---------|-------|
| Nav / header | Lockup (mark + "Praxis" wordmark) |
| Favicon / avatar | Icon mark only |
| Executive readout header | Icon mark only, small |
| Loading states | Icon mark only |
| Social / OG images | Lockup preferred |

### Light-on-Dark

- **Surface:** Obsidian (#0A0A14), Onyx (#13121F), or Mineral (#1C1A2E)
- **Mark color:** Bone (#F1EDDF)
- **Shadow facets:** `opacity: 0.48–0.5` on Bone
- **Wordmark:** Same Bone, `font-weight: 500–600`, `letter-spacing: -0.02em`

### Dark-on-Light

- **Surface:** Bone (#F1EDDF) or Paper (#F7F2E4)
- **Mark color:** Obsidian (#0A0A14)
- **Shadow facets:** `rgba(0,0,0,0.22)` or similar
- **Wordmark:** Same Obsidian

### Clearspace Requirements

- Minimum clearspace around the logo = height of the "x" in "Praxis"
- At 16px mark size, clearspace ≈ 4–6px
- At 64px lockup size, clearspace ≈ 16–20px
- Never place the mark inside a circle, square, or other containing shape

---

## 4. Plasma Palette (Default)

The canonical Praxis dark palette. Used for all flagship product surfaces, marketing pages, and workbench screens unless explicitly overridden.

| Token | Hex | Role |
|-------|-----|------|
| **Obsidian** | `#0A0A14` | Deepest background |
| **Onyx** | `#13121F` | Primary panel / plate surface |
| **Mineral** | `#1C1A2E` | Secondary panel, elevated surface |
| **Hairline** | `#2A263F` | Borders, dividers, grid lines |
| **Bone** | `#F1EDDF` | Primary text, headings, mark light facets |
| **Ash** | `#86819F` | Secondary text, labels, muted copy |
| **Iron** | `#48455A` | Tertiary text, disabled states, faint indicators |
| **Plasma Violet** | `#715BFF` | Primary signal — active states, CTAs, priority, charts, accent hairlines |
| **Argon Mint** | `#3EFFA8` | Confirmation — success, healthy status, ground-truth, evidence trust |

### Usage Rules

- **Bone on Obsidian** for primary text.
- **Obsidian on Bone** (or Mint) for CTA button text.
- Reserve Violet and Mint for signal, active state, confirmation, charts, or focused UI.
- Never use Violet and Mint in equal area — one leads, one confirms.
- Hairlines should be subtle: `rgba(241,237,223,0.06)` to `rgba(241,237,223,0.10)`.

---

## 5. Glacier Palette

An alternative cool palette for specific contexts (e.g., technical documentation, cold-environment deployments, or when differentiation from the main brand is needed).

| Token | Hex | Role |
|-------|-----|------|
| **bg** | `#08111A` | Deepest background |
| **surface** | `#0E1B26` | Primary panel |
| **surfaceAlt** | `#152633` | Secondary panel |
| **line** | `#1F3142` | Borders, dividers |
| **text** | `#E8F2F0` | Primary text |
| **mute** | `#7A99A4` | Secondary text |
| **faint** | `#3C5460` | Tertiary text |
| **accent** | `#5BE9D6` | Primary signal (teal) |
| **accent2** | `#FFB36B` | Secondary signal (apricot) |

---

## 6. Bone Palette (Light)

Used for light-mode surfaces, printed executive readouts, and editorial contexts.

| Token | Hex | Role |
|-------|-----|------|
| **bg** | `#EFEADB` | Deepest background |
| **surface** | `#F6F2E6` | Primary panel |
| **surfaceAlt** | `#E3DDC9` | Secondary panel |
| **line** | `#C9C0A6` | Borders, dividers |
| **text** | `#1A1812` | Primary text |
| **mute** | `#5C5746` | Secondary text |
| **faint** | `#A89F86` | Tertiary text |
| **accent** | `#5A4DFF` | Primary signal (deep violet) |
| **accent2** | `#0C3A2E` | Secondary signal (deep green) |

---

## 7. Typography Pairings

### Canonical Stack (Shipped)

| Role | Font | Weight Range | Notes |
|------|------|--------------|-------|
| **Display** | Outfit (via `next/font`) | 400–700 | Hero headings, section titles, large numerals. Loaded via `next/font/google`. |
| **Body** | Geist | 300–700 | UI text, paragraphs, descriptions. Variable font via `@font-face`. |
| **Mono** | Geist Mono | 400–500 | Labels, data, code, timestamps, scores, audit hashes. Variable font via `@font-face`. |

### Alternative Pairings (Canvas / Design Exploration)

| Pairing | Display | Body | Use Case |
|---------|---------|------|----------|
| `techspace` | Space Grotesk | Geist | Technical/manual aesthetic |
| `editorial` | Instrument Serif | Geist | Editorial, long-form, magazine feel |
| `monomono` | Geist Mono | Geist Mono | Pure terminal / developer tool |
| `manrope` | Manrope | Manrope | Neutral, friendly, approachable |

### Critical Rules

- **Do NOT use Inter.** It is explicitly banned from the Praxis brand.
- Hero headings must use wide containers and stay at **2–3 lines** at desktop width.
- Display type should be `letter-spacing: -0.03em to -0.045em` and `line-height: 0.92–0.96`.
- Mono labels: `font-size: 10px`, `letter-spacing: 0.18em`, `text-transform: uppercase`.
- Body text: `letter-spacing: -0.005em`, `font-feature-settings: "ss01", "cv11"`.

### Font Files

```
apps/web/public/fonts/Geist-Variable.woff2
apps/web/public/fonts/GeistMono-Variable.woff2
```

Outfit is loaded via `next/font/google` in the Next.js app — no local file.

---

## 8. Pattern Language

Praxis treats motion and pattern as material. Every pattern is one of five primitives — never decorative, always conveying a property of the system underneath.

| Pattern | Name | When to Use |
|---------|------|-------------|
| **Spectral Ribbons** | Flowing light trails | Hero backgrounds, speed/trajectory, data streams, marketing pages conveying velocity |
| **Aperture Curves** | Converging arcs | Focus moments, decision points, convergence, camera/scope metaphors |
| **Light Topography** | Elevated contours | Signal intensity maps, terrain, density visualization, technical surfaces |
| **Wave Fields** | Rhythmic energy fields | Frequency, signal strength, live data, audio/telemetry contexts |
| **Static Interference** | Badged noise patterns | Texture, tension, loading states, uncertainty, "messy data" visual metaphor |

### Implementation

Canvas reference: `praxis-canvas/praxis/shared.jsx` — `PatternBg` component.

Each pattern accepts `accent`, `accent2`, and `warn` color props and renders as an SVG absolute-positioned background layer. Patterns are `pointer-events: none` and `aria-hidden`.

---

## 9. AIDA Marketing Page Rules

Every flagship Praxis marketing page must follow the AIDA structure:

### Attention — Hero

- **Cinematic/editorial** hero treatment.
- Exactly **2 CTAs** — one primary (high contrast, filled), one secondary (ghost/outline).
- Headline: 2–3 lines, wide container, `text-wrap: balance`.
- Subhead: 1 sentence, max 540px width, muted color.
- Use `min-h-[100dvh]` — never `h-screen`.
- Background: pattern (ribbons or grid) + radial gradients + optional video loop.
- Trust strip at bottom: deployment stats, compliance badges.

### Interest — Bento / Workbench Grid

- **Gapless** or minimal-gap grid layout.
- CSS Grid with `grid-flow-dense` for irregular cell sizing.
- Dense operational posture: metrics, charts, alerts, pipeline status.
- No generic 3-column card rows. Every cell should have a specific data purpose.
- Use `.sv3-plate` styling: 1px hairline border, 2px border-radius, gradient background.

### Desire — GSAP Pinned Sections

- **Pinned sections** with scroll-scrubbed animation.
- Text reveal: words or lines fade/slide in as user scrolls.
- Image/card scale or card stacking inside overflow-hidden containers.
- Section title pins while content scrolls past.
- Massive section spacing: `padding-top/bottom: clamp(4rem, 8vh, 8rem)`.

### Action — Final CTA + Footer

- **High-contrast** final CTA section.
- Concise footer: logo, minimal links, no newsletter spam.
- CTA button: `.sv3-cta` styling (Plasma Violet fill, Obsidian text, 2px radius).

### Navigation

- Premium minimal fixed or floating nav.
- Transparent/blurred background on scroll.
- Mono uppercase links, muted color, hover to Bone.
- Logo lockup on left, links center/right, CTA button far right.

---

## 10. Field Workbench UI Rules

The workbench is where operators live. It must feel like a control room, not a dashboard.

### Dense Operational Posture

- Information density is a feature, not a bug.
- Use small text (10–12px mono for labels, 13–14px for body).
- Every pixel should carry signal. Avoid whitespace for its own sake.
- Grid layouts with tight gaps (10–14px).

### Human Review Constraint Visible

- Every decision shows its **approval state**.
- Actions display their safety mode: `READ_ONLY`, `HUMAN_APPROVAL`, `ASSISTED`, `WRITEBACK`.
- Do not imply unilateral production writeback. The human gate must be obvious.

### No Generic SaaS Patterns

- **No generic 3-card rows** with icon + title + description.
- **No fake-perfect numbers** (e.g., "99.9% uptime" without context).
- **No Unsplash URLs** or generic stock photography.
- **No emojis** in code, markup, labels, comments, or alt text.

### Evidence Trust & Priority Scoring

- **Evidence trust** must be visible on every decision: 6-dimension grading (source, recency, corroboration, chain of custody, completeness, bias).
- **Priority score** must be visible: 10-factor weighted scoring.
- **Uncertainty** must be shown, not hidden.
- Use horizontal bar charts for score breakdowns, not circular progress indicators.

### Workbench Screens

The following boards must remain live and consistent:

1. **Overview** — FieldLab run status, evidence quality, value signal, workflow progress
2. **Solution Packs** — qualification score, buyer, annual value, validation state
3. **FieldLab** — Floci endpoint, local AWS resources, event flow, replay state
4. **Ontology** — object types, link density, action types, mapping confidence
5. **Decision** — weighted priority, evidence trust, uncertainty, VOI questions, approval state
6. **Discovery (VOI)** — next-best questions ranked by confidence gain
7. **Value Case** — assumptions, formulas, confidence, evidence references, annual value
8. **Expansion Map** — adjacent workflows, shared data model, stakeholder overlap
9. **Executive Readout** — proof tied to business value, risk, implementation plan

---

## 11. Exact CSS Tokens

### `--praxis-*` Variables (from `globals.css`)

These are scoped to `.praxis-theme`:

```css
.praxis-theme {
  --praxis-bg: #0a0a14;
  --praxis-panel: #13121f;
  --praxis-panel-alt: #1c1a2e;
  --praxis-line: #2a263f;
  --praxis-bone: #f1eddf;
  --praxis-muted: #86819f;
  --praxis-faint: #48455a;
  --praxis-violet: #715bff;
  --praxis-mint: #3effa8;
  --praxis-crit: #ef4444;
  --font-display: var(--font-outfit), "Geist", system-ui, sans-serif;
}
```

### `@theme` Tokens (from `globals.css` — Tailwind v4)

```css
@theme {
  --font-sans: "Geist", system-ui, -apple-system, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, "SFMono-Regular", monospace;
  --font-display: var(--font-outfit), "Geist", system-ui, sans-serif;

  --color-bg-deep: #070809;
  --color-bg-base: #0a0a0c;
  --color-bg-surface: rgba(16, 16, 20, 0.72);
  --color-bg-elevated: rgba(28, 28, 34, 0.72);
  --color-border-subtle: rgba(63, 63, 70, 0.22);
  --color-border-strong: rgba(82, 82, 91, 0.38);
  --color-text-primary: #f4f4f5;
  --color-text-secondary: #a1a1aa;
  --color-text-muted: #52525b;
  --color-accent: #715BFF;
  --color-accent-dim: rgba(113, 91, 255, 0.08);
  --color-slate: #86819F;
  --color-emerald: #3EFFA8;
  --color-rose: #EF4444;
  --color-orange: #715BFF;  /* remapped from legacy amber */
}
```

### `--sv3-*` Variables (from `praxis-workbench.css`)

These are scoped to `.sv3` (Workbench V3 visual layer):

```css
.sv3 {
  --sv3-bg: #0A0A14;
  --sv3-plate: #13121F;
  --sv3-plate-2: #1C1A2E;
  --sv3-line: rgba(241,237,223,0.06);
  --sv3-line-strong: rgba(241,237,223,0.10);
  --sv3-amber: #715BFF;           /* variable name is legacy; value is Plasma Violet */
  --sv3-amber-soft: rgba(113,91,255,0.16);
  --sv3-amber-line: rgba(113,91,255,0.32);
  --sv3-amber-glow: rgba(113,91,255,0.45);
  --sv3-fg: #F1EDDF;
  --sv3-muted: #86819F;
  --sv3-subtle: #48455A;
  --sv3-ok: #3EFFA8;
  --sv3-warn: #715BFF;
  --sv3-crit: #EF4444;
  --sv3-info: #60A5FA;
}
```

> **Note on legacy amber references:** Some `.sv3-hero-*` and animation keyframes in `praxis-workbench.css` still reference `rgba(229,168,59, ...)` (the old amber). These should be treated as technical debt and migrated to `rgba(113,91,255, ...)` (Plasma Violet) when encountered.

### Key Utility Classes

| Class | Purpose |
|-------|---------|
| `.sv3` | Workbench V3 root — applies all sv3 tokens and typography |
| `.sv3-bg` | Industrial grid background with dual radial glows |
| `.sv3-plate` | Square panel with gradient fill and 1px hairline border |
| `.sv3-plate-crisp` | Plate with stronger border |
| `.sv3-plate-amber` | Plate with violet border and inset glow |
| `.sv3-hr` / `.sv3-hr-amber` / `.sv3-vhr` | Hairline dividers |
| `.sv3-pulse` | Status pulse dots (ok, amber/violet, crit, warn, stale) |
| `.sv3-rise` | Entrance animation (700ms, translateY + fade) |
| `.sv3-cta` | Primary CTA button (violet fill, dark text) |
| `.sv3-cta.ghost` | Secondary CTA (transparent, hairline border) |
| `.sv3-chip` / `.sv3-chip.amber` / `.sv3-chip.ok` / `.sv3-chip.crit` | Status chips |
| `.sv3-wave` | Vertical bar waveform |
| `.sv3-prio` | Priority progress bar |
| `.mono-data` | Tabular numerics, mono font |
| `.praxis-theme` | Root theme class with radial gradient background |
| `.ops-shell` | Legacy shell background |
| `.ops-glass` | Glass panel (blur + shadow) |
| `.legacy-card` / `.legacy-card-strong` | Legacy card surfaces |
| `.praxis-v2-panel` / `.praxis-v2-panel-strong` / `.praxis-v2-panel-enhanced` | V2 panel variants |
| `.praxis-v2-eyebrow` / `.praxis-v2-eyebrow-enhanced` | Mono uppercase eyebrow labels |

---

## 12. Exact File Map

### Canvas Source Files

```
praxis-canvas/praxis/
├── Praxis Wireframes.html          # Source wireframe board language, flow, density
├── Praxis Hi-Fi.html               # Standalone high-fidelity marketing page
├── Praxis.zip                      # Canvas export bundle
├── shared.jsx                      # Tokens, logo (PraxisMark, PraxisLockup), patterns, utilities
├── brand.jsx                       # Brand guideline boards (hero, logo, construction, type, colors, pattern)
├── marketing.jsx                   # Marketing hero variants (cinematic, technical, editorial)
├── app.jsx                         # Field Workbench app screens (9 boards)
├── flow.jsx                        # End-to-end storyboard (8 steps)
├── design-canvas.jsx               # Canvas shell, artboard renderer, state management
├── tweaks-panel.jsx                # Palette, density, fidelity, logo variant, pattern controls
├── praxis-hifi/screens.jsx         # Source Overview, Decision, Executive Readout compositions
└── uploads/
    ├── 14159473_1920_1080_25fps.mp4     # Cinematic operator video source
    ├── operator-poster.png              # Clean poster frame
    ├── pasted-1778618948193-0.png       # Brand board export
    ├── pasted-1778618961603-0.png       # Brand board export
    ├── pasted-1778618970753-0.png       # Brand board export
    ├── pasted-1778618978459-0.png       # Brand board export
    ├── ChatGPT Image May 12, 2026, 01_43_52 PM.png
    ├── Screenshot 2026-05-12 at 1.42.43 PM.png
    ├── Screenshot 2026-05-12 at 1.42.59 PM.png
    └── Screenshot 2026-05-12 at 1.43.13 PM.png
```

### Shipped Public Assets

```
apps/web/public/praxis-assets/
├── field-operator-loop.mp4              # Cinematic operator video (copy from canvas)
├── operator-poster.png                  # Video poster frame
├── pasted-1778618948193-0.png
├── pasted-1778618961603-0.png
├── pasted-1778618970753-0.png
├── pasted-1778618978459-0.png
├── ChatGPT Image May 12, 2026, 01_43_52 PM.png
├── Screenshot 2026-05-12 at 1.42.43 PM.png
├── Screenshot 2026-05-12 at 1.42.59 PM.png
└── Screenshot 2026-05-12 at 1.43.13 PM.png
```

### Font Files

```
apps/web/public/fonts/
├── Geist-Variable.woff2
└── GeistMono-Variable.woff2
```

### Component Files (React / Next.js)

```
apps/web/src/components/praxis/
├── PraxisLogo.tsx                      # Canonical SVG logo component
├── PraxisShell.tsx                     # Shell layout wrapper
├── praxis-experience.tsx               # Main marketing experience component (mounted on /)
├── ProofObjectViewer.tsx
├── OntologyMap.tsx
├── ExpansionMap.tsx
├── ExecutiveReadout.tsx
├── ValueCasePanel.tsx
├── ActionApprovalPanel.tsx
├── NextBestQuestions.tsx
├── EvidenceTrustPanel.tsx
├── DecisionProofCard.tsx
├── FieldLabTimeline.tsx
├── SolutionPackRail.tsx
├── FieldWorkbenchHero.tsx
├── workbench/
│   ├── command-workbench.tsx
│   ├── dashboard-workbench.tsx
│   └── replay-workbench.tsx
├── workbench-v3/
│   ├── landing/
│   │   ├── praxis-landing-page-v3.tsx
│   │   ├── hero-section-v3.tsx
│   │   ├── bento-section-v3.tsx
│   │   ├── trace-section-v3.tsx
│   │   ├── nav-bar-v3.tsx
│   │   ├── footer-section-v3.tsx
│   │   └── product-shell-preview-v3.tsx
│   ├── command-room/
│   │   └── command-room-v3.tsx
│   ├── replay/
│   │   └── replay-forensics-view-v3.tsx
│   ├── dashboard/
│   │   └── dashboard-page-v3.tsx
│   └── primitives.tsx
└── legacy-workbench-v2/                # Previous generation — reference only
    ├── landing/
    ├── command-room/
    ├── motion/
    └── replay/
```

### Style Files

```
apps/web/src/styles/
└── praxis-workbench.css                # V3 workbench visual layer (sv3 tokens)

apps/web/src/app/
└── globals.css                         # Root styles, Tailwind v4 theme, praxis-theme tokens, legacy v2 panels
```

### Documentation

```
docs/praxis/
├── Praxis-Brand-Replication.md         # Previous version of this doc (superseded by this file)
├── 00-positioning.md
├── 01-fieldlab-architecture.md
├── 02-operational-ontology.md
├── 03-decision-algorithms.md
├── 04-gtm-engine.md
├── 05-forward-deployed-playbook.md
├── 06-security-and-compliance.md
├── 07-demo-script.md
└── 08-executive-readout-template.md
```

---

## 13. How to Regenerate Praxis Wireframes.html

The wireframes file is a **browser-based design canvas** that renders React components via Babel standalone.

### Prerequisites

- A modern web browser (Chrome, Safari, Firefox, Edge)
- Internet connection (loads React, Babel, and Google Fonts from CDN)
- No build step required

### Steps

1. Open `praxis-canvas/praxis/Praxis Wireframes.html` in a web browser.
2. The file loads the following dependencies in order via `<script type="text/babel">`:
   - `design-canvas.jsx` — Canvas shell, artboard renderer, state management
   - `tweaks-panel.jsx` — Palette, density, fidelity, logo variant, and pattern controls
   - `shared.jsx` — Tokens, logo components (`PraxisMark`, `PraxisLockup`), patterns, utilities
   - `brand.jsx` — Brand guideline boards (BrandHero, BrandLogo, BrandConstruction, BrandTypography, BrandColors, BrandPattern)
   - `marketing.jsx` — Marketing hero variants (MarketingCinematic, MarketingTechnical, MarketingEditorial)
   - `app.jsx` — Field Workbench app screens (AppOverview, AppPacks, AppFieldLab, AppOntology, AppDecision, AppDiscovery, AppValueCase, AppExpansion, AppReadout)
   - `flow.jsx` — End-to-end storyboard steps (Step1_Select through Step8_Readout)
3. The canvas renders all boards as scrollable artboards.
4. Use the tweaks panel (bottom-right) to switch between:
   - **Palette:** Plasma (default), Glacier, Bone
   - **Density:** Compact, Comfy, Spacious
   - **Fidelity:** Sketch, Hi-Fi
   - **Logo Variant:** Origami, Flat, Outline, Node
   - **Type Pairing:** Techspace, Editorial, Monomono, Manrope
   - **Pattern:** Ribbon, Grid, Dots, Aperture, Wave

### Output

- The canvas exports PNG screenshots of individual boards.
- The full page can be printed to PDF for presentation.

---

## 14. How to Regenerate Praxis Hi-Fi.html

The Hi-Fi file is a **standalone, self-contained HTML file** with embedded CSS and React components. It renders a complete high-fidelity marketing page.

### Prerequisites

- A modern web browser
- Internet connection (loads fonts from Fontshare and Google Fonts CDN)

### Steps

1. Open `praxis-canvas/praxis/Praxis Hi-Fi.html` in a web browser.
2. The file is fully self-contained:
   - All CSS is embedded in `<style>`.
   - All components are embedded in inline Babel scripts.
   - No external JSX files are loaded.
3. The page renders a complete marketing site with:
   - Fixed floating nav with backdrop blur
   - Cinematic hero with spectral ribbon background
   - Bento feature grid
   - Pinned scroll sections
   - Footer

### Output

- The page can be screenshotted for presentation.
- The HTML can be copied and modified for rapid prototyping.
- To port to the Next.js app, translate the embedded components into `apps/web/src/components/praxis/` files.

---

## 15. Banned Visual Choices

The following are **explicitly forbidden** in Praxis brand work. Do not use them in new designs, components, or marketing materials.

| Banned Choice | Why | Replacement |
|---------------|-----|-------------|
| **Orange/amber as dominant palette** | Looks like every other SaaS dashboard | Plasma Violet + Argon Mint on warm black |
| **Cobalt/amber pairings** | Generic, overused in B2B software | Plasma Violet + Bone, or Glacier teal + apricot |
| **Purple-blue AI gradient washes** | Signals "generic AI startup" | Solid Plasma Violet with opacity control, or no gradient at all |
| **Generic 3-column card rows** | Lazy SaaS pattern | Gapless bento grids, dense operational layouts, CSS Grid with `grid-flow-dense` |
| **Fake-perfect numbers** | Destroys credibility | Real ranges, uncertainty bounds, confidence intervals |
| **Unsplash URLs** | Inconsistent, often irrelevant | Striped placeholders (`ImgSlot` component), generated product screenshots, or no image |
| **Emojis in code/markup** | Unprofessional in operational software | Phosphor Icons (`@phosphor-icons/react`) or existing SVG primitives |
| **Inter font** | Explicitly banned from Praxis | Geist (body), Outfit (display), Geist Mono (data) |
| **Accent arm on logo** | Breaks mono rule, reintroduces old amber | All six arms same color, shadow via opacity |
| **Pure black (#000000)** | Harsh, lifeless | Obsidian (#0A0A14) or deeper #070809 |
| **Neon outer glows** | Dated, cheap | Subtle inset shadows, 1px hairlines, opacity-based depth |
| **Circular progress indicators** | Hides uncertainty | Horizontal bar charts with visible components |
| **"SECTION 01" / "QUESTION 05" spam** | Cheap meta-labeling | Meaningful mono labels or no label at all |
| **`h-screen`** | Breaks on mobile browsers | `min-h-[100dvh]` |
| **Rounded corners > 2px on workbench** | Softens industrial posture | 2px max on plates, chips, panels. Buttons can be pill-shaped in marketing only. |

---

## Verification Checklist

For any Praxis UI change, done means:

- [ ] `pnpm web:typecheck` passes
- [ ] `pnpm web:lint:gpt-taste:ci` passes or remaining findings are listed
- [ ] `pnpm web:build` passes
- [ ] The home route renders Praxis and uses `apps/web/src/components/praxis/praxis-experience.tsx`
- [ ] Hero headline is 2–3 lines at desktop width and readable on mobile
- [ ] CTAs have visible text contrast
- [ ] No orange accent arm appears in the Praxis logo
- [ ] No emojis in code, markup, labels, comments, or alt text
- [ ] No Inter font introduced
- [ ] No generated screenshots or local database files edited unless explicitly requested

---

## Change Log

| Date | Change |
|------|--------|
| 2026-05-12 | v1.0 — Consolidated all brand rules, tokens, file maps, and regeneration instructions into single source of truth |

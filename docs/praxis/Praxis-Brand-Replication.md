# Praxis Brand Replication

Use this document when recreating or extending the Praxis rebrand. It records the current UI/UX direction selected from the Praxis canvas and the implementation now mounted on the web home route.

## Locked Direction

- Product name: Praxis
- Positioning: forward-deployed operational intelligence for messy enterprise workflows
- Marketing direction: cinematic/editorial operator site
- Workbench boards to keep live and consistent: Overview, Solution Packs, FieldLab, Ontology, Decision, Discovery (VOI), Value Case, Expansion Map, Executive Readout
- Logo rule: mono only. Do not use an orange or amber accent arm.
- Palette rule: no orange/black default SaaS palette, no cobalt/amber pairing, no purple-blue AI gradient wash.

## Source References

These are the minimum design references for future Praxis UI work:

- `praxis-canvas/praxis/Praxis Hi-Fi.html`: standalone high-fidelity marketing reference. Treat this as the highest-priority reference for the `/` landing page.
- `praxis-canvas/praxis/Praxis Wireframes.html`: source board language, flow, density, and sketch-to-hi-fi framing.
- `praxis-canvas/praxis/brand.jsx`: brand guideline boards, including the canvas Plasma Violet value used by newer source boards.
- `praxis-canvas/praxis/marketing.jsx`: marketing hero variants and tone references.
- `praxis-canvas/praxis/praxis-hifi/screens.jsx`: source Overview, Decision, and Executive Readout screen composition.
- `praxis-canvas/praxis/app.jsx`: canvas app shell reference for workbench/readout surfaces.
- `praxis-canvas/praxis/flow.jsx`: Select -> Context -> Compile -> FieldLab -> Stream -> Decide -> Action -> Readout storyboard.
- `praxis-canvas/praxis/design-canvas.jsx`: brand boards, construction language, typography, palette, pattern, and motion boards.
- `praxis-canvas/praxis/tweaks-panel.jsx`: palette, density, fidelity, logo variant, and pattern controls.
- `praxis-canvas/praxis/uploads/14159473_1920_1080_25fps.mp4`: cinematic operator video source.

Shipped public assets live under `apps/web/public/praxis-assets/`. The video is copied as `field-operator-loop.mp4`, and the clean poster path is `operator-poster.png`.

## Palette

Primary dark mode:

- Obsidian: `#0A0A14`
- Onyx panel: `#13121F`
- Mineral panel: `#1C1A2E`
- Hairline: `#2A263F`
- Bone text: `#F1EDDF`
- Ash muted text: `#86819F`
- Iron faint text: `#48455A`
- Plasma Violet signal: `#8B5CFF` (canvas value; replaces the retired `#715BFF`)
- Argon Mint confirmation: `#3EFFA8`

Tokens are centralized in `apps/web/src/app/globals.css` under `:root`. Use `var(--praxis-plasma)`, `var(--praxis-argon)`, `var(--praxis-bone)`, `var(--praxis-obsidian)`, `var(--praxis-surface)`, `var(--praxis-surface-2)`, `var(--praxis-line)`, `var(--praxis-hairline)`, `var(--praxis-mute)`, `var(--praxis-faint)`, `var(--praxis-crit)`. Legacy names `--praxis-violet`, `--praxis-mint`, `--praxis-bg`, `--praxis-panel`, `--praxis-panel-alt`, `--praxis-muted` remain as aliases resolving to the canvas values, so existing components continue to render correctly.

Raw hex colors in `.tsx` are forbidden by `gpt-taste/no-raw-hex` (in JSX `style={}`, SVG color attrs, and variable declarations). To introduce a new color, add a token to `globals.css` first, then reference the var.

Use Bone on Obsidian for primary text and Obsidian on Bone or Mint for CTA text. Reserve Violet and Mint for signal, active state, confirmation, charts, or focused UI.

Light mode, when needed:

- Bone canvas: `#F1EDDF`
- Paper panel: `#F7F2E4`
- Ink text: `#16151D`
- Slate hairline: `#C9C0A6`
- Violet signal: `#5A4DFF`
- Deep green confirmation: `#0C3A2E`

## Typography

- Current shipped stack: Outfit display through `next/font`, Geist fallback, Geist Mono for data and labels.
- Do not introduce Inter.
- Hero headings must use wide containers and stay at 2-3 lines.
- Avoid cheap meta labels such as `SECTION 01`, `QUESTION 05`, and generic eyebrow spam.

## Logo

Use the six-arm faceted Praxis mark in mono:

- Dark surfaces: Bone facets with opacity-based shadow facets.
- Light surfaces: Obsidian facets with opacity-based shadow facets.
- No orange, amber, or separate accent arm.
- Keep the mark readable at 16px and preserve clearspace equal to roughly the mark center width.

Current implementation: `apps/web/src/components/praxis/praxis-experience.tsx`.

## Page Structure

Every flagship Praxis marketing page should follow AIDA:

1. Navigation: premium minimal fixed or floating nav.
2. Attention: cinematic/editorial hero with exactly two high-contrast CTAs.
3. Interest: high-density, gapless bento/workbench grid.
4. Desire: GSAP scroll section with pinning, text reveal, image/card scale, or card stacking.
5. Action: high-contrast final CTA and concise footer links.

The current live implementation is `apps/web/src/components/praxis/praxis-experience.tsx`, mounted by `/`, `/field-workbench`, `/solution-packs`, and `/executive-readout`.

## Workbench Screen Standards

Overview:

- Dense operational posture, FieldLab run status, evidence quality, value signal, and workflow progress.
- Use scan-friendly metrics and charts; avoid generic three-card SaaS rows.

Decision:

- Show weighted priority, evidence trust, uncertainty, VOI questions, and human approval state.
- Human review is a product constraint; do not imply unilateral production writeback.

Executive Readout:

- Tie proof to business value, risk, implementation plan, and expansion path.
- Must be credible for CFO/COO and useful for a solutions or GTM engineer.

Solution Packs:

- Show qualification score, buyer, annual value, validation state, and included GTM artifacts.
- Treat solution packs as reusable sales and implementation assets, not static templates.

FieldLab:

- Surface Floci endpoint, local AWS resources, event flow, replay state, and no-production-access safety.
- Make the local proof environment feel operational, not like infrastructure setup notes.

Ontology:

- Show object types, link density, action types, mapping confidence, and source traceability.
- Keep it understandable to a non-ontology buyer while still feeling technically defensible.

Discovery (VOI):

- Rank next-best questions by confidence gain, impact, sensitivity, and acquisition feasibility.
- Avoid generic intake forms; every prompt should explain what decision it improves.

Value Case:

- Show assumptions, formulas, confidence, evidence references, and annual value.
- Make the math inspectable and executive-ready.

Expansion Map:

- Show adjacent workflows ranked by shared data model, stakeholder overlap, measurable value, reuse, urgency, and executive visibility.
- Connect the first proof to account expansion without turning it into a marketing funnel page.

## Motion

Use GSAP where motion materially improves comprehension:

- Hero entrance stagger on first load.
- Scrubbed text reveal for the Praxis thesis.
- Pinned section title while selected screens stack or scroll.
- Card hover physics with scale inside overflow-hidden containers.

Do not add motion that hides content, breaks accessibility, or creates horizontal scrollbars. Wrap flagship pages in `overflow-x-hidden w-full max-w-full`.

## Commands

Use existing repo commands:

- Install: `make install`
- Web dev: `make dev-web` or `pnpm web:dev`
- Frontend typecheck: `pnpm web:typecheck`
- Frontend build: `pnpm web:build`
- GPT-taste design lint: `pnpm web:lint:gpt-taste:ci`
- Smoke tests: `pnpm web:test:smoke`

## Verification

For Praxis UI changes, done means:

- `pnpm web:typecheck` passes.
- `pnpm web:lint:gpt-taste:ci` passes or remaining findings are listed.
- `pnpm web:build` passes.
- The home route renders Praxis and uses `apps/web/src/components/praxis/praxis-experience.tsx`.
- Any claim of canvas faithfulness names the canvas source file and includes a Playwright screenshot path or a blocker explaining why screenshots were not captured.
- CTAs on the affected route resolve to known routes or have an intentional click handler.
- The hero headline is 2-3 lines at desktop width and remains readable on mobile.
- CTAs have visible text contrast.
- No orange accent arm appears in the Praxis logo.
- No generated screenshots or local database files are edited unless explicitly requested.

## Current Unknowns

- The source canvas exists under `praxis-canvas/praxis/`.
- Some Praxis backend and route files are currently untracked/in progress. Coordinate before renaming or moving backend modules.
- The previous V3 workbench implementation has been moved under `apps/web/src/components/praxis/workbench-v3/`; new route imports should use `apps/web/src/components/praxis/workbench/` wrappers.

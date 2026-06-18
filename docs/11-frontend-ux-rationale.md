# Frontend UX Rationale

## Design Philosophy

The Praxis frontend is a **control room**, not a dashboard.

A dashboard displays information for consumption. A control room enables action, accountability, and auditability.

## Product Narrative

The UI is organized around the operational intelligence lifecycle:

```
Signal -> Decision -> Proof -> Approval -> Readout -> Replay
```

Every screen reinforces this narrative. Users do not browse metrics. They inspect signals, review decisions, verify proof, approve actions, read out value, and replay incidents.

## Active Case Spine

A single **active case** carries `pack`, `scenario`, and `ticket` through the
whole journey via URL parameters. Selecting a case in the sidebar (or on the
landing simulation lab) preserves identity across Overview, Decision, Proof,
Readout, Portfolio, and Command surfaces, so a reviewer never loses the thread
or silently snaps back to the printer scenario. The spine is implemented in
`apps/web/src/lib/active-case.ts` and consumed via `hrefWithActiveCase(...)`.

## Navigation

The workbench shell exposes a curated, product-first navigation instead of a
flat list of every route:

- **Core Journey**: Overview, Decision, Proof, Readout — the spine a reviewer
  follows end to end.
- **Portfolio**: Solution Packs, Value Case, Expansion, Command — case
  portfolio and cross-case context.
- **Reference**: Ontology, Ingestion, Reports, Admin — supporting surfaces.

Case-aware links carry the active case; reference links that are global do not.

## Layout Principles

### Asymmetric Grid
The command room uses an asymmetric grid that emphasizes the signal queue and decision context over secondary metrics.

### Z-Depth Hierarchy
- Primary actions: elevated, high contrast
- Secondary context: recessed, low contrast
- Tertiary metadata: minimal, monochrome

### Motion as Feedback
Motion is used only to communicate state change:
- Queue items animate on reorder to show priority changes
- Decision panels animate on selection to show context switch
- Status pulses animate to show live system health

## Color System

The Praxis palette is the source of truth (`apps/web/src/app/globals.css`,
`docs/praxis/Praxis-Brand-Replication.md`). Components reference `var(--praxis-*)`
tokens; raw hex is forbidden and enforced by `gpt-taste/no-raw-hex`.

### Primary Accent: Plasma Violet
Plasma Violet (`--praxis-plasma`, `#8B5CFF`) is the primary accent. It represents:
- Active case and selected context
- Primary actions and decision focus
- System attention

### Semantic Colors
- **Argon Mint** (`--praxis-argon`, `#3EFFA8`): verified recovery, accepted
  recommendations, healthy/verifiable state
- **Crit** (`--praxis-crit`): danger, critical incidents, errors
- **Ash / Iron** (`--praxis-mute`, `--praxis-faint`): neutral context, metadata,
  inactive state

The surfaces are built on the dark Obsidian/Onyx/Mineral neutrals. Avoid amber as
a dominant accent, AI-style purple-blue gradients, and neon outer glows.

## Typography

### Font Stack
- **Sans**: Geist - clean, technical, readable at small sizes
- **Mono**: Geist Mono - used for IDs, hashes, timestamps, scores, and SLO values
- **Display**: Outfit - used for landing page headlines and cinematic sections

### Type Scale
- Display headings: `clamp(3rem, 5vw, 5.5rem)`, tight leading
- Eyebrow labels: 10px, uppercase, wide tracking (0.19em)
- Section headings: 18-24px, semibold
- Body text: 13-14px, regular
- Mono data: 11-13px, tabular numbers

## Component Discipline

### Component Boundaries
Each component has a single responsibility:
- `SignalQueue` displays and filters ranked events
- `IncidentDetailPanel` shows case metadata and linked incidents
- `DecisionExplanationPanel` renders Astraea scores and rationale
- `ReplayTimeline` reconstructs incident chronology
- `PlatformSLOPanel` displays SLO metrics and topology
- `AuditTrail` renders immutable audit events

### State Isolation
- Page components orchestrate data fetching
- UI components receive data via props
- Motion components are leaf nodes with no children

### Accessibility
- All interactive elements have focus states
- Color is never the sole indicator of state
- Motion respects `prefers-reduced-motion`
- All buttons have tactile active states

## Mobile Behavior

The control room collapses to a single column on mobile:
- Signal queue becomes a scrollable list
- Detail panels become bottom sheets
- Actions move to a floating action button
- Status rail becomes a bottom navigation bar

## Performance

### Loading States
Every async operation has a defined loading state:
- Skeleton placeholders for known shapes
- Spinner for unknown shapes
- Progressive disclosure for large datasets

### Error States
Every async operation has a defined error state:
- Inline retry for recoverable errors
- Full-page error for unrecoverable errors
- Degraded mode for partial failures

### Empty States
Every list has a meaningful empty state:
- Contextual message explaining why empty
- Suggested action to populate
- Link to documentation

## Resilient Data Fetching

All operational pages use a shared `client-api.ts` helper with:
- Request timeouts (8s default)
- Automatic fallback to demo scenarios when APIs return empty or 404
- Stale cache reuse when possible
- Hard error only when no fallback path exists

This ensures the demo never shows a broken interface, even when backend services are offline.

## Frontend State Machine

```mermaid
stateDiagram-v2
    [*] --> Loading: Open Praxis surface
    Loading --> Empty: No data
    Loading --> Error: API failure
    Loading --> Ready: Data loaded

    Empty --> Loading: Refresh
    Error --> Loading: Retry

    Ready --> Selecting: Select record or pack
    Selecting --> Ready: Selection changed

    Ready --> SwitchingCase: Switch active case
    SwitchingCase --> Loading: pack/scenario/ticket updated in URL

    Ready --> Filtering: Type search
    Filtering --> Ready: Search applied

    Ready --> Exporting: Click export
    Exporting --> Ready: Export complete
    Exporting --> Error: Export failed

    Ready --> Feedbacking: Submit feedback
    Feedbacking --> Ready: Feedback saved

    Ready --> Replaying: Request replay
    Replaying --> Ready: Replay loaded

    Ready --> Stale: Sync expired
    Stale --> Loading: Refresh
```

## Why This Approach

Traditional dashboard UIs optimize for information density. Control room UIs optimize for decision velocity.

Praxis optimizes for:
1. **Speed to decision**: Priority-ranked queue, one-click actions
2. **Decision confidence**: Explanations, scores, evidence
3. **Decision accountability**: Feedback, replay, audit
4. **Decision learning**: Historical patterns, operator preferences

This is the difference between looking at data and operating a system.

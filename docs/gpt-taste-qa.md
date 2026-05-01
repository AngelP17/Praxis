# GPT-Taste QA Gate

The `gpt-taste` QA gate is an automated design-quality enforcement system built as a custom ESLint plugin. It prevents visual regression and maintains elite frontend standards across the Aether Sentinel web application.

## Why This Exists

Existing CI validates syntax, types, security, and tests -- but not visual or UX quality. The `gpt-taste` skill encapsulates elite frontend design principles (AIDA structure, wide hero headings, gapless grids, cinematic spacing, hover physics). This gate automates enforcement so design quality does not regress as the codebase scales.

## Architecture

The gate is implemented as a **static ESLint plugin** (`eslint-plugin-gpt-taste`) that analyzes TypeScript/React AST to detect violations. This approach is:

- **Fast:** Runs in seconds alongside existing jobs
- **Deterministic:** Same code always produces the same results
- **Zero external dependencies:** No API calls required
- **CI-friendly:** Integrates seamlessly into GitHub Actions

## Rules

### 1. `no-meta-labels` (Warning → Error)

Detects cheap meta-labels like `SECTION 01`, `QUESTION 05`, `ABOUT US` in JSX.

```tsx
// Violation
<section>
  <span className="text-xl">SECTION 01</span>
  <h2>Features</h2>
</section>

// Pass
<section>
  <h2 className="text-xl">Features</h2>
</section>
```

### 2. `no-narrow-hero-containers` (Warning → Error)

Detects `max-w-3xl` or narrower containers on `h1` elements.

```tsx
// Violation
<div className="max-w-2xl">
  <h1>Long heading that wraps into too many lines...</h1>
</div>

// Pass
<div className="max-w-5xl w-full">
  <h1>Heading flows horizontally in 2-3 lines...</h1>
</div>
```

### 3. `require-grid-flow-dense` (Warning → Error)

Requires `grid-flow-dense` on grid layouts to prevent empty gaps in bento grids.

```tsx
// Violation
<div className="grid grid-cols-3">
  <div>Card 1</div>
  <div>Card 2</div>
</div>

// Pass
<div className="grid grid-cols-3 grid-flow-dense">
  <div>Card 1</div>
  <div>Card 2</div>
</div>
```

### 4. `no-emoji-in-code` (Warning → Error)

Prohibits emoji characters in JSX/TSX. Use `@phosphor-icons/react` instead.

```tsx
// Violation
<Button>Get Started</Button>

// Pass
<Button><Rocket className="mr-2" />Get Started</Button>
```

### 5. `require-minimal-section-spacing` (Warning → Error)

Requires `py-20` or larger vertical padding on `<section>` elements.

```tsx
// Violation
<section className="py-8">
  <h2>Features</h2>
</section>

// Pass
<section className="py-32">
  <h2>Features</h2>
</section>
```

### 6. `invisible-button-text-check` (Warning → Error)

Detects poor button contrast combinations (dark-on-dark or light-on-light).

```tsx
// Violation
<button className="bg-zinc-900 text-zinc-700">Click me</button>

// Pass
<button className="bg-zinc-900 text-white">Click me</button>
```

### 7. `require-hover-physics` (Warning → Error)

Requires hover effects on interactive elements (cards, links, buttons).

```tsx
// Violation
<a href="/path" className="card">Content</a>

// Pass
<a href="/path" className="card group-hover:scale-105 transition-transform duration-700">
  Content
</a>
```

## Local Usage

### Run gpt-taste validation

```bash
cd apps/web
pnpm lint:gpt-taste
```

### Run on specific files

```bash
cd apps/web
pnpm lint:gpt-taste src/components/sentinel-v2/landing/
```

### CI output (JSON)

```bash
cd apps/web
pnpm lint:gpt-taste:ci
```

## CI/CD Integration

The `gpt-taste-qa` job runs in parallel with other CI jobs. All rules are currently configured as `warn` severity with `continue-on-error: true` in CI to collect baseline violations before hardening.

## Phase Rollout

### Phase 1: Warnings Only (Current - Active)

- All rules configured as `warn` severity
- CI job runs but does not block merges (`continue-on-error: true`)
- Collect baseline violations across existing codebase
- Fine-tune rule patterns to minimize false positives

### Phase 2: Harden to Errors (After 2 weeks)

- Promote all rules to `error` severity
- Remove `continue-on-error` from CI job
- Block merges on violations
- Strict enforcement (no override mechanism)

## File Structure

```
packages/eslint-plugin-gpt-taste/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── utils.ts
│   └── rules/
│       ├── no-meta-labels.ts
│       ├── no-narrow-hero-containers.ts
│       ├── require-grid-flow-dense.ts
│       ├── no-emoji-in-code.ts
│       ├── require-minimal-section-spacing.ts
│       ├── invisible-button-text-check.ts
│       └── require-hover-physics.ts

apps/web/
├── .gpt-taste.eslintrc.cjs
└── package.json (modified)

.github/
└── workflows/
    └── ci.yml (modified)

docs/
└── gpt-taste-qa.md
```

## Maintenance

When adding new design-quality rules:

1. Implement the rule in `packages/eslint-plugin-gpt-taste/src/rules/`
2. Export it from `packages/eslint-plugin-gpt-taste/src/index.ts`
3. Add the rule to `apps/web/.gpt-taste.eslintrc.cjs` (use `error` severity)
4. Document the rule in this file
5. Rebuild the plugin: `cd packages/eslint-plugin-gpt-taste && pnpm build`

## References

- [ESLint Rule Development Guide](https://eslint.org/docs/latest/extend/custom-rules)
- [gpt-taste Skill](/Users/apinzon/.agents/skills/gpt-taste/SKILL.md)

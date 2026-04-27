# ADR 0006: Frontend Control Room UX

## Status
Accepted

## Context
The original frontend was a traditional admin dashboard: tables, filters, forms, charts. This works for browsing data but fails for operational decision-making, which requires:
- Rapid signal triage
- Clear decision context
- Immediate action affordances
- Trust in system recommendations

## Decision
The frontend will be redesigned as a **control room**: a single-screen operational interface optimized for decision velocity.

Key design decisions:
1. **One narrative**: Signal -> Decision -> Workflow -> Feedback -> Replay
2. **Amber accent only**: No purple, cyan, or pink in operational UI
3. **Motion is purposeful**: Framer Motion for state transitions, not decoration
4. **Tactile states**: Active states on buttons, hover on cards
5. **Mono font for data**: IDs, hashes, timestamps, scores use Geist Mono
6. **Mobile collapse**: One column on mobile, multi-column on desktop
7. **Loading/error/empty states**: Every async operation has explicit states
8. **No emojis**: All icons from Phosphor Icons

## Consequences

### Positive
- Faster operator triage
- Clearer decision context
- Reduced cognitive load
- Professional, premium feel

### Negative
- More complex component architecture
- Motion requires careful performance tuning
- Design system must be documented and enforced

## Mitigation
- Components are isolated in `components/sentinel/` and `components/motion/`
- Motion is only in leaf client components
- `min-h-[100dvh]` used instead of `h-screen`
- CSS Grid preferred over flex math

## Date
2024-01-15

## Author
Angel Pinzon

# Screen Map

## Screen 1: Landing Page (`/`)

**Purpose**: Cinematic introduction to Praxis with live system health

**Layout Structure**:
- Floating glass pill navigation
- Full-bleed hero with background image and radial wash
- Gapless 4-column bento grid: architecture, health, throughput, accordion, marquee
- GSAP scroll trace section with pinned text reveals
- Footer CTA with navigation links

**Key Elements**:
- Live metrics from `/api/metrics`, `/api/incidents`, `/api/tickets`
- 30-second auto-refresh
- AIDA narrative flow: Attention -> Interest -> Desire -> Action

---

## Screen 2: Dashboard (`/dashboard`)

**Purpose**: Dense system health overview for operators and managers

**Layout Structure**:
- System health badge and queue overview
- Active incidents list
- SLA risk metric and incident count
- Active queue with ticket cards

**Key Elements**:
- Real-time data from `useDashboardData` hook
- Bento grid layout with metric cards
- Quick navigation to incidents and command center

---

## Screen 3: Command Center (`/command-center`)

**Purpose**: Primary operator surface — ranked work queue with decision context

**Layout Structure**:

| Left Panel | Center Panel | Right Panel |
|---|---|---|
| Ranked Queue | Selected Ticket Details | Recommendation Stack |
| Filters | Summary, Timeline, Metrics | Rank 1-3 with Accept/Reject |
| SLA Alerts | Linked Assets | Confidence Meter |
| Incidents | | Similar Cases, Quick Actions |

**Key Elements**:
- **Ranked Queue**: Tickets sorted by priority score (highest first)
- **Filters**: Status, priority, category, assignee, site
- **SLA Alerts**: Tickets approaching or breaching SLA
- **Incidents**: Clustered incident indicators
- **Selected Ticket**: Clean summary, timeline, score breakdown
- **Recommendation Stack**: 3-5 ranked actions with confidence scores
- **Confidence Meter**: Visual indicator of decision certainty
- Resilient fallback to demo scenario when API is empty

---

## Screen 4: Incidents (`/incidents`)

**Purpose**: Browse and search all incidents

**Layout Structure**:
- Search by ID, title, or root cause
- Status filter pills (Open, In Progress, Resolved, Closed)
- Dense list layout (not card grid)
- Real-time data with 30s refresh

---

## Screen 5: Incident Detail (`/incidents/[id]`)

**Purpose**: Deep-dive per incident with timeline and resolution

**Sections**:
- Incident title + key + status badge
- Suspected common cause and root cause hypothesis
- Event timeline (chronological, immutable)
- Related tickets (primary, related, duplicate, inferred)
- Affected sites/assets
- Business impact estimate
- Resolution controls (resolve button, status transitions)
- Post-mortem link

---

## Screen 6: Decision Center (`/decision-center`)

**Purpose**: Astraea decisioning and human overrides

**Layout Structure**:

| Left Panel | Right Panel |
|---|---|
| Signal Queue (8 tickets) | Selected Decision Detail |
| Priority scores | Decision ID, priority, confidence, root cause |
| Ticket selection | Recommendation stack with accept/reject |
| | Approve / Reject decision buttons |

**Key Elements**:
- Real-time ticket queue from `/api/tickets`
- Decision evaluation from `/api/decisions`
- Recommendation workflow from `/api/recommendations`
- Human approval/rejection with notes
- Fallback to demo scenario when API unavailable

---

## Screen 7: Platform Overview (`/platform`)

**Purpose**: SRE control plane — observability, topology, chaos

**Layout Structure**:
- Header with service, namespace, latest incident
- SLO metric cards (Availability, MTTR, Error Rate, P95 Latency)
- Topology panel (nodes, roles, health status)
- Controls panel (security, compliance, operational controls)
- Chaos testing buttons (Degraded / Reset)

**Key Elements**:
- Real-time SLO data from `/api/platform/summary`
- Topology graph from `/api/platform/topology`
- Controls list from `/api/platform/controls`
- Interactive chaos testing via `/api/platform/chaos/*`
- Resilient snapshot fallback when APIs partially fail

---

## Screen 8: Asset Management (`/assets`)

**Purpose**: Infrastructure asset inventory

**Layout Structure**:
- Asset search and filter
- Asset cards with metadata
- Linked incidents per asset
- Asset health indicators

**Key Elements**:
- Real asset data from `/api/assets`
- Health status badges
- Incident correlation

---

## Screen 9: Audit Trail (`/audit`)

**Purpose**: Compliance and observability audit viewer

**Layout Structure**:
- Audit event search
- Event type filters
- Chronological event stream
- Export controls

**Key Elements**:
- Audit events from `/api/audit/events`
- Export via `/api/audit/export`
- Immutable event records

---

## Screen 10: Recommendations (`/recommendations`)

**Purpose**: Manage and review AI recommendations

**Layout Structure**:
- Recommendation queue
- Status filters (pending, accepted, rejected, implemented)
- Action details and rationale
- Bulk accept/reject controls

**Key Elements**:
- Recommendation data from `/api/recommendations`
- Individual accept/reject with notes
- Confidence and risk indicators

---

## Screen 11: Event Ingestion (`/event-ingestion`)

**Purpose**: Direct operational event ingestion interface

**Layout Structure**:
- Event form with schema validation
- Batch upload support
- Ingestion status feedback
- Recent events preview

**Key Elements**:
- POST to `/api/events/ingest`
- Real-time validation feedback
- Event normalization preview

---

## Screen 12: Ticket Case View (`/tickets/[id]`)

**Purpose**: Deep-dive per ticket reasoning

**Sections**:
- Clean summary (thread-cleaned description)
- Original raw description
- Event timeline (immutable event stream)
- Score breakdown (7 sub-scores with bar charts)
- Root cause hypothesis (top matching class + confidence)
- Recommendations (3–5 ranked actions)
- Similar prior cases (top 5 with resolution effectiveness)
- Operator feedback panel

---

## Screen 13: Replay / Audit View (`/replay/[id]`)

**Purpose**: Point-in-time audit and decision explanation

**Sections**:
- Point-in-time snapshot selector (date/time slider)
- Decision record at selected time T
- Recommendation history over ticket lifetime
- Operator overrides (what changed and why)
- Final resolution outcome
- Version diff (rule set changes that affected this ticket)

---

## Screen 14: Reports / Export (`/reports`)

**Purpose**: Executive and operational reporting

**Sections**:
- Report type selector (Executive / Operational / Incident / Decision / Audit)
- Date range filter
- Preview pane
- Export as Excel button
- Scheduled report configuration (future)

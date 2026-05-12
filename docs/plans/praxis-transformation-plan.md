# Praxis Transformation Plan

## Executive Summary

Transform **Praxis** → **Praxis**: A forward-deployed operational intelligence platform that converts messy customer signals into executable decision graphs, local proof-of-value environments, implementation plans, and measurable business cases.

**Target Timeline:** 7 phases, 3-4 weeks for MVP

**Value Proposition:**
- Solutions Engineering: Demos, architecture patterns, POCs, security answers
- GTM Engineering: Repeatable solution packs, demo automation, ROI artifacts
- Forward Deployed Engineering: Messy data integration, operational workflows, deployment under constraints

---

## Phase 1: Rebrand & Foundation (Days 1-2)

### Tasks

#### 1.1 ADR Documentation
- [ ] Create `docs/adr/ADR-001-rename-praxis-to-praxis.md`
- [ ] Create `docs/adr/ADR-002-floci-as-local-fieldlab.md`
- [ ] Create `docs/adr/ADR-003-operational-ontology-model.md`

#### 1.2 Core Identity Updates
- [ ] Rewrite `README.md` with Praxis positioning
- [ ] Update `pyproject.toml` (name, description, metadata)
- [ ] Create `docs/praxis/00-positioning.md`
- [ ] Update package naming throughout codebase

#### 1.3 API Foundation
- [ ] Create `apps/api_gateway/routes/fieldlab.py`
- [ ] Create `apps/api_gateway/routes/solution_packs.py`
- [ ] Create `apps/api_gateway/routes/ontology.py`
- [ ] Create `apps/api_gateway/routes/value_cases.py`
- [ ] Create `apps/api_gateway/routes/deployment_plans.py`
- [ ] Update `apps/api_gateway/main.py` with new routers

**Deliverables:** Foundation files, new API routes, updated documentation

**Acceptance Criteria:**
- All new routes compile without errors
- API docs include new endpoints
- README reflects new positioning

---

## Phase 2: Solution Pack Engine (Days 3-4)

### Tasks

#### 2.1 Backend Implementation
- [ ] Create `apps/api_gateway/services/solution_pack_service.py`
- [ ] Create `apps/api_gateway/schemas/solution_pack.py`
- [ ] Implement pack loading and validation logic
- [ ] Create `packages/domain/models/solution_pack.py`

#### 2.2 First Solution Pack
- [ ] Create `solution-packs/manufacturing-printer-gpo/` directory structure
- [ ] Write `scenario.yaml`
- [ ] Write `customer-context.md`
- [ ] Write `sample-events.jsonl`
- [ ] Write `ontology.yaml`
- [ ] Write `demo-script.md`
- [ ] Write `roi-model.yaml`
- [ ] Write `objection-handling.md`
- [ ] Write `security-review.md`
- [ ] Write `implementation-plan.md`

#### 2.3 Tooling
- [ ] Create `scripts/validate_solution_pack.py`
- [ ] Create `tests/praxis/test_solution_pack_loader.py`

**Deliverables:** Solution pack service, first complete solution pack, validation tool

**Acceptance Criteria:**
- Solution pack loads successfully
- Validation script passes
- API endpoints return pack metadata

---

## Phase 3: Operational Ontology Compiler (Days 5-6)

### Tasks

#### 3.1 Core Algorithm
- [ ] Create `packages/astraea-core/praxis/ontology_compiler.py`
- [ ] Implement object type inference
- [ ] Implement link inference
- [ ] Implement action inference
- [ ] Implement mapping confidence scoring

#### 3.2 Domain Models
- [ ] Create `packages/domain/models/operational_object.py`
- [ ] Create `packages/domain/models/action_type.py`
- [ ] Create `packages/domain/models/stakeholder.py`

#### 3.3 API Service
- [ ] Create `apps/api_gateway/services/ontology_service.py`

#### 3.4 Testing
- [ ] Create `tests/praxis/test_ontology_compiler.py`

**Deliverables:** Ontology compiler, domain models, API service, tests

**Acceptance Criteria:**
- Compiler infers object types from sample data
- Confidence scoring produces valid 0-1 values
- API exposes compiled ontology

---

## Phase 4: FieldLab with Floci (Days 7-9)

### Tasks

#### 4.1 Infrastructure
- [ ] Create `infrastructure/floci/docker-compose.yml`
- [ ] Create `infrastructure/floci/bootstrap.sh`
- [ ] Create `infrastructure/floci/seed-fieldlab.sh`
- [ ] Create Terraform configuration:
  - `infrastructure/floci/terraform/main.tf`
  - `infrastructure/floci/terraform/providers.tf`
  - `infrastructure/floci/terraform/sqs.tf`
  - `infrastructure/floci/terraform/s3.tf`
  - `infrastructure/floci/terraform/dynamodb.tf`
  - `infrastructure/floci/terraform/eventbridge.tf`
  - `infrastructure/floci/terraform/outputs.tf`
- [ ] Create `infrastructure/floci/README.md`

#### 4.2 Backend Services
- [ ] Create `apps/api_gateway/services/fieldlab_service.py`
- [ ] Create `apps/api_gateway/schemas/fieldlab.py`
- [ ] Create `packages/pipelines/fieldlab/producer.py`
- [ ] Create `packages/pipelines/fieldlab/consumer.py`
- [ ] Create `packages/pipelines/fieldlab/archive.py`
- [ ] Create `packages/pipelines/fieldlab/replay_export.py`

#### 4.3 Database Models
- [ ] Create `infrastructure/db/models/fieldlab_run.py`
- [ ] Create `infrastructure/db/models/action_log.py`

#### 4.4 Scripts
- [ ] Create `scripts/run_fieldlab_demo.py`

#### 4.5 Testing
- [ ] Create `tests/integration/test_fieldlab_sqs_to_decision.py`
- [ ] Create `tests/integration/test_fieldlab_replay_export.py`

**Deliverables:** FieldLab infrastructure, pipelines, services, integration tests

**Acceptance Criteria:**
- Floci starts successfully with docker compose
- Events flow through SQS → Decision Engine
- Replay artifacts are exported
- Integration tests pass

---

## Phase 5: Flagship Algorithms (Days 10-12)

### Tasks

#### 5.1 Evidence Trust Scoring
- [ ] Create `packages/astraea-core/praxis/evidence_trust.py`
- [ ] Implement 6-factor trust scoring

#### 5.2 Use Case Qualification
- [ ] Create `packages/astraea-core/praxis/use_case_score.py`
- [ ] Implement 9-factor qualification scoring
- [ ] Implement bucketing logic

#### 5.3 Value of Information
- [ ] Create `packages/astraea-core/praxis/value_of_information.py`
- [ ] Implement field ranking algorithm

#### 5.4 Intervention Planner
- [ ] Create `packages/astraea-core/praxis/intervention_planner.py`
- [ ] Implement action level classification
- [ ] Implement audit generation

#### 5.5 Expansion Graph
- [ ] Create `packages/astraea-core/praxis/expansion_graph.py`
- [ ] Implement expansion scoring

#### 5.6 Praxis Decision Engine
- [ ] Create `packages/astraea-core/praxis/praxis_decision_engine.py`
- [ ] Integrate all algorithms
- [ ] Modify `apps/api_gateway/services/decision_service.py`

#### 5.7 Database Models
- [ ] Create `infrastructure/db/models/value_case.py`
- [ ] Create `infrastructure/db/models/customer_context.py`

#### 5.8 Testing
- [ ] Create `tests/praxis/test_evidence_trust.py`
- [ ] Create `tests/praxis/test_use_case_score.py`
- [ ] Create `tests/praxis/test_value_of_information.py`
- [ ] Create `tests/praxis/test_intervention_planner.py`

**Deliverables:** All flagship algorithms, enhanced decision engine, tests

**Acceptance Criteria:**
- All algorithms produce valid scores
- Decision engine integrates new scoring
- Unit tests cover core logic

---

## Phase 6: Frontend - Field Workbench (Days 13-15)

### Tasks

#### 6.1 Pages
- [ ] Create `apps/web/src/app/field-workbench/page.tsx`
- [ ] Create `apps/web/src/app/solution-packs/page.tsx`
- [ ] Create `apps/web/src/app/solution-packs/[id]/page.tsx`
- [ ] Create `apps/web/src/app/fieldlab/page.tsx`
- [ ] Create `apps/web/src/app/ontology/page.tsx`
- [ ] Create `apps/web/src/app/value-case/page.tsx`
- [ ] Create `apps/web/src/app/deployment-plan/page.tsx`
- [ ] Create `apps/web/src/app/executive-readout/page.tsx`

#### 6.2 Components
- [ ] Create `apps/web/src/components/praxis/FieldWorkbench.tsx`
- [ ] Create `apps/web/src/components/praxis/SolutionPackLauncher.tsx`
- [ ] Create `apps/web/src/components/praxis/OntologyGraph.tsx`
- [ ] Create `apps/web/src/components/praxis/ValueCaseBuilder.tsx`
- [ ] Create `apps/web/src/components/praxis/DemoControlPanel.tsx`
- [ ] Create `apps/web/src/components/praxis/StakeholderMap.tsx`
- [ ] Create `apps/web/src/components/praxis/ExpansionMap.tsx`
- [ ] Create `apps/web/src/components/praxis/ExecutiveReadout.tsx`

#### 6.3 API Client
- [ ] Create `apps/web/src/lib/praxis-api.ts`

**Deliverables:** All Praxis pages and components

**Acceptance Criteria:**
- All pages render without errors
- Components connect to API successfully
- Navigation between pages works

---

## Phase 7: Executive Artifacts & Polish (Days 16-18)

### Tasks

#### 7.1 Scripts
- [ ] Create `scripts/generate_executive_readout.py`
- [ ] Create `scripts/score_use_case.py`

#### 7.2 Documentation
- [ ] Create `docs/praxis/01-fieldlab-architecture.md`
- [ ] Create `docs/praxis/02-operational-ontology.md`
- [ ] Create `docs/praxis/03-decision-algorithms.md`
- [ ] Create `docs/praxis/04-gtm-engine.md`
- [ ] Create `docs/praxis/05-forward-deployed-playbook.md`
- [ ] Create `docs/praxis/06-security-and-compliance.md`
- [ ] Create `docs/praxis/07-demo-script.md`
- [ ] Create `docs/praxis/08-executive-readout-template.md`

#### 7.3 CI/CD
- [ ] Create `.github/workflows/fieldlab-proof.yml`
- [ ] Create `.github/workflows/solution-pack-validation.yml`
- [ ] Update existing CI for new structure

#### 7.4 Makefile
- [ ] Update `Makefile` with new targets:
  - `praxis-install`
  - `praxis-fieldlab-up`
  - `praxis-fieldlab-down`
  - `praxis-demo`
  - `praxis-validate-pack`
  - `praxis-readout`
  - `praxis-test`

#### 7.5 Migration Script
- [ ] Create `scripts/praxis_rename.py` for repo renaming

**Deliverables:** Executive artifacts, documentation, CI/CD, automation scripts

**Acceptance Criteria:**
- CI workflows pass
- All Makefile targets work
- Documentation is complete

---

## Success Metrics

### Technical
- [ ] All new APIs tested and documented
- [ ] FieldLab runs end-to-end with solution pack
- [ ] Flagship algorithms produce valid outputs
- [ ] Frontend pages render and connect successfully

### Demo Readiness
- [ ] "Manufacturing Printer GPO Failure" demo completes in 7 minutes
- [ ] Executive readout generates successfully
- [ ] Value case calculates ROI correctly
- [ ] Expansion map identifies adjacent use cases

### Role Demonstration
- [ ] Solutions Engineer: Can load pack, show ontology, explain decisions
- [ ] GTM Engineer: Can show ROI, objection handling, expansion map
- [ ] Forward Deployed: Can integrate messy data, show action log, audit trail

---

## Dependencies & Risks

### External Dependencies
- Floci (local AWS emulator) - must be accessible
- Terraform for infrastructure definition

### Technical Risks
- Floci compatibility with current AWS SDK versions
- Frontend component complexity for ontology visualization
- Database migration for new models

### Mitigation
- Start with manual Floci testing before automation
- Use existing visualization libraries (e.g., D3, Cytoscape) for ontology
- Create migration script with rollback plan

---

## Rollback Plan

If Phase 4 (FieldLab) or later proves problematic:
1. Keep rebrand and new API routes
2. Defer Floci integration
3. Use in-memory event simulation for demo
4. Maintain existing decision engine with incremental improvements

---

## Next Steps

1. **Immediate:** Start Phase 1 - ADR documentation and README rewrite
2. **Week 1:** Complete Phases 1-2 (Foundation + Solution Packs)
3. **Week 2:** Complete Phases 3-4 (Ontology + FieldLab)
4. **Week 3:** Complete Phases 5-6 (Algorithms + Frontend)
5. **Week 4:** Complete Phase 7 (Artifacts + Polish)

---

*Last Updated: 2026-05-12*

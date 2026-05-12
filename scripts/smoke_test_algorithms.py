#!/usr/bin/env python3
"""Smoke test all Praxis algorithms."""

import sys

sys.path.insert(0, ".")

from astraea.praxis.evidence_trust import EvidenceTrustScorer, Evidence
from astraea.praxis.use_case_score import UseCaseScorer
from astraea.praxis.value_of_information import ValueOfInformation
from astraea.praxis.intervention_planner import InterventionPlanner
from astraea.praxis.expansion_graph import ExpansionGraph
from astraea.praxis.ontology_compiler import OntologyCompiler
from astraea.praxis.praxis_decision_engine import PraxisDecisionEngine

ets = EvidenceTrustScorer()
print("Evidence trust:", ets.score(Evidence()))

ucs = UseCaseScorer()
print("Use case score:", ucs.score({}))

voi = ValueOfInformation()
print("VOI:", voi.rank(["downtime_minutes", "asset_owner"], {}))

ip = InterventionPlanner()
print("Action plan:", ip.plan_action("acknowledge_incident"))

eg = ExpansionGraph()
print("Top expansions:", eg.top_expansions("manufacturing-printer-gpo"))

oc = OntologyCompiler()
print("Ontology compiled:", oc.compile([{"site": "Georgia", "asset": "WEIFPS01"}]))

pde = PraxisDecisionEngine()
print("Praxis decision:", pde.score({"severity_score": 0.8}))

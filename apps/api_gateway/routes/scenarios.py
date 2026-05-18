from fastapi import APIRouter, Depends, HTTPException, Query

from apps.api_gateway.deps import get_db
from apps.api_gateway.services.scenario_service import ScenarioService

router = APIRouter()


@router.get("/api/scenarios")
def list_scenarios(db=Depends(get_db)):
    svc = ScenarioService(db)
    return [s.model_dump() for s in svc.list_scenarios()]


@router.get("/api/scenarios/benchmarks")
def scenario_benchmarks(db=Depends(get_db)):
    svc = ScenarioService(db)
    return {"scenarios": svc.benchmarks()}


@router.get("/api/scenarios/{scenario_id}")
def get_scenario(scenario_id: str, db=Depends(get_db)):
    svc = ScenarioService(db)
    scenario = svc.get_scenario(scenario_id)
    if scenario is None:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")
    return scenario.model_dump()


@router.get("/api/scenarios/{scenario_id}/ontology")
def scenario_ontology(scenario_id: str, db=Depends(get_db)):
    svc = ScenarioService(db)
    ontology = svc.scenario_ontology(scenario_id)
    if ontology is None:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")
    return ontology


@router.post("/api/scenarios/{scenario_id}/run")
def run_scenario(
    scenario_id: str,
    auto_approve: bool = Query(False),
    db=Depends(get_db),
):
    svc = ScenarioService(db)
    result = svc.run_scenario(scenario_id, auto_approve=auto_approve)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")
    return result

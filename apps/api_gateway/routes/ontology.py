from fastapi import APIRouter, Depends
from apps.api_gateway.deps import get_db
from apps.api_gateway.services.ontology_service import OntologyService
from apps.api_gateway.schemas.ontology import (
    OntologyCompileRequest,
    OntologyCompileResponse,
    OntologyObjectList,
    OntologyObjectDetail,
    OntologyLinkList,
    OntologyActionList,
    OntologyActionSimulateRequest,
    OntologyActionSimulateResponse,
)

router = APIRouter()


@router.post("/compile", response_model=OntologyCompileResponse)
def compile_ontology(body: OntologyCompileRequest, db=Depends(get_db)):
    svc = OntologyService(db)
    return svc.compile_ontology(body.dict())


@router.get("/objects", response_model=OntologyObjectList)
def list_objects(db=Depends(get_db)):
    svc = OntologyService(db)
    return {"objects": svc.list_objects()}


@router.get("/objects/{object_key}", response_model=OntologyObjectDetail)
def get_object(object_key: str, db=Depends(get_db)):
    svc = OntologyService(db)
    return svc.get_object(object_key)


@router.get("/links", response_model=OntologyLinkList)
def list_links(db=Depends(get_db)):
    svc = OntologyService(db)
    return {"links": svc.list_links()}


@router.get("/actions", response_model=OntologyActionList)
def list_actions(db=Depends(get_db)):
    svc = OntologyService(db)
    return {"actions": svc.list_actions()}


@router.post("/actions/{action_type}/simulate", response_model=OntologyActionSimulateResponse)
def simulate_action(action_type: str, body: OntologyActionSimulateRequest, db=Depends(get_db)):
    svc = OntologyService(db)
    return svc.simulate_action(action_type, body.dict())

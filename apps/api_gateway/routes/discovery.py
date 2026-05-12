from fastapi import APIRouter, Depends
from apps.api_gateway.deps import get_db
from apps.api_gateway.services.discovery_service import DiscoveryService
from apps.api_gateway.schemas.discovery import DiscoveryRequest, DiscoveryResponse

router = APIRouter()


@router.post("/discover", response_model=DiscoveryResponse)
def discover_customer_signals(body: DiscoveryRequest, db=Depends(get_db)):
    svc = DiscoveryService(db)
    return svc.discover(body.dict())

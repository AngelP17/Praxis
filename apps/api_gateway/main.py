from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apps.api_gateway.config import settings
from apps.api_gateway.deps import init_db
from apps.api_gateway.logging_config import configure_logging, get_logger
from apps.api_gateway.middleware.rate_limit import RateLimitMiddleware
from apps.api_gateway.middleware.proof_rate_limit import ProofRateLimitMiddleware
from apps.api_gateway.middleware.metrics import MetricsMiddleware
from apps.api_gateway.routes.attachments import router as attachments_router
from apps.api_gateway.routes.assets import router as assets_router
from apps.api_gateway.routes.auth import router as auth_router
from apps.api_gateway.routes.catalog import router as catalog_router
from apps.api_gateway.routes.comments import router as comments_router
from apps.api_gateway.routes.decisions import router as decisions_router
from apps.api_gateway.routes.events import router as events_router
from apps.api_gateway.routes.incidents import router as incidents_router
from apps.api_gateway.routes.metrics import router as metrics_router
from apps.api_gateway.routes.recommendations import router as recommendations_router
from apps.api_gateway.routes.audit import router as audit_router
from apps.api_gateway.routes.platform import router as platform_router
from apps.api_gateway.routes.proofs import router as proofs_router
from apps.api_gateway.routes.proofs_sse import router as proofs_sse_router
from apps.api_gateway.routes.proofs_replay import router as proofs_replay_router
from apps.api_gateway.routes.health import router as health_router
from apps.api_gateway.routes.replay import router as replay_router
from apps.api_gateway.routes.reports import router as reports_router
from apps.api_gateway.routes.tickets import router as tickets_router
from apps.api_gateway.routes.fieldlab import router as fieldlab_router
from apps.api_gateway.routes.solution_packs import router as solution_packs_router
from apps.api_gateway.routes.ontology import router as ontology_router
from apps.api_gateway.routes.value_cases import router as value_cases_router
from apps.api_gateway.routes.deployment_plans import router as deployment_plans_router
from apps.api_gateway.routes.discovery import router as discovery_router
from apps.api_gateway.routes.pack_metrics import router as pack_metrics_router
from apps.api_gateway.routes.floci_health import router as floci_health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    logger = get_logger("main")
    logger.info("praxis_api_starting", version="2.0.0", env=settings.ENV)

    app.state.cw_client = None

    if settings.AUTO_INIT_DB:
        init_db()
        logger.info("database_initialized")

    yield


app = FastAPI(
    title="Praxis API",
    description="Forward-deployed operational intelligence platform",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(RateLimitMiddleware)
app.add_middleware(ProofRateLimitMiddleware)
app.add_middleware(MetricsMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tickets_router, prefix="/api/tickets", tags=["tickets"])
app.include_router(incidents_router, prefix="/api/incidents", tags=["incidents"])
app.include_router(decisions_router, prefix="/api/decisions", tags=["decisions"])
app.include_router(recommendations_router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(reports_router, prefix="/api/reports", tags=["reports"])
app.include_router(replay_router, prefix="/api/replay", tags=["replay"])
app.include_router(metrics_router, prefix="/api/metrics", tags=["metrics"])
app.include_router(assets_router, prefix="/api/assets", tags=["assets"])
app.include_router(events_router, prefix="/api/events", tags=["events"])
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(catalog_router, prefix="/api", tags=["catalog"])
app.include_router(comments_router, prefix="/api", tags=["comments"])
app.include_router(attachments_router, prefix="/api", tags=["attachments"])
app.include_router(platform_router, prefix="/api/platform", tags=["platform"])
app.include_router(audit_router, prefix="/api/audit", tags=["audit"])
app.include_router(fieldlab_router, prefix="/api/fieldlab", tags=["fieldlab"])
app.include_router(solution_packs_router, prefix="/api/solution-packs", tags=["solution-packs"])
app.include_router(ontology_router, prefix="/api/ontology", tags=["ontology"])
app.include_router(value_cases_router, prefix="/api/value-cases", tags=["value-cases"])
app.include_router(deployment_plans_router, prefix="/api/deployment-plans", tags=["deployment-plans"])
app.include_router(discovery_router, prefix="/api/discovery", tags=["discovery"])
app.include_router(proofs_router, prefix="/api/proofs", tags=["proofs"])
app.include_router(proofs_sse_router, tags=["proofs-sse"])
app.include_router(proofs_replay_router, tags=["proofs-replay"])
app.include_router(health_router, tags=["health"])
app.include_router(pack_metrics_router, tags=["pack-metrics"])
app.include_router(floci_health_router, tags=["floci-health"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "praxis-api", "version": "2.0.0"}


@app.get("/")
async def root():
    return {"service": "Praxis API", "version": "2.0.0", "docs": "/docs"}

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

from apps.api_gateway.config import settings
from apps.api_gateway.deps import init_db
from apps.api_gateway.logging_config import configure_logging, get_logger
from apps.api_gateway.security import require_operator
from apps.api_gateway.middleware.rate_limit import RateLimitMiddleware
from apps.api_gateway.middleware.proof_rate_limit import ProofRateLimitMiddleware
from apps.api_gateway.middleware.metrics import MetricsMiddleware
from apps.api_gateway.middleware.request_id import RequestIDMiddleware
from apps.api_gateway.middleware.prometheus import PrometheusMiddleware
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
from apps.api_gateway.routes.scenarios import router as scenarios_router


def _enforce_production_credentials() -> None:
    """Block startup if production still ships publicly known demo credentials."""
    if not settings.is_production:
        return
    from apps.api_gateway.services.auth_service import AuthService

    if AuthService().uses_shipped_demo_credentials():
        raise RuntimeError(
            "Refusing to start: shipped demo credentials are still active. "
            "Rotate users.json (or set USERS_FILE) before ENV=production."
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    logger = get_logger("main")
    logger.info("praxis_api_starting", version="2.0.0", env=settings.ENV)

    _enforce_production_credentials()

    app.state.cw_client = None

    if settings.AUTO_INIT_DB:
        init_db()
        logger.info("database_initialized")

    from apps.api_gateway.services.outbox_relay import outbox_worker
    await outbox_worker.start()

    yield

    await outbox_worker.stop()


app = FastAPI(
    title="Praxis API",
    description="""
## Forward-deployed operational intelligence platform

Praxis turns messy enterprise signals into ontology-backed decisions with deterministic proof objects.

### Key Features
- **CloudEvents 1.0** ingestion with automatic decision scoring
- **Deterministic replay** - same inputs always produce the same proof hash
- **Human-in-the-loop** approval workflows
- **FieldLab** local AWS emulation via Floci
- **Solution packs** for repeatable operational patterns

### Authentication
All protected endpoints require a Bearer token obtained from `/api/auth/login`.

### Rate Limiting
- General: 600 requests/minute per IP
- Proof endpoints: 30 requests/minute (or higher with API key)
    """,
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {"name": "auth", "description": "Authentication and user management"},
        {"name": "tickets", "description": "IT ticket lifecycle and CRUD operations"},
        {"name": "incidents", "description": "Incident synthesis and management"},
        {"name": "decisions", "description": "Decision evaluation, approval, and replay"},
        {"name": "events", "description": "CloudEvents 1.0 ingestion"},
        {"name": "proofs", "description": "Proof object generation and verification"},
        {"name": "fieldlab", "description": "FieldLab run lifecycle"},
        {"name": "solution-packs", "description": "Solution pack catalog and validation"},
        {"name": "ontology", "description": "Ontology compilation and object graphs"},
        {"name": "platform", "description": "Platform SRE resilience pilot"},
        {"name": "health", "description": "Service health checks"},
    ],
)

_SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
}


@app.middleware("http")
async def security_headers_middleware(request, call_next):
    response = await call_next(request)
    for header, value in _SECURITY_HEADERS.items():
        response.headers.setdefault(header, value)
    if settings.is_production:
        response.headers.setdefault(
            "Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload"
        )
    return response


app.add_middleware(PrometheusMiddleware)
app.add_middleware(RequestIDMiddleware)
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

# Production-gated auth: enforced when ENV=production, no-op in the demo/dev path.
operator_guard = [Depends(require_operator)]

app.include_router(tickets_router, prefix="/api/tickets", tags=["tickets"])
app.include_router(
    incidents_router, prefix="/api/incidents", tags=["incidents"], dependencies=operator_guard
)
app.include_router(
    decisions_router, prefix="/api/decisions", tags=["decisions"], dependencies=operator_guard
)
app.include_router(
    recommendations_router,
    prefix="/api/recommendations",
    tags=["recommendations"],
    dependencies=operator_guard,
)
app.include_router(
    reports_router, prefix="/api/reports", tags=["reports"], dependencies=operator_guard
)
app.include_router(
    replay_router, prefix="/api/replay", tags=["replay"], dependencies=operator_guard
)
app.include_router(
    metrics_router, prefix="/api/metrics", tags=["metrics"], dependencies=operator_guard
)
app.include_router(
    assets_router, prefix="/api/assets", tags=["assets"], dependencies=operator_guard
)
app.include_router(
    events_router, prefix="/api/events", tags=["events"], dependencies=operator_guard
)
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(catalog_router, prefix="/api", tags=["catalog"])
app.include_router(comments_router, prefix="/api", tags=["comments"])
app.include_router(attachments_router, prefix="/api", tags=["attachments"])
app.include_router(
    platform_router, prefix="/api/platform", tags=["platform"], dependencies=operator_guard
)
app.include_router(
    audit_router, prefix="/api/audit", tags=["audit"], dependencies=operator_guard
)
app.include_router(
    fieldlab_router, prefix="/api/fieldlab", tags=["fieldlab"], dependencies=operator_guard
)
app.include_router(
    solution_packs_router,
    prefix="/api/solution-packs",
    tags=["solution-packs"],
    dependencies=operator_guard,
)
app.include_router(
    ontology_router, prefix="/api/ontology", tags=["ontology"], dependencies=operator_guard
)
app.include_router(
    value_cases_router,
    prefix="/api/value-cases",
    tags=["value-cases"],
    dependencies=operator_guard,
)
app.include_router(
    deployment_plans_router,
    prefix="/api/deployment-plans",
    tags=["deployment-plans"],
    dependencies=operator_guard,
)
app.include_router(
    discovery_router, prefix="/api/discovery", tags=["discovery"], dependencies=operator_guard
)
app.include_router(proofs_router, prefix="/api/proofs", tags=["proofs"])
app.include_router(proofs_sse_router, tags=["proofs-sse"])
app.include_router(proofs_replay_router, tags=["proofs-replay"])
app.include_router(health_router, tags=["health"])
app.include_router(pack_metrics_router, tags=["pack-metrics"])
app.include_router(floci_health_router, tags=["floci-health"])
app.include_router(scenarios_router, tags=["scenarios"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "praxis-api", "version": "2.0.0"}


@app.get("/metrics")
def get_prometheus_metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/")
async def root():
    return {"service": "Praxis API", "version": "2.0.0", "docs": "/docs"}

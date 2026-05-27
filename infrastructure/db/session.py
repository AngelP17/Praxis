from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from apps.api_gateway.config import settings


def clean_database_url(url: str) -> str:
    if url.startswith("sqlite"):
        return url
    from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

    parsed = urlparse(url)
    params = parse_qs(parsed.query)
    for param in ["channel_binding", "options"]:
        params.pop(param, None)

    clean_params = {k: v[0] if len(v) == 1 else v for k, v in params.items()}
    new_query = urlencode(clean_params)
    return urlunparse(
        (
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            new_query,
            parsed.fragment,
        )
    )


is_sqlite = settings.DATABASE_URL.startswith("sqlite")

if is_sqlite:
    engine = create_engine(
        clean_database_url(settings.DATABASE_URL),
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(
        clean_database_url(settings.DATABASE_URL),
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        pool_use_lifo=True,
        pool_recycle=1800,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    _import_models()

    from infrastructure.db.base import Base
    Base.metadata.create_all(bind=engine)

    import os
    from alembic import command
    from alembic.config import Config

    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    ini_path = os.path.join(base_dir, "infrastructure", "db", "migrations", "alembic.ini")

    alembic_cfg = Config(ini_path)
    with engine.begin() as connection:
        alembic_cfg.attributes["connection"] = connection
        command.upgrade(alembic_cfg, "head")


def _import_models() -> None:
    import infrastructure.db.models.action_log  # noqa: F401
    import infrastructure.db.models.action_run  # noqa: F401
    import infrastructure.db.models.asset  # noqa: F401
    import infrastructure.db.models.asset_edge  # noqa: F401
    import infrastructure.db.models.assignee  # noqa: F401
    import infrastructure.db.models.auth_token  # noqa: F401
    import infrastructure.db.models.audit_record  # noqa: F401
    import infrastructure.db.models.category  # noqa: F401
    import infrastructure.db.models.customer_context  # noqa: F401
    import infrastructure.db.models.decision_record  # noqa: F401
    import infrastructure.db.models.deployment_plan  # noqa: F401
    import infrastructure.db.models.evidence_artifact  # noqa: F401
    import infrastructure.db.models.fieldlab_run  # noqa: F401
    import infrastructure.db.models.human_feedback  # noqa: F401
    import infrastructure.db.models.incident  # noqa: F401
    import infrastructure.db.models.incident_event  # noqa: F401
    import infrastructure.db.models.incident_ticket_link  # noqa: F401
    import infrastructure.db.models.label  # noqa: F401
    import infrastructure.db.models.operational_event  # noqa: F401
    import infrastructure.db.models.operational_object  # noqa: F401
    import infrastructure.db.models.operator_feedback  # noqa: F401
    import infrastructure.db.models.outbox_message  # noqa: F401
    import infrastructure.db.models.platform_incident  # noqa: F401
    import infrastructure.db.models.recommendation  # noqa: F401
    import infrastructure.db.models.similar_case_link  # noqa: F401
    import infrastructure.db.models.solution_pack  # noqa: F401
    import infrastructure.db.models.ticket  # noqa: F401
    import infrastructure.db.models.ticket_attachment  # noqa: F401
    import infrastructure.db.models.ticket_comment  # noqa: F401
    import infrastructure.db.models.ticket_event  # noqa: F401
    import infrastructure.db.models.value_case  # noqa: F401

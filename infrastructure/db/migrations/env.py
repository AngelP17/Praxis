from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

from infrastructure.db.base import Base
from apps.api_gateway.config import settings

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

import infrastructure.db.models.action_log  # noqa: F401,E402
import infrastructure.db.models.action_run  # noqa: F401,E402
import infrastructure.db.models.asset  # noqa: F401,E402
import infrastructure.db.models.asset_edge  # noqa: F401,E402
import infrastructure.db.models.assignee  # noqa: F401,E402
import infrastructure.db.models.audit_record  # noqa: F401,E402
import infrastructure.db.models.category  # noqa: F401,E402
import infrastructure.db.models.customer_context  # noqa: F401,E402
import infrastructure.db.models.decision_record  # noqa: F401,E402
import infrastructure.db.models.deployment_plan  # noqa: F401,E402
import infrastructure.db.models.evidence_artifact  # noqa: F401,E402
import infrastructure.db.models.fieldlab_run  # noqa: F401,E402
import infrastructure.db.models.human_feedback  # noqa: F401,E402
import infrastructure.db.models.incident  # noqa: F401,E402
import infrastructure.db.models.incident_event  # noqa: F401,E402
import infrastructure.db.models.incident_ticket_link  # noqa: F401,E402
import infrastructure.db.models.label  # noqa: F401,E402
import infrastructure.db.models.operational_event  # noqa: F401,E402
import infrastructure.db.models.operational_object  # noqa: F401,E402
import infrastructure.db.models.operator_feedback  # noqa: F401,E402
import infrastructure.db.models.outbox_message  # noqa: F401,E402
import infrastructure.db.models.platform_incident  # noqa: F401,E402
import infrastructure.db.models.recommendation  # noqa: F401,E402
import infrastructure.db.models.similar_case_link  # noqa: F401,E402
import infrastructure.db.models.solution_pack  # noqa: F401,E402
import infrastructure.db.models.ticket  # noqa: F401,E402
import infrastructure.db.models.ticket_attachment  # noqa: F401,E402
import infrastructure.db.models.ticket_comment  # noqa: F401,E402
import infrastructure.db.models.ticket_event  # noqa: F401,E402
import infrastructure.db.models.value_case  # noqa: F401,E402

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    # Use connection passed programmatically if available
    connection = config.attributes.get("connection", None)
    if connection is not None:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()
        return

    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

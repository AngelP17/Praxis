"""Add auth token persistence and outbox delivery state.

Revision ID: 20260527_120000
Revises: 20260401_120000
Create Date: 2026-05-27 12:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260527_120000"
down_revision = "20260401_120000"
branch_labels = None
depends_on = None


def _has_table(table_name: str) -> bool:
    return sa.inspect(op.get_bind()).has_table(table_name)


def _has_column(table_name: str, column_name: str) -> bool:
    return column_name in {column["name"] for column in sa.inspect(op.get_bind()).get_columns(table_name)}


def _ensure_outbox_column(column: sa.Column) -> None:
    if not _has_column("outbox_messages", column.name):
        op.add_column("outbox_messages", column)


def upgrade() -> None:
    op.create_table(
        "auth_tokens",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("token_type", sa.String(length=20), nullable=False),
        sa.Column("username", sa.String(length=150), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("replaced_by_hash", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash"),
    )
    op.create_index("ix_auth_tokens_token_hash", "auth_tokens", ["token_hash"])
    op.create_index("ix_auth_tokens_token_type", "auth_tokens", ["token_type"])
    op.create_index("ix_auth_tokens_username", "auth_tokens", ["username"])
    op.create_index("ix_auth_tokens_expires_at", "auth_tokens", ["expires_at"])

    if not _has_table("outbox_messages"):
        op.create_table(
            "outbox_messages",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("topic", sa.String(length=200), nullable=False),
            sa.Column("payload", sa.JSON(), nullable=False),
            sa.Column("status", sa.String(length=30), nullable=False, server_default="pending"),
            sa.Column("attempt_count", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("idempotency_key", sa.String(length=128), nullable=True),
            sa.Column("last_error", sa.String(length=500), nullable=True),
            sa.Column("next_attempt_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("dead_lettered_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.Column("published_at", sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint("id"),
        )
    else:
        _ensure_outbox_column(sa.Column("attempt_count", sa.Integer(), nullable=False, server_default="0"))
        _ensure_outbox_column(sa.Column("idempotency_key", sa.String(length=128), nullable=True))
        _ensure_outbox_column(sa.Column("last_error", sa.String(length=500), nullable=True))
        _ensure_outbox_column(sa.Column("next_attempt_at", sa.DateTime(timezone=True), nullable=True))
        _ensure_outbox_column(sa.Column("dead_lettered_at", sa.DateTime(timezone=True), nullable=True))

    op.create_index("ix_outbox_messages_topic", "outbox_messages", ["topic"], if_not_exists=True)
    op.create_index("ix_outbox_messages_status", "outbox_messages", ["status"], if_not_exists=True)
    op.create_index(
        "ix_outbox_messages_idempotency_key",
        "outbox_messages",
        ["idempotency_key"],
        unique=True,
        if_not_exists=True,
    )


def downgrade() -> None:
    op.drop_index("ix_outbox_messages_idempotency_key", table_name="outbox_messages")
    op.drop_index("ix_outbox_messages_status", table_name="outbox_messages")
    op.drop_index("ix_outbox_messages_topic", table_name="outbox_messages")
    op.drop_table("outbox_messages")

    op.drop_index("ix_auth_tokens_expires_at", table_name="auth_tokens")
    op.drop_index("ix_auth_tokens_username", table_name="auth_tokens")
    op.drop_index("ix_auth_tokens_token_type", table_name="auth_tokens")
    op.drop_index("ix_auth_tokens_token_hash", table_name="auth_tokens")
    op.drop_table("auth_tokens")

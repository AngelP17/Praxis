from collections.abc import Callable

from fastapi import Header, HTTPException

from apps.api_gateway.config import settings
from apps.api_gateway.services.auth_service import AuthService


CurrentUser = dict[str, str]

# Synthetic identity used when auth enforcement is gated off (non-production).
# Keeps the deterministic public demo and local dev clickable without tokens
# while production still requires a real bearer token.
_DEMO_IDENTITY: CurrentUser = {
    "username": "demo-operator",
    "role": "agent",
    "display_name": "Demo Operator",
}


def get_current_user(authorization: str | None = Header(default=None)) -> CurrentUser:
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.replace("Bearer ", "", 1)
    user = AuthService().current_user(token)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user


def require_roles(*roles: str) -> Callable[[str | None], CurrentUser]:
    allowed = set(roles)

    def dependency(authorization: str | None = Header(default=None)) -> CurrentUser:
        user = get_current_user(authorization)
        if user.get("role") not in allowed:
            raise HTTPException(status_code=403, detail="Insufficient privileges")
        return user

    return dependency


def require_ticket_write(authorization: str | None = Header(default=None)) -> CurrentUser:
    return require_roles("admin", "agent")(authorization)


def require_admin(authorization: str | None = Header(default=None)) -> CurrentUser:
    return require_roles("admin")(authorization)


def production_guarded(*roles: str) -> Callable[[str | None], CurrentUser]:
    """Enforce a bearer token and role membership only when ENV=production.

    In non-production environments this returns a synthetic demo identity so the
    deterministic demo, local dev, and the existing smoke/integration suites stay
    clickable without credentials. In production it delegates to the real
    token-and-role checks, closing the auth gap on state-mutating and
    customer-data routes.
    """
    allowed = set(roles)
    demo_role = next(iter(roles), "agent")

    def dependency(authorization: str | None = Header(default=None)) -> CurrentUser:
        if not settings.is_production:
            return {**_DEMO_IDENTITY, "role": demo_role}
        user = get_current_user(authorization)
        if allowed and user.get("role") not in allowed:
            raise HTTPException(status_code=403, detail="Insufficient privileges")
        return user

    return dependency


# Production-gated dependencies. Use these on routers/routes that mutate state or
# expose customer records but must remain open in the deterministic demo.
require_operator = production_guarded("admin", "agent")
require_admin_gated = production_guarded("admin")

from datetime import timedelta

import jwt

from astraea.auth.security import ALGORITHM, SECRET_KEY, create_access_token, decode_token


def test_access_token_roundtrip():
    token = create_access_token({"sub": "operator"})
    assert decode_token(token)["sub"] == "operator"


def test_expired_token_rejected():
    token = create_access_token({"sub": "operator"}, timedelta(seconds=-1))
    assert decode_token(token) is None


def test_wrong_key_rejected():
    token = jwt.encode({"sub": "operator"}, "wrong-test-key", algorithm=ALGORITHM)
    assert decode_token(token) is None


def test_gateway_persists_verified_token_expiry():
    from apps.api_gateway.services.auth_service import AuthService
    from apps.api_gateway.config import settings

    service = AuthService()
    token = service._create_token({"username": "operator", "role": "viewer", "display_name": "Operator"})
    assert service._token_expiry(token).timestamp() == jwt.decode(
        token, settings.SECRET_KEY, algorithms=[ALGORITHM]
    )["exp"]


def test_gateway_rejects_expiry_from_token_with_invalid_signature():
    from datetime import datetime, timezone
    import pytest
    from apps.api_gateway.services.auth_service import AuthService

    token = jwt.encode({"exp": datetime.now(timezone.utc) + timedelta(minutes=5)},
                       "wrong-test-key", algorithm=ALGORITHM)
    with pytest.raises(jwt.exceptions.InvalidTokenError):
        AuthService()._token_expiry(token)

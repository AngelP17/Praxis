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

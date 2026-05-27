from __future__ import annotations

import hashlib
import json
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import bcrypt
from jose import JWTError, jwt

from apps.api_gateway.config import settings
from infrastructure.db.models.auth_token import AuthToken
from infrastructure.db.session import SessionLocal

ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 30
REFRESH_TOKEN_DAYS = 7
PROJECT_ROOT = Path(__file__).resolve().parents[3]
VALID_ROLES = {"admin", "agent", "viewer"}
USERS_FILE_LOCATIONS = [
    Path(settings.USERS_FILE).expanduser() if settings.USERS_FILE else None,
    PROJECT_ROOT / ".env" / "users.json",
    Path("/etc/secrets/users_data.json"),
    PROJECT_ROOT / "users.json",
    Path("users.json"),
]


class AuthService:
    def __init__(self):
        pass

    def login(self, username: str, password: str) -> dict[str, Any] | None:
        user = self._get_user(username)
        if user is None:
            return None
        if not self._verify_password(password, user["password_hash"]):
            return None

        public_user = {
            "username": user["username"],
            "role": user["role"],
            "display_name": user["display_name"],
        }
        access_token = self._create_token(public_user, token_type="access")
        refresh_token = self._create_token(public_user, token_type="refresh")
        self._store_token(access_token, "access", username)
        self._store_token(refresh_token, "refresh", username)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_MINUTES * 60,
            "user": public_user,
        }
    
    def refresh_token(self, refresh_token: str) -> dict[str, Any] | None:
        try:
            payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        except JWTError:
            return None
        
        if payload.get("type") != "refresh":
            return None
        existing_token = self._active_token_record(refresh_token, "refresh")
        if existing_token is None:
            return None
        
        username = payload.get("sub")
        if not username:
            return None
        
        user = self._get_user(username)
        if user is None:
            return None
        
        public_user = {
            "username": user["username"],
            "role": user["role"],
            "display_name": user["display_name"],
        }
        
        new_access_token = self._create_token(public_user, token_type="access")
        new_refresh_token = self._create_token(public_user, token_type="refresh")
        self._rotate_refresh_token(refresh_token, new_refresh_token, new_access_token, username)
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_MINUTES * 60,
            "user": public_user,
        }
    
    def revoke_token(self, token: str) -> None:
        digest = self._token_digest(token)
        with SessionLocal() as db:
            record = db.query(AuthToken).filter(AuthToken.token_hash == digest).one_or_none()
            if record is not None:
                record.revoked_at = datetime.now(timezone.utc)
                db.commit()
    
    def is_token_revoked(self, token: str) -> bool:
        digest = self._token_digest(token)
        with SessionLocal() as db:
            record = db.query(AuthToken).filter(AuthToken.token_hash == digest).one_or_none()
            if record is None:
                return False
            return record.revoked_at is not None

    def current_user(self, token: str) -> dict[str, Any] | None:
        if self.is_token_revoked(token):
            return None
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        except JWTError:
            return None
        if payload.get("type") != "access":
            return None
        if self._active_token_record(token, "access") is None:
            return None
        username = payload.get("sub")
        if not username:
            return None
        user = self._get_user(username)
        if user is None:
            return None
        return {
            "username": user["username"],
            "role": user["role"],
            "display_name": user["display_name"],
        }

    def list_users(self) -> list[dict[str, str]]:
        return [self._public_user(user) for user in self._load_users()]

    def create_user(
        self,
        username: str,
        password: str,
        role: str,
        display_name: str | None,
    ) -> dict[str, str]:
        normalized_username = username.strip()
        normalized_role = role if role in VALID_ROLES else "viewer"
        if not normalized_username or not password:
            raise ValueError("Username and password required")
        if self._get_user(normalized_username) is not None:
            raise ValueError("Username already exists")

        users = self._load_users()
        user = {
            "username": normalized_username,
            "password_hash": self._hash_password(password),
            "role": normalized_role,
            "display_name": (display_name or normalized_username).strip(),
        }
        users.append(user)
        self._save_users(users)
        return self._public_user(user)

    def update_user(
        self,
        username: str,
        password: str | None = None,
        role: str | None = None,
        display_name: str | None = None,
    ) -> dict[str, str] | None:
        users = self._load_users()
        for user in users:
            if user["username"] != username:
                continue
            if role is not None:
                user["role"] = role if role in VALID_ROLES else user["role"]
            if display_name is not None and display_name.strip():
                user["display_name"] = display_name.strip()
            if password:
                user["password_hash"] = self._hash_password(password)
            self._save_users(users)
            return self._public_user(user)
        return None

    def delete_user(self, username: str) -> bool:
        if username == "admin":
            raise ValueError("Cannot delete admin user")
        users = self._load_users()
        remaining_users = [user for user in users if user["username"] != username]
        if len(remaining_users) == len(users):
            return False
        self._save_users(remaining_users)
        return True

    def change_password(self, username: str, current_password: str, new_password: str) -> None:
        if not new_password:
            raise ValueError("New password required")
        users = self._load_users()
        for user in users:
            if user["username"] != username:
                continue
            if not self._verify_password(current_password, user["password_hash"]):
                raise PermissionError("Current password incorrect")
            user["password_hash"] = self._hash_password(new_password)
            self._save_users(users)
            return
        raise LookupError("User not found")

    def _create_token(self, user: dict[str, Any], token_type: str = "access") -> str:
        if token_type == "refresh":
            expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_DAYS)
        else:
            expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES)
        payload = {
            "sub": user["username"],
            "role": user["role"],
            "display_name": user["display_name"],
            "type": token_type,
            "exp": expires_at,
            "jti": secrets.token_hex(16),
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)

    def _token_digest(self, token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()

    def _token_expiry(self, token: str) -> datetime:
        payload = jwt.get_unverified_claims(token)
        exp = payload.get("exp")
        if isinstance(exp, (int, float)):
            return datetime.fromtimestamp(exp, tz=timezone.utc)
        if isinstance(exp, datetime):
            return exp if exp.tzinfo else exp.replace(tzinfo=timezone.utc)
        raise ValueError("Token expiry missing")

    def _store_token(self, token: str, token_type: str, username: str) -> None:
        record = AuthToken(
            token_hash=self._token_digest(token),
            token_type=token_type,
            username=username,
            expires_at=self._token_expiry(token),
        )
        with SessionLocal() as db:
            db.merge(record)
            db.commit()

    def _active_token_record(self, token: str, token_type: str) -> AuthToken | None:
        now = datetime.now(timezone.utc)
        with SessionLocal() as db:
            record = (
                db.query(AuthToken)
                .filter(AuthToken.token_hash == self._token_digest(token))
                .filter(AuthToken.token_type == token_type)
                .one_or_none()
            )
            if record is None or record.revoked_at is not None:
                return None
            expires_at = record.expires_at
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at <= now:
                record.revoked_at = now
                db.commit()
                return None
            return record

    def _rotate_refresh_token(
        self,
        old_refresh_token: str,
        new_refresh_token: str,
        new_access_token: str,
        username: str,
    ) -> None:
        now = datetime.now(timezone.utc)
        old_digest = self._token_digest(old_refresh_token)
        new_digest = self._token_digest(new_refresh_token)
        with SessionLocal() as db:
            old_record = db.query(AuthToken).filter(AuthToken.token_hash == old_digest).one_or_none()
            if old_record is not None:
                old_record.revoked_at = now
                old_record.replaced_by_hash = new_digest
            db.add(
                AuthToken(
                    token_hash=new_digest,
                    token_type="refresh",
                    username=username,
                    expires_at=self._token_expiry(new_refresh_token),
                )
            )
            db.add(
                AuthToken(
                    token_hash=self._token_digest(new_access_token),
                    token_type="access",
                    username=username,
                    expires_at=self._token_expiry(new_access_token),
                )
            )
            db.commit()

    def _get_user(self, username: str) -> dict[str, Any] | None:
        for user in self._load_users():
            if user["username"] == username:
                return user
        return None

    def _public_user(self, user: dict[str, Any]) -> dict[str, str]:
        return {
            "username": user["username"],
            "role": user.get("role", "viewer"),
            "display_name": user.get("display_name", user["username"]),
        }

    def _load_users(self) -> list[dict[str, Any]]:
        for path in USERS_FILE_LOCATIONS:
            if path is None or not path.exists():
                continue
            with path.open("r", encoding="utf-8") as file:
                data = json.load(file)
            return data.get("users", [])
        return []

    def _save_users(self, users: list[dict[str, Any]]) -> None:
        destination = self._resolve_users_file()
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(json.dumps({"users": users}, indent=2), encoding="utf-8")

    def _resolve_users_file(self) -> Path:
        for path in USERS_FILE_LOCATIONS:
            if path is not None and path.exists():
                return path
        for path in USERS_FILE_LOCATIONS:
            if path is not None:
                return path
        return PROJECT_ROOT / "users.json"

    def _hash_password(self, password: str) -> str:
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    def _verify_password(self, password: str, password_hash: str) -> bool:
        if not password_hash.startswith("$2b$"):
            legacy_hash = hashlib.sha256(password.encode()).hexdigest()
            if legacy_hash == password_hash:
                return True
            return False
        return bcrypt.checkpw(password.encode(), password_hash.encode())

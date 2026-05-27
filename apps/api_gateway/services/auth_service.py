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
    _revoked_tokens: set[str] = set()
    _refresh_tokens: dict[str, dict[str, Any]] = {}
    
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
        
        self._refresh_tokens[refresh_token] = {
            "username": username,
            "created_at": datetime.now(timezone.utc),
        }
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_MINUTES * 60,
            "user": public_user,
        }
    
    def refresh_token(self, refresh_token: str) -> dict[str, Any] | None:
        if refresh_token not in self._refresh_tokens:
            return None
        
        try:
            payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        except JWTError:
            return None
        
        if payload.get("type") != "refresh":
            return None
        
        username = payload.get("sub")
        if not username:
            return None
        
        user = self._get_user(username)
        if user is None:
            return None
        
        del self._refresh_tokens[refresh_token]
        self._revoked_tokens.add(refresh_token)
        
        public_user = {
            "username": user["username"],
            "role": user["role"],
            "display_name": user["display_name"],
        }
        
        new_access_token = self._create_token(public_user, token_type="access")
        new_refresh_token = self._create_token(public_user, token_type="refresh")
        
        self._refresh_tokens[new_refresh_token] = {
            "username": username,
            "created_at": datetime.now(timezone.utc),
        }
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_MINUTES * 60,
            "user": public_user,
        }
    
    def revoke_token(self, token: str) -> None:
        self._revoked_tokens.add(token)
        if token in self._refresh_tokens:
            del self._refresh_tokens[token]
    
    def is_token_revoked(self, token: str) -> bool:
        return token in self._revoked_tokens

    def current_user(self, token: str) -> dict[str, Any] | None:
        if self.is_token_revoked(token):
            return None
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        except JWTError:
            return None
        if payload.get("type") != "access":
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

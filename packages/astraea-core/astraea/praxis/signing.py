"""Ed25519 signing for Praxis proof objects (PPP L1 conformance)."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

    HAS_CRYPTOGRAPHY = True
except ImportError:
    HAS_CRYPTOGRAPHY = False

DEFAULT_KEY_DIR = Path.home() / ".praxis" / "keys"
DEFAULT_KEY_PATH = DEFAULT_KEY_DIR / "signing_key.hex"


@dataclass(frozen=True)
class SigningKey:
    private_hex: str
    public_hex: str
    kid: str

    def sign(self, message: str) -> str:
        if not HAS_CRYPTOGRAPHY:
            raise RuntimeError("cryptography package required for Ed25519 signing")
        private_key = Ed25519PrivateKey.from_private_bytes(bytes.fromhex(self.private_hex))
        return private_key.sign(message.encode("utf-8")).hex()


def generate_signing_key(kid: str | None = None) -> SigningKey:
    """Generate a new Ed25519 keypair. Returns hex-encoded keys."""
    if not HAS_CRYPTOGRAPHY:
        raise RuntimeError("cryptography package required for Ed25519 signing")
    key = Ed25519PrivateKey.generate()
    private_hex = key.private_bytes_raw().hex()
    public_hex = key.public_key().public_bytes_raw().hex()
    return SigningKey(
        private_hex=private_hex,
        public_hex=public_hex,
        kid=kid or f"praxis-signing-{public_hex[:16]}",
    )


def load_signing_key(key_path: str | None = None) -> SigningKey | None:
    """Load a signing key from disk or environment. Returns None if unavailable."""
    if not HAS_CRYPTOGRAPHY:
        return None

    env_private = os.environ.get("PRAXIS_SIGNING_KEY_HEX")
    env_public = os.environ.get("PRAXIS_SIGNING_PUBLIC_KEY_HEX")
    env_kid = os.environ.get("PRAXIS_SIGNING_KID", "praxis-signing-env")

    if env_private and env_public:
        return SigningKey(private_hex=env_private, public_hex=env_public, kid=env_kid)

    path = Path(key_path or DEFAULT_KEY_PATH)
    if not path.is_file():
        return None

    lines = path.read_text().strip().splitlines()
    if len(lines) < 2:
        return None

    return SigningKey(
        private_hex=lines[0].strip(),
        public_hex=lines[1].strip(),
        kid=lines[2].strip() if len(lines) > 2 else "praxis-signing-file",
    )


def sign_proof(proof: dict[str, Any], key: SigningKey) -> dict[str, Any]:
    """Attach an Ed25519 signature envelope to a proof object."""
    proof_hash = proof.get("proof_hash")
    if not proof_hash:
        raise ValueError("proof object must have proof_hash before signing")

    signature_hex = key.sign(proof_hash)
    proof["signature"] = {
        "signing_alg": "ed25519",
        "signer_kid": key.kid,
        "signature_hex": signature_hex,
        "public_key_hex": key.public_hex,
    }
    return proof

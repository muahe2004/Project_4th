import bcrypt

_BCRYPT_MAX_PASSWORD_BYTES = 72


def _normalized_password_bytes(password: str) -> bytes:
    # bcrypt only considers the first 72 bytes of a password.
    return password.encode("utf-8")[:_BCRYPT_MAX_PASSWORD_BYTES]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        _normalized_password_bytes(password),
        bcrypt.gensalt(),
    ).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            _normalized_password_bytes(plain_password),
            hashed_password.encode("utf-8"),
        )
    except ValueError:
        return False

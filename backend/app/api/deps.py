from collections.abc import Generator
from typing import Annotated

from fastapi import Depends
# from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from app.core.config import settings
from app.core.database import engine

# reusable_oauth2 = OAuth2PasswordBearer(
#     tokenUrl=f"{settings.API_V1_STR}/login/access-token"
# )


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
# TokenDep = Annotated[str, Depends(reusable_oauth2)]


# def get_current_user(session: SessionDep, token: TokenDep) -> Users:
#     try:
#         payload = jwt.decode(
#             token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
#         )
#         token_data = TokenPayload(**payload)
#     except (InvalidTokenError, ValidationError):
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Could not validate credentials",
#         )
#     user = session.get(Users, token_data.sub)
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     if not user.is_active:
#         raise HTTPException(status_code=400, detail="Inactive user")
#     return user
#
#
# CurrentUser = Annotated[Users, Depends(get_current_user)]

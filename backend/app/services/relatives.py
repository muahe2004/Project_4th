import uuid
from fastapi import HTTPException, Request
from sqlmodel import Session, select, delete
from starlette import status
from typing import List

from app.models.models import Relatives
from app.models.schemas.relatives.relative_schemas import (
    RelativePublic,
    RelativeCreate,
    RelativeUpdate,
    RelativeDeleteResponse,
    UserRelativeCreate,
)


class RelativeServices:
    @staticmethod
    def get_all(*, session: Session) -> List[RelativePublic]:
        relatives = session.exec(select(Relatives)).all()
        return relatives

    @staticmethod
    def get_by_id(
        *, session: Session, relative_id: uuid.UUID, request: Request
    ) -> RelativePublic:
        relative = session.get(Relatives, relative_id)
        if not relative:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Relative does not exist"
            )
        return RelativePublic.model_validate(relative)

    @staticmethod
    def create(*, session: Session, relative: RelativeCreate) -> RelativePublic:

        new_relative = Relatives(**relative.dict())
        session.add(new_relative)
        session.commit()
        session.refresh(new_relative)

        return new_relative

    @staticmethod
    def update(
        *, session: Session, relative_id: uuid.UUID, relative_data: RelativeUpdate
    ) -> RelativePublic:
        relative = session.get(Relatives, relative_id)
        if not relative:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Relative not found"
            )

        update_data = relative_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(relative, field, value)

        session.commit()

        return RelativePublic.model_validate(relative)

    @staticmethod
    def replace_for_student(
        *,
        session: Session,
        student_id: uuid.UUID,
        relatives: list[UserRelativeCreate],
        commit: bool = True,
    ) -> list[RelativePublic]:
        session.exec(delete(Relatives).where(Relatives.student_id == student_id))

        created_relatives: list[Relatives] = []
        for relative in relatives:
            relative_data = relative.model_dump(exclude_none=True)
            if not relative_data:
                continue
            new_relative = Relatives(
                **relative_data,
                student_id=student_id,
            )
            session.add(new_relative)
            created_relatives.append(new_relative)

        if commit:
            session.commit()
        else:
            session.flush()

        return [RelativePublic.model_validate(rel) for rel in created_relatives]

    @staticmethod
    def replace_for_teacher(
        *,
        session: Session,
        teacher_id: uuid.UUID,
        relatives: list[UserRelativeCreate],
        commit: bool = True,
    ) -> list[RelativePublic]:
        session.exec(delete(Relatives).where(Relatives.teacher_id == teacher_id))

        created_relatives: list[Relatives] = []
        for relative in relatives:
            relative_data = relative.model_dump(exclude_none=True)
            if not relative_data:
                continue
            new_relative = Relatives(
                **relative_data,
                teacher_id=teacher_id,
            )
            session.add(new_relative)
            created_relatives.append(new_relative)

        if commit:
            session.commit()
        else:
            session.flush()

        return [RelativePublic.model_validate(rel) for rel in created_relatives]

    @staticmethod
    def delete(*, session: Session, relative_id: uuid.UUID) -> RelativeDeleteResponse:
        relative = session.get(Relatives, relative_id)
        if not relative:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Relative not found"
            )

        session.delete(relative)
        session.commit()

        return RelativeDeleteResponse(
            id=str(relative.id), message="Relative deleted successfully"
        )

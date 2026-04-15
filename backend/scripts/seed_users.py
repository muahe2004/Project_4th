from __future__ import annotations

from sqlmodel import Session, select

from app.core.database import engine
from app.enums.status import StatusEnum
from app.middleware.hashing import hash_password
from app.models.models import Students, Teachers


def _upsert_teacher(
    *,
    session: Session,
    teacher_code: str,
    name: str,
    password: str,
    email: str,
    status: str = StatusEnum.ACTIVE,
    is_admin: bool = False,
) -> None:
    existing = session.exec(
        select(Teachers).where(Teachers.teacher_code == teacher_code)
    ).first()

    if existing:
        existing.name = name
        existing.password = hash_password(password)
        existing.email = email
        existing.status = status
        session.add(existing)
        return

    session.add(
        Teachers(
            teacher_code=teacher_code,
            name=name,
            password=hash_password(password),
            email=email,
            status=status,
            academic_rank="Admin" if is_admin else "Teacher",
        )
    )


def _upsert_student(
    *,
    session: Session,
    student_code: str,
    name: str,
    password: str,
    email: str,
    status: str = StatusEnum.ACTIVE,
) -> None:
    existing = session.exec(
        select(Students).where(Students.student_code == student_code)
    ).first()

    if existing:
        existing.name = name
        existing.password = hash_password(password)
        existing.email = email
        existing.status = status
        session.add(existing)
        return

    session.add(
        Students(
            student_code=student_code,
            name=name,
            password=hash_password(password),
            email=email,
            status=status,
        )
    )


def seed_users() -> None:
    with Session(engine) as session:
        _upsert_teacher(
            session=session,
            teacher_code="000000",
            name="ADMIN",
            password="00000000",
            email="admin@unicore.ums",
            status=StatusEnum.ACTIVE,
            is_admin=True,
        )
        _upsert_teacher(
            session=session,
            teacher_code="010000",
            name="Minh BlueOC",
            password="010000",
            email="minh.ly@unicore.ums",
            status=StatusEnum.ACTIVE,
        )
        _upsert_student(
            session=session,
            student_code="020000",
            name="Lý Văn Minh",
            password="020000",
            email="lyvanminh@unicore.ums",
            status=StatusEnum.ACTIVE,
        )

        session.commit()


if __name__ == "__main__":
    seed_users()
    print("Seed users completed.")

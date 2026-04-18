from fastapi import APIRouter
from sqlmodel import select

from app.api.deps import SessionDep
from app.models.models import Students
from app.services.export_file import ExportFileServices

router = APIRouter()


def _gender_display(gender: str | None) -> str:
    if gender == "1":
        return "Nam"
    if gender == "2":
        return "Nữ"
    if gender == "3":
        return "Khác"
    return ""


@router.get("/students")
def export_students(
    session: SessionDep,
):
    students = session.exec(
        select(Students).order_by(Students.created_at.desc())
    ).all()

    headers = [
        "Mã sinh viên",
        "Họ và tên",
        "Giới tính",
        "Ngày sinh",
        "Email",
        "Số điện thoại",
        "Địa chỉ",
        "Trạng thái",
        "Ngày tạo",
    ]

    rows = [
        [
            student.student_code,
            student.name,
            _gender_display(student.gender),
            student.date_of_birth.strftime("%d/%m/%Y")
            if student.date_of_birth
            else "",
            student.email or "",
            student.phone or "",
            student.address or "",
            student.status or "",
            student.created_at.strftime("%d/%m/%Y %H:%M:%S")
            if student.created_at
            else "",
        ]
        for student in students
    ]

    return ExportFileServices.export_excel_response(
        headers=headers,
        rows=rows,
        file_name="students_export.xlsx",
        sheet_name="Students",
    )


@router.get("/students-template")
def export_students_template():
    return ExportFileServices.export_students_template_response(
        file_name="students_template.xlsx",
    )


@router.get("/teachers-template")
def export_teachers_template():
    return ExportFileServices.export_teachers_template_response(
        file_name="teachers_template.xlsx",
    )


@router.get("/teaching-schedules-template")
def export_teaching_schedules_template():
    return ExportFileServices.export_teaching_schedules_template_response(
        file_name="teaching_schedules_template.xlsx",
    )

from fastapi import APIRouter

from app.api.routes import (
    departments,
    majors,
    specializations,
    classes,
    # teachers,
    students,
    user_informations,
    rooms,
    subjects,
    scores,
    score_components,
    tuition_fees,
    learning_schedules,
    relatives,
    teaching_schedules,
    examination_schedules,
    auth,
    student_class
)

api_router = APIRouter()
api_router.include_router(departments.router, prefix="/departments", tags=["departments"])
api_router.include_router(majors.router, prefix="/majors", tags=["majors"])
api_router.include_router(specializations.router, prefix="/specializations", tags=["specializations"])
api_router.include_router(classes.router, prefix="/classes", tags=["classes"])
# api_router.include_router(teachers.router, prefix="/teachers", tags=["teachers"])
api_router.include_router(students.router, prefix="/students", tags=["students"])
api_router.include_router(user_informations.router, prefix="/user_information", tags=["user_information"])
api_router.include_router(rooms.router, prefix="/rooms", tags=["rooms"])
api_router.include_router(subjects.router, prefix="/subjects", tags=["subjects"])
api_router.include_router(scores.router, prefix="/scores", tags=["scores"])
api_router.include_router(score_components.router, prefix="/score_components", tags=["score_components"])
api_router.include_router(tuition_fees.router, prefix="/tuition_fees", tags=["tuition_fees"])
api_router.include_router(learning_schedules.router, prefix="/learning_schedules", tags=["learning_schedules"])
api_router.include_router(relatives.router, prefix="/relatives", tags=["relatives"])
api_router.include_router(teaching_schedules.router, prefix="/teaching_schedules", tags=["teaching_schedules"])
api_router.include_router(examination_schedules.router, prefix="/examination_schedules", tags=["examination_schedules"])
api_router.include_router(student_class.router, prefix="/student_class", tags=["student_class"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
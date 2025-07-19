from fastapi import APIRouter

from app.api.routes import (
    departments,
    majors,
    specializations,
    classes,
    teachers,
)

api_router = APIRouter()
api_router.include_router(departments.router, prefix="/departments", tags=["departments"])
api_router.include_router(majors.router, prefix="/majors", tags=["majors"])
api_router.include_router(specializations.router, prefix="/specializations", tags=["specializations"])
api_router.include_router(classes.router, prefix="/classes", tags=["classes"])
api_router.include_router(teachers.router, prefix="/teachers", tags=["teachers"])
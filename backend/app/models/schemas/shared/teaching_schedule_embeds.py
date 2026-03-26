from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel
from pydantic import BaseModel as PydanticBaseModel

from app.models.schemas.learning_schedules.learning_schedule_schemas import (
    LearningSchedulePublic,
)

class TeachingScheduleRoomInfo(PydanticBaseModel): # use at model: TeachingScheduleResponse
    room_id: UUID
    room_number: Optional[int] = None

class TeachingScheduleTeacherInfo(BaseModel):
    teacher_id: UUID
    teacher_name: Optional[str] = None
    teacher_email: Optional[str] = None
    teacher_phone: Optional[str] = None

class TeachingScheduleClassInfo(PydanticBaseModel): # use at TeachingScheduleResponse
    class_id: UUID
    class_name: Optional[str] = None
    class_code: Optional[str] = None

class TeachingScheduleSubjectInfo(PydanticBaseModel): # use at model: TeachingScheduleResponse
    subject_id: UUID
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None

class TeachingScheduleInTeacher(BaseModel):
    id: UUID
    status: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    learning_schedule: LearningSchedulePublic
    room: Optional[TeachingScheduleRoomInfo] = None
    class_info: Optional[TeachingScheduleClassInfo] = None
    subject: Optional[TeachingScheduleSubjectInfo] = None

class TeachingScheduleInRoom(BaseModel):
    id: UUID
    status: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    learning_schedule: LearningSchedulePublic
    teacher: Optional[TeachingScheduleTeacherInfo] = None
    class_info: Optional[TeachingScheduleClassInfo] = None
    subject: Optional[TeachingScheduleSubjectInfo] = None

class TeachingScheduleInClass(BaseModel):
    id: UUID
    status: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    learning_schedule: LearningSchedulePublic
    teacher: Optional[TeachingScheduleTeacherInfo] = None
    room: Optional[TeachingScheduleRoomInfo] = None
    subject: Optional[TeachingScheduleSubjectInfo] = None
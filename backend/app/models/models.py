import uuid
from sqlmodel import SQLModel, Field
from app.models.schemas.departments.department_schemas import DepartmentBase
from app.models.schemas.majors.major_schemas import MajorBase
from app.models.schemas.subjects.subject_schemas import SubjectBase
from app.models.schemas.learning_schedules.learning_schedule_schemas import LearningScheduleBase
from app.models.schemas.examination_schedules.examination_schedule_schemas import ExaminationScheduleBase  
from app.models.schemas.teaching_schedules.teaching_schedule_schemas import TeachingScheduleBase
from app.models.schemas.classes.class_schemas import ClassBase
from app.models.schemas.teachers.teacher_schemas import TeacherBase
from app.models.schemas.students.student_schemas import StudentBase 
from app.models.schemas.specializations.specialization_schemas import SpecializationBase
from app.models.schemas.rooms.room_schemas import RoomBase
from app.models.schemas.tuition_fees.tuition_fee_schemas import TuitionFeeBase
from app.models.schemas.user_informations.user_information_schemas import UserInformationBase
from app.models.schemas.score_components.score_component_schemas import ScoreComponentBase
from app.models.schemas.scores.score_schemas import ScoresBase
from app.models.schemas.relatives.relative_schemas import RelativeBase

class Departments(DepartmentBase, table=True):
    __tablename__ = "departments"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Majors(MajorBase, table=True):
    __tablename__ = "majors"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Subjects(SubjectBase, table=True):
    __tablename__ = "subjects"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class LearningSchedules(LearningScheduleBase, table=True):
    __tablename__ = "learning_schedules"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class ExaminationSchedules(ExaminationScheduleBase, table=True):
    __tablename__ = "examination_schedules"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class TeachingSchedules(TeachingScheduleBase, table=True):
    __tablename__ = "teaching_schedules"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True) 

class Classes(ClassBase, table=True):
    __tablename__ = "classes"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Teachers(TeacherBase, table=True):
    __tablename__ = "teachers"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Students(StudentBase, table=True):
    __tablename__ = "students"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Specializations(SpecializationBase, table=True):
    __tablename__ = "specializations"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Rooms(RoomBase, table=True):
    __tablename__ = "rooms"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class TuitionFees(TuitionFeeBase, table=True):
    __tablename__ = "tuition_fees"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class UserInformations(UserInformationBase, table=True):
    __tablename__ = "user_informations"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class ScoreComponents(ScoreComponentBase, table=True):
    __tablename__ = "score_components"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Scores(ScoresBase, table=True):
    __tablename__ = "scores"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Relatives(RelativeBase, table=True):
    __tablename__ = "relatives"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

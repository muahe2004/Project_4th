from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Integer, Float
from uuid import UUID


class ScoresBase(SQLModel):
    student_id: UUID | None = Field(foreign_key="students.id", nullable=False)
    subject_id: UUID | None = Field(foreign_key="subjects.id", nullable=False)
    score_component_id: UUID | None = Field(default=None, foreign_key="score_components.id")
    academic_term_id: UUID = Field(foreign_key="academic_terms.id", nullable=False)
    score: float | None = Field(sa_column=Column(Float, nullable=True))
    attempt: int = Field(default=1, sa_column=Column(Integer, default=1)) # lần thi ( có sinh viên học lại >= 2 lần)
    score_type: Optional[str] = Field(default="Official", sa_column=Column(String(20), default="Official")) # điểm lần 1, thi lại, cải thiện 
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class ScoresPublic(ScoresBase):
    id: UUID


class ScoresCreate(ScoresBase):
    component_type: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))


class ScoresUpdate(SQLModel):
    student_id: UUID | None = Field(default=None, foreign_key="students.id")
    score_component_id: Optional[UUID] = Field(default=None, foreign_key="score_components.id")
    component_type: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    score: float | None = Field(sa_column=Column(Float, nullable=True))
    attempt: Optional[int] = Field(default=1, sa_column=Column(Integer, default=1))
    score_type: Optional[str] = Field(
        default="Official", sa_column=Column(String(20), default="Official")
    )  # Chính thức / Thi lại / Cải thiện
    status: Optional[str] = Field(
        default=None, sa_column=Column(String(50), nullable=True)
    )
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )


class ScoresDeleteResponse(SQLModel):
    message: str
    id: UUID


class ScoreBulkCreatePayload(SQLModel):
    scores: list[ScoresCreate] = Field(default_factory=list)


class ScoreBulkCreateResponse(SQLModel):
    items: list[ScoresPublic] = Field(default_factory=list)
    total: int


class ScoreBulkUpdateItem(SQLModel):
    id: UUID
    score_component_id: Optional[UUID] = Field(default=None, foreign_key="score_components.id")
    score: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    component_type: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    score_type: Optional[str] = Field(default=None, sa_column=Column(String(20), nullable=True))
    status: Optional[str] = Field(default=None, sa_column=Column(String(50), nullable=True))
    updated_at: datetime = Field(
        default_factory=datetime.now, sa_column=Column(DateTime, nullable=False)
    )


class ScoreBulkUpdatePayload(SQLModel):
    scores: list[ScoreBulkUpdateItem] = Field(default_factory=list)


class ScoreBulkUpdateResponse(SQLModel):
    items: list[ScoresPublic] = Field(default_factory=list)
    total: int


class ScoreBulkStatusUpdateItem(SQLModel):
    id: UUID


class ScoreBulkStatusUpdatePayload(SQLModel):
    scores: list[ScoreBulkStatusUpdateItem] = Field(default_factory=list)


class ScoreBulkStatusUpdateResponse(SQLModel):
    items: list[ScoresPublic] = Field(default_factory=list)
    total: int


class StudentScoreFilterParams(SQLModel):
    academic_term_id: Optional[UUID] = Field(default=None)
    subject_id: Optional[UUID] = Field(default=None)


class StudentInfoScoreResponse(SQLModel):
    id: UUID
    student_code: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None


class StudentScoreComponentResponse(SQLModel):
    id: UUID
    component_type: str
    weight: float
    description: Optional[str] = None


class StudentScoreItemResponse(SQLModel):
    id: UUID
    subject_id: UUID
    subject_code: str
    subject_name: str
    subject_credit: int
    academic_term_id: UUID
    academic_year: str
    semester: Optional[int] = None
    score: float | None
    attempt: int
    score_type: Optional[str] = None
    status: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    score_component: StudentScoreComponentResponse


class StudentScoresPayload(SQLModel):
    items: list[StudentScoreItemResponse]
    total: int


class StudentScoreByStudentResponse(SQLModel):
    student_info: StudentInfoScoreResponse
    scores: StudentScoresPayload


class ScoreByClassSubjectParams(SQLModel):
    class_id: UUID
    subject_id: UUID


class StudentScoreByClassSubjectItem(SQLModel):
    student_info: StudentInfoScoreResponse
    scores: list[StudentScoreItemResponse]


class ScoreByClassSubjectResponse(SQLModel):
    class_id: UUID
    class_name: str
    subject_id: UUID
    subject_name: str
    students: list[StudentScoreByClassSubjectItem]
    total_students: int


class StudentGpaClassInfo(SQLModel):
    class_id: Optional[UUID] = None
    class_code: Optional[str] = None
    class_name: Optional[str] = None


class StudentGpaSummary(SQLModel):
    grade4: str
    grade10: str
    gpa4: float
    accumulated_gpa4: float
    accumulated_gpa10: float
    accumulated_credits: int
    studied_credits: int


class StudentAndGpaResponse(SQLModel):
    student_info: StudentInfoScoreResponse
    class_info: StudentGpaClassInfo
    gpa: StudentGpaSummary


class StudentAndGpaListItem(SQLModel):
    student_info: StudentInfoScoreResponse
    class_info: StudentGpaClassInfo
    gpa: StudentGpaSummary


class StudentAndGpaListResponse(SQLModel):
    data: list[StudentAndGpaListItem]
    total: int


class ScorePointItem(SQLModel):
    score: float | None
    weight: float
    attempt: int
    score_type: Optional[str] = None
    component_type: str


class ScoreAggregationBucket(SQLModel):
    subject_id: UUID
    academic_term_id: UUID
    academic_year: str
    semester: Optional[int] = None
    points: list[ScorePointItem] = Field(default_factory=list)


class ScoreFileData(SQLModel):
    row: int
    stt: int | None = None
    class_code: str | None = None
    student_code: str | None = None
    student_id: UUID | None = None
    student_name: str | None = None
    family_name: str | None = None
    given_name: str | None = None
    d1: float | None = None
    d2: float | None = None
    thi: float | None = None
    tbm: float | None = None
    note: str | None = None


class ScoreFileInvalidRow(ScoreFileData):
    errors: list[str] = Field(default_factory=list)


class ScoreFileInfo(SQLModel):
    file_name: str
    headers: list[str] = Field(default_factory=list)
    header_row: int
    total_rows: int
    valid_rows_count: int
    invalid_rows_count: int
    class_code: str | None = None
    academic_year: str | None = None
    semester: int | None = None
    academic_term_id: UUID | None = None
    subject_name: str | None = None
    subject_code: str | None = None
    subject_id: UUID | None = None
    attempt: int | None = None


class ScoreFileDataResponse(SQLModel):
    file_information: ScoreFileInfo
    scores: list[ScoreFileData] = Field(default_factory=list)
    invalid_scores: list[ScoreFileInvalidRow] = Field(default_factory=list)


class ScoreImportItem(SQLModel):
    score_1: float | None = None
    score_2: float | None = None
    score_exam: float | None = None
    student_id: UUID | None = None
    student_code: str | None = None
    class_code: str | None = None


class ScoreImportListPayload(SQLModel):
    academic_term_id: UUID
    subject_id: UUID
    attempt: int
    scores: list[ScoreImportItem] = Field(default_factory=list)


class ScoreImportCreatedItem(SQLModel):
    student_id: UUID
    subject_id: UUID
    academic_term_id: UUID
    score_ids: list[UUID] = Field(default_factory=list)


class ScoreImportListResponse(SQLModel):
    items: list[ScoreImportCreatedItem] = Field(default_factory=list)
    total: int

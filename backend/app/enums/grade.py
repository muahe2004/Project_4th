from enum import Enum


class GradeRankEnum(str, Enum):
    NOT_RANKED = "Chưa xếp hạng"
    EXCELLENT = "Xuất sắc"
    GOOD = "Giỏi"
    FAIR = "Khá"
    AVERAGE = "Trung bình"
    POOR = "Yếu"


class GradeScaleEnum(str, Enum):
    A = "A"
    B_PLUS = "B+"
    B = "B"
    C_PLUS = "C+"
    C = "C"
    D_PLUS = "D+"
    D = "D"
    F = "F"


class ScoreTypeEnum(str, Enum):
    OFFICIAL = "Official"
    RETAKE = "Retake"


class ScoreComponentTypeEnum(str, Enum):
    MIDDLE = "Middle"
    FINAL = "Final"
    OTHER = "Other"


GRADE_SCALE_THRESHOLDS = (
    (8.5, 4.0, GradeScaleEnum.A),
    (8.0, 3.5, GradeScaleEnum.B_PLUS),
    (7.0, 3.0, GradeScaleEnum.B),
    (6.5, 2.5, GradeScaleEnum.C_PLUS),
    (5.5, 2.0, GradeScaleEnum.C),
    (5.0, 1.5, GradeScaleEnum.D_PLUS),
    (4.0, 1.0, GradeScaleEnum.D),
)

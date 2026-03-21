from enum import Enum

class ClassTypeEnum(str, Enum):
    PRIMARY = "PRIMARY"
    SECONDARY = "SECONDARY"
    OTHER = "OTHER"
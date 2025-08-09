from enum import Enum

class RoleEnum(str, Enum):
    TEACHER = "TEACHER"
    STUDENT = "STUDENT"
    ADMIN = "ADMIN"

class UserCodeTypeEnum(str, Enum):
    TEACHER = "01"
    STUDENT = "02"
    ADMIN = "00"
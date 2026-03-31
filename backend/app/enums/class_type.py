from enum import Enum

class ClassTypeEnum(str, Enum): # for student_class
    PRIMARY = "primary"
    SECONDARY = "secondary"
    OTHER = "other"

class ClassesTypeEnum(str, Enum): # for classes table
    HOMEROOM = "homeroom"
    COURSE_SECTION = "course_section"
    OTHER = "other"

class ClassRegistrationStatus(str, Enum): # for classes table
    OPEN = "open"
    CLOSED = "closed"
    OTHER = "other"
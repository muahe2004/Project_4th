export const BASE_UNICORE_API_URL = import.meta.env.VITE_UNICORE_API_URL;
export const UNIUSERS_PREFIX = import.meta.env.VITE_UNIUSERS_PREFIX;
export const UNICORE_PREFIX = import.meta.env.VITE_UNICORE_PREFIX;
export const UNILEARN_PREFIX = import.meta.env.VITE_UNILEARN_PREFIX;

// Auth
export const URL_API_AUTH = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/auth/login`;

// Teacher
export const URL_API_TEACHER = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/teachers`;

// Student
export const URL_API_STUTDENT = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/students`;

// User information
export const URL_API_USER_INFORMATION = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/user_information`;

// Relatives
export const URL_API_RELATIVES = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/relatives`;

// Department
export const URL_API_DEPARTMENT = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/departments`;

// Major
export const URL_API_MAJOR = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/majors`;

// Specialization
export const URL_API_SPECIALIZATION = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/specializations`;

// Class
export const URL_API_CLASS = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/classes`;

// Room
export const URL_API_ROOM = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/rooms`;

// Subject
export const URL_API_SUBJECT = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/subjects`;

// Score
export const URL_API_SCORE = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/scores`;

// Teaching Schedule
export const URL_API_TEACHING_SCHEDULE = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/teaching_schedules`;

// Examination Schedule
export const URL_API_EXAMINATION_SCHEDULE = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/examination_schedules`;

// Course
export const URL_API_COURSE = `${BASE_UNICORE_API_URL}/${UNILEARN_PREFIX}/courses`;

// Lesson
export const URL_API_LESSON = `${BASE_UNICORE_API_URL}/${UNILEARN_PREFIX}/lessons`;

// Lecture
export const URL_API_LECTURE = `${BASE_UNICORE_API_URL}/${UNILEARN_PREFIX}/lectures`;

// Question
export const URL_API_QUESTION = `${BASE_UNICORE_API_URL}/${UNILEARN_PREFIX}/questions`;

// Answer
export const URL_API_ANSWER = `${BASE_UNICORE_API_URL}/${UNILEARN_PREFIX}/answers`;

// Upload
export const URL_API_UPLOAD = `${BASE_UNICORE_API_URL}/${UNILEARN_PREFIX}/upload`;

// Export
export const URL_API_EXPORT = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/export-file`;
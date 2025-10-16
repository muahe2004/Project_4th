export const BASE_UNICORE_API_URL = import.meta.env.VITE_UNICORE_API_URL;
export const UNIUSERS_PREFIX = import.meta.env.VITE_UNIUSERS_PREFIX;
export const UNICORE_PREFIX = import.meta.env.VITE_UNICORE_PREFIX;
export const UNILEARN_PREFIX = import.meta.env.VITE_UNILEARN_PREFIX;

// Auth
export const URL_API_AUTH = `${BASE_UNICORE_API_URL}/${UNIUSERS_PREFIX}/auth/login`;

// Teacher
export const URL_API_TEACHER = `${BASE_UNICORE_API_URL}/${UNIUSERS_PREFIX}/teachers`;

// Student
export const URL_API_STUTDENT = `${BASE_UNICORE_API_URL}/${UNIUSERS_PREFIX}/students`;

// User information
export const URL_API_USER_INFORMATION = `${BASE_UNICORE_API_URL}/${UNIUSERS_PREFIX}/user_information`;

// Department
export const URL_API_DEPARTMENT = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/departments`;

// Major
export const URL_API_MAJOR = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/majors`;

// Class
export const URL_API_CLASS = `${BASE_UNICORE_API_URL}/${UNICORE_PREFIX}/classes`;

// Course
export const URL_API_COURSE = `${BASE_UNICORE_API_URL}/${UNILEARN_PREFIX}/courses`;

// Lesson
export const URL_API_LESSON = `${BASE_UNICORE_API_URL}/${UNILEARN_PREFIX}/lessons`;

// Upload
export const URL_API_UPLOAD = `${BASE_UNICORE_API_URL}/${UNILEARN_PREFIX}/upload`;
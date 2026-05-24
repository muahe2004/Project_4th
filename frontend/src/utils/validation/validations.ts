import { EMAIL_REGEX, PHONE_NUMBER_REGEX, STUDENT_CODE_REGEX } from './regex';

export const isRequired = (value: string | null | undefined): boolean => {
    return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const isEmail = (value: string | null | undefined): boolean => {
  if (!value) return false;
  return EMAIL_REGEX.test(value);
};

export const isPhoneNumber = (value: string | null | undefined): boolean => {
  if (!value) return false;
  return PHONE_NUMBER_REGEX.test(value.trim());
};

export const isStudentCode = (value: string | null | undefined): boolean => {
  if (!value) return false;
  return STUDENT_CODE_REGEX.test(value.trim());
};

export const positiveIntegerSlotProps = {input: { inputProps: { min: 0 }}}

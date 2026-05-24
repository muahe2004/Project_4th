import { isEmail, isPhoneNumber, isRequired, isStudentCode } from "./validations";

export const getRequiredError = (
  value: string | null | undefined,
  requiredMessage: string
): string => {
  return isRequired(value) ? "" : requiredMessage;
};

export const getEmailError = (
  value: string | null | undefined,
  requiredMessage: string,
  invalidMessage: string
): string => {
  const requiredError = getRequiredError(value, requiredMessage);
  if (requiredError) {
    return requiredError;
  }

  return isEmail(value) ? "" : invalidMessage;
};

export const getPhoneNumberError = (
  value: string | null | undefined,
  invalidMessage: string
): string => {
  if (!value || value.trim() === "") {
    return "";
  }

  return isPhoneNumber(value) ? "" : invalidMessage;
};

export const getStudentCodeError = (
  value: string | null | undefined,
  requiredMessage: string,
  invalidMessage: string
): string => {
  const requiredError = getRequiredError(value, requiredMessage);
  if (requiredError) {
    return requiredError;
  }

  return isStudentCode(value) ? "" : invalidMessage;
};

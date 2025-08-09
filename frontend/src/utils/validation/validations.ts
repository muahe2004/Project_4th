export const isRequired = (value: string | null | undefined): boolean => {
    return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const isEmail = (value: string | null | undefined): boolean => {
  if (!value) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(value);
};
import axios from "axios";
import type { TFunction } from "i18next";

export const getTuitionErrorMessage = (
  error: unknown,
  t: TFunction,
  fallbackKey: string
): string => {
  const detail = axios.isAxiosError(error) ? error.response?.data?.detail : undefined;
  if (typeof detail === "string" && detail.trim()) {
    return t(detail, { defaultValue: t(fallbackKey) });
  }

  return t(fallbackKey);
};

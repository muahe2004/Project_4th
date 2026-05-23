import i18n from "../../../locale/i18n";
import { capitalizeFirstLetter } from "./textFormat";

export type ChatLanguage = "vi" | "en";

interface ChatResponseParams {
  intent?: string | null;
  timeScope?: string | null;
  language?: ChatLanguage;
  mode?: "default" | "no_data";
}

interface ChatResponseResult {
  key: string;
  message: string;
}

const NO_TIME_SCOPE_INTENTS = new Set([
  "department_info",
  "major_info",
  "specialization_info",
  "training_program_info",
  "subject_info",
  "class_info",
  "teacher_info",
  "student_info",
  "room_info",
  "tuition_fee_info",
  "score_lookup",
]);

function normalizeIntent(intent?: string | null): string {
  return String(intent ?? "").trim().toLowerCase();
}

function normalizeTimeScope(timeScope?: string | null): string {
  return String(timeScope ?? "").trim().toLowerCase();
}

export function chatResponse({ intent, timeScope, language = "vi", mode = "default" }: ChatResponseParams): ChatResponseResult {
  const normalizedIntent = normalizeIntent(intent);
  const normalizedTimeScope = normalizeTimeScope(timeScope);
  const safeLanguage = language === "en" ? "en" : "vi";
  const keyBase = `chatbot.response.${normalizedIntent || "fallback"}`;
  const shouldIgnoreTimeScope = NO_TIME_SCOPE_INTENTS.has(normalizedIntent);

  if (shouldIgnoreTimeScope || !normalizedTimeScope) {
    const suffix = mode === "no_data" ? "no_data_no_time_scope" : "no_time_scope";
    const key = `${keyBase}.${suffix}`;
    return {
      key,
      message: capitalizeFirstLetter(
        i18n.t(key, {
          lng: safeLanguage,
          defaultValue: i18n.t(
            mode === "no_data"
              ? "chatbot.response.fallback.no_data_no_time_scope"
              : "chatbot.response.fallback.no_time_scope",
            {
              lng: safeLanguage,
            }
          ),
        })
      ),
    };
  }

  const timeScopeLabelKey = `chatbot.timeScope.${normalizedTimeScope}`;
  const timeScopeLabel = i18n.t(timeScopeLabelKey, {
    lng: safeLanguage,
    defaultValue: normalizedTimeScope,
  });
  const suffix = mode === "no_data" ? "no_data_with_time_scope" : "with_time_scope";
  const key = `${keyBase}.${suffix}`;
  return {
    key,
    message: capitalizeFirstLetter(
      i18n.t(key, {
        lng: safeLanguage,
        timeScope: timeScopeLabel,
        defaultValue: i18n.t(
          mode === "no_data"
            ? "chatbot.response.fallback.no_data_with_time_scope"
            : "chatbot.response.fallback.with_time_scope",
          {
            lng: safeLanguage,
            timeScope: timeScopeLabel,
          }
        ),
      })
    ),
  };
}

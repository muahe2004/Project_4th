import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { PredictIntentResponse } from "../apis/predictIntent";
import { capitalizeFirstLetter } from "../utils/textFormat";
import "./styles/ChatHistory.css";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
  meta?: PredictIntentResponse;
}

interface ChatHistoryProps {
  history: ChatMessage[];
  renderServiceData: (meta?: PredictIntentResponse) => ReactNode;
  renderTimePicker?: (meta: PredictIntentResponse, index: number) => ReactNode;
}

export default function ChatHistory({
  history,
  renderServiceData,
  renderTimePicker,
}: ChatHistoryProps) {
  const { t } = useTranslation();

  return (
    <>
      <Stack spacing={1.2} className="chat-history">
        {history.length === 0 ? (
          <Box className="chat-history__empty">
            <Typography variant="body2">{t("umsChatbot.emptyPrompt")}</Typography>
          </Box>
        ) : (
          history.map((message, index) => {
            const hasServiceData =
              Array.isArray(message.meta?.service_data) && message.meta.service_data.length > 0;
            const serviceDataNode =
              message.role === "assistant" && message.meta && hasServiceData
                ? renderServiceData(message.meta)
                : null;
            const timePickerNode =
              message.role === "assistant" && message.meta && renderTimePicker
                ? renderTimePicker(message.meta, index)
                : null;

            return (
              <Box
                key={`${message.role}-${index}-${message.content}`}
                className={`chat-history__message ${
                  message.role === "user" ? "chat-history__message--user" : "chat-history__message--assistant"
                }`}
              >
                <Box className={`chat-history__bubble ${message.role === "user" ? "chat-history__bubble--user" : "chat-history__bubble--assistant"}`}>
                  <Typography variant="body2" className="chat-history__text">
                    {message.role === "assistant" ? capitalizeFirstLetter(message.content) : message.content}
                  </Typography>
                </Box>
                {serviceDataNode ? (
                  <Box className="chat-history__meta">
                    {serviceDataNode}
                  </Box>
                ) : null}
                {timePickerNode}
              </Box>
            );
          })
        )}
      </Stack>

    </>
  );
}

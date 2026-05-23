import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
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
}

export default function ChatHistory({
  history,
  renderServiceData,
}: ChatHistoryProps) {
  return (
    <>
      <Stack spacing={1.2} className="chat-history">
        {history.length === 0 ? (
          <Box className="chat-history__empty">
            <Typography variant="body2">Nice! Ask me anything.</Typography>
          </Box>
        ) : (
          history.map((message, index) => (
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
              {message.role === "assistant" && message.meta ? (
                <Box className="chat-history__meta">
                  {renderServiceData(message.meta)}
                </Box>
              ) : null}
            </Box>
          ))
        )}
      </Stack>

    </>
  );
}

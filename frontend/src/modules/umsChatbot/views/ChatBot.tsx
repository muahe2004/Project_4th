import { useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import "./styles/ChatBot.css";
import { useAuthStore } from "../../../stores/useAuthStore";
import { usePredictIntent } from "../apis/predictIntent";
import type { PredictIntentResponse } from "../apis/predictIntent";

const CHATBOT_HISTORY_KEY = "ums_chatbot_history";

export default function ChatBot() {
  const user = useAuthStore((state) => state.user);
  const [text, setText] = useState("");
  const sendLockRef = useRef(false);
  const role = useMemo(() => {
    const normalizedRole = (user?.role ?? "").trim().toLowerCase();
    if (normalizedRole === "teacher" || normalizedRole === "student") {
      return normalizedRole;
    }
    return "";
  }, [user?.role]);
  const [history, setHistory] = useState<Array<{ role: string; content: string; meta?: PredictIntentResponse }>>([]);

  const mutation = usePredictIntent();
  const response = mutation.data;

  useEffect(() => {
    const rawHistory = localStorage.getItem(CHATBOT_HISTORY_KEY);
    if (!rawHistory) {
      setHistory([]);
      return;
    }

    try {
      const parsed = JSON.parse(rawHistory);
      if (Array.isArray(parsed)) {
        setHistory(
          parsed.filter((item) => item && typeof item.role === "string" && typeof item.content === "string")
        );
        return;
      }
    } catch {
      // ignore invalid cache
    }

    setHistory([]);
  }, []);

  const handleSubmit = async () => {
    if (sendLockRef.current || mutation.isPending) {
      return;
    }

    const question = text.trim();
    if (!question) {
      return;
    }

    sendLockRef.current = true;
    const nextHistory = [...history, { role: "user", content: question }];

    try {
      const result = await mutation.mutateAsync({
        payload: {
          message: question,
        },
      });

      const resolvedTimeScope = result.time_scope ?? "today";
      const assistantSummary = `intent: ${result.intent}, time_scope: ${resolvedTimeScope}`;
      const updatedHistory = [
        ...nextHistory,
        { role: "assistant", content: assistantSummary, meta: result },
      ];
      localStorage.setItem(CHATBOT_HISTORY_KEY, JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
      setText("");
    } finally {
      sendLockRef.current = false;
    }
  };

  return (
    <Container maxWidth="md" className="chatbot-test__container">
      <Paper className="chatbot-test__paper">
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>
            UMS Chatbot Test
          </Typography>

          <TextField
            label="Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />

          <Box className="chatbot-test__action-row">
            <Box component="span" className="chatbot-test__role">
              Role: {role || "unknown"}
            </Box>
            <Box
              component="button"
              type="button"
              onClick={handleSubmit}
              disabled={mutation.isPending || !text.trim() || !role}
              className="chatbot-test__submit"
            >
              Predict intent
            </Box>
          </Box>

          <Box className="chatbot-test__response">
            {response ? (
              <Stack spacing={1}>
                <Typography fontWeight={700}>
                  Intent: {response.intent}
                </Typography>
                <Typography>
                  Time scope: {response.time_scope ?? "today"}
                </Typography>
                <Typography>
                  Confidence: {response.confidence.toFixed(4)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Normalized: {response.normalized_text}
                </Typography>
                <Divider />
                <Typography component="pre" className="chatbot-test__json">
                  {JSON.stringify(response, null, 2)}
                </Typography>
              </Stack>
            ) : (
              "Chưa có response"
            )}
          </Box>

          {mutation.error ? (
            <Typography color="error">
              {(mutation.error as any)?.response?.data?.detail ?? "Request failed"}
            </Typography>
          ) : null}

          <Typography variant="body2" color="text.secondary">
            Current login: {user?.role ?? "unknown"} - {user?.id ?? "no user"}
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}

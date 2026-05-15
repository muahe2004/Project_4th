import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuthStore } from "../../../stores/useAuthStore";
import { usePredictIntent } from "../apis/predictIntent";

const CHATBOT_HISTORY_KEY = "ums_chatbot_history";

export default function ChatBot() {
  const user = useAuthStore((state) => state.user);
  const [text, setText] = useState("");
  const role = useMemo(() => {
    const normalizedRole = (user?.role ?? "").trim().toLowerCase();
    if (normalizedRole === "teacher" || normalizedRole === "student") {
      return normalizedRole;
    }
    return "";
  }, [user?.role]);
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([]);

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
    const question = text.trim();
    if (!question || !user?.id || !role) {
      return;
    }

    const nextHistory = [...history, { role: "user", content: question }];

    const result = await mutation.mutateAsync({
      payload: {
        text: question,
        role,
        user_id: user?.id,
        history: nextHistory,
      },
    });

    const assistantSummary = `intent: ${result.intent}${result.time_scope ? `, time_scope: ${result.time_scope}` : ""}`;
    const updatedHistory = [
      ...nextHistory,
      { role: "assistant", content: assistantSummary },
    ];
    localStorage.setItem(CHATBOT_HISTORY_KEY, JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
    setText("");
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
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

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Box component="span" sx={{ color: "text.secondary", fontSize: 14 }}>
              Role: {role || "unknown"}
            </Box>
            <Box
              component="button"
              type="button"
              onClick={handleSubmit}
              disabled={mutation.isPending || !text.trim() || !role}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                background: "#111827",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Predict intent
            </Box>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "#f7f7f7",
              minHeight: 120,
              whiteSpace: "pre-wrap",
            }}
          >
            {response ? (
              <Stack spacing={1}>
                <Typography fontWeight={700}>
                  Intent: {response.intent}
                </Typography>
                <Typography>
                  Time scope: {response.time_scope ?? "null"}
                </Typography>
                <Typography>
                  Confidence: {response.confidence.toFixed(4)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Normalized: {response.normalized_text}
                </Typography>
                <Divider />
                <Typography
                  component="pre"
                  sx={{ m: 0, fontSize: 12, overflowX: "auto" }}
                >
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

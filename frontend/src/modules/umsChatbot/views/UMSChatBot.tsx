import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import { useAuthStore } from "../../../stores/useAuthStore";
import { usePredictIntent } from "../apis/predictIntent";

const CHATBOT_HISTORY_KEY = "ums_chatbot_history";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

type ServiceData = Record<string, unknown>;

interface UMSChatBotProps {
  open: boolean;
  onClose: () => void;
}

export default function UMSChatBot({ open, onClose }: UMSChatBotProps) {
  const user = useAuthStore((state) => state.user);
  const [text, setText] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const mutation = usePredictIntent();
  const response = mutation.data;

  const role = useMemo(() => {
    const normalized = (user?.role ?? "").trim().toLowerCase();
    return normalized === "student" || normalized === "teacher" ? normalized : "";
  }, [user?.role]);

  const serviceData = useMemo(() => {
    if (!response?.service_data || !Array.isArray(response.service_data)) {
      return [];
    }
    return response.service_data as ServiceData[];
  }, [response?.service_data]);

  const renderDateRange = (value?: { start_date: string | null; end_date: string | null } | null) => {
    if (!value?.start_date && !value?.end_date) {
      return "unknown";
    }
    return `${value.start_date ?? "?"} → ${value.end_date ?? "?"}`;
  };

  const renderServiceData = () => {
    if (!response?.service_name || !serviceData.length) {
      return null;
    }

    if (response.service_name === "ScoresServices") {
      const payload = serviceData[0] as {
        student_info?: { student_code?: string; name?: string };
        scores?: { items?: Array<Record<string, unknown>>; total?: number };
      };

      return (
        <Stack spacing={1}>
          <Typography variant="subtitle2" fontWeight={700}>
            {payload.student_info?.name ?? "Student"} - {payload.student_info?.student_code ?? ""}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total records: {payload.scores?.total ?? 0}
          </Typography>
          <Stack spacing={0.75}>
            {(payload.scores?.items ?? []).slice(0, 4).map((item, index) => (
              <Box
                key={`${String(item.id ?? index)}-${index}`}
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: "#fff",
                  border: "1px solid #ece7f8",
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {String(item.subject_name ?? "Subject")}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {String(item.academic_year ?? "")}
                  {item.semester ? ` · HK ${String(item.semester)}` : ""}
                </Typography>
                <Typography variant="body2">
                  Score: {String(item.score ?? "-")} · Type: {String(item.score_type ?? "-")}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      );
    }

    if (response.service_name === "TeachingScheduleServices") {
      const items = serviceData as Array<Record<string, unknown>>;
      return (
        <Stack spacing={1}>
          <Typography variant="subtitle2" fontWeight={700}>
            {items.length} schedule record(s)
          </Typography>
          <Stack spacing={0.75}>
            {items.slice(0, 4).map((item, index) => {
              const learningSchedule = (item.learning_schedule as Record<string, unknown>) ?? {};
              const subject = (item.subject as Record<string, unknown>) ?? {};
              const room = (item.room as Record<string, unknown>) ?? {};
              const classInfo = (item.class as Record<string, unknown>) ?? {};
              return (
                <Box
                  key={`${String(item.id ?? index)}-${index}`}
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: "#fff",
                    border: "1px solid #ece7f8",
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {String(subject.subject_name ?? "Schedule")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {String(learningSchedule.date ?? "")}
                  </Typography>
                  <Typography variant="body2">
                    Period: {String(learningSchedule.start_period ?? "-")} - {String(learningSchedule.end_period ?? "-")}
                  </Typography>
                  <Typography variant="body2">
                    Room: {String(room.room_number ?? "-")} · Class: {String(classInfo.class_name ?? "-")}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Stack>
      );
    }

    if (response.service_name === "ExaminationScheduleServices") {
      const items = serviceData as Array<Record<string, unknown>>;
      return (
        <Stack spacing={1}>
          <Typography variant="subtitle2" fontWeight={700}>
            {items.length} exam record(s)
          </Typography>
          <Stack spacing={0.75}>
            {items.slice(0, 4).map((item, index) => (
              <Box
                key={`${String(item.id ?? index)}-${index}`}
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: "#fff",
                  border: "1px solid #ece7f8",
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {String(item.subject_info && typeof item.subject_info === "object" ? (item.subject_info as Record<string, unknown>).subject_name ?? "Exam" : "Exam")}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {String(item.date ?? "")}
                </Typography>
                <Typography variant="body2">
                  Time: {String(item.start_time ?? "-")} - {String(item.end_time ?? "-")}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      );
    }

    return (
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 1.25,
          borderRadius: 1.5,
          bgcolor: "#fff",
          border: "1px solid #ece7f8",
          fontSize: 12,
          overflowX: "auto",
          whiteSpace: "pre-wrap",
        }}
      >
        {JSON.stringify(serviceData, null, 2)}
      </Box>
    );
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const raw = localStorage.getItem(CHATBOT_HISTORY_KEY);
    if (!raw) {
      setHistory([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setHistory(
          parsed.filter(
            (item): item is ChatMessage =>
              item &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string"
          )
        );
        return;
      }
    } catch {
      // ignore invalid cache
    }

    setHistory([]);
  }, [open]);

  useEffect(() => {
    if (!viewportRef.current) {
      return;
    }
    viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
  }, [history, response, open]);

  const persistHistory = (nextHistory: ChatMessage[]) => {
    setHistory(nextHistory);
    localStorage.setItem(CHATBOT_HISTORY_KEY, JSON.stringify(nextHistory));
  };

  const handleSend = async () => {
    const question = text.trim();
    if (!question || !role || !user?.id) {
      return;
    }

    const nextHistory: ChatMessage[] = [...history, { role: "user", content: question }];
    persistHistory(nextHistory);
    setText("");

    try {
      const result = await mutation.mutateAsync({
        payload: {
          text: question,
          role,
          user_id: user.id,
          history: nextHistory,
        },
      });

      persistHistory([
        ...nextHistory,
        {
          role: "assistant",
          content: `${result.intent}${result.time_scope ? ` · ${result.time_scope}` : ""}`,
        },
      ]);
    } catch {
      persistHistory(nextHistory);
    }
  };

  const quickActions = [
    "Cho em xem lịch học hôm nay",
    "Cho em xem lịch thi tuần này",
    "Xem kết quả học tập",
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
          maxHeight: "82vh",
        },
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          background: "linear-gradient(135deg, #b564d9 0%, #9b59ca 100%)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.18)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <SmartToyOutlinedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography fontWeight={700} lineHeight={1.1}>
              UMS ChatBot
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Online Now
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconButton size="small" sx={{ color: "#fff" }}>
            <MoreHorizIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: "#fff" }} onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent
        dividers
        ref={viewportRef}
        sx={{
          p: 2,
          bgcolor: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          {user?.role ?? "unknown"}
        </Typography>

        <Stack spacing={1.2}>
          {history.length === 0 ? (
            <Box
              sx={{
                alignSelf: "flex-start",
                bgcolor: "#f4f0ff",
                color: "#352b58",
                px: 1.5,
                py: 1,
                borderRadius: "18px 18px 18px 6px",
                maxWidth: "85%",
              }}
            >
              <Typography variant="body2">Nice! Ask me anything.</Typography>
            </Box>
          ) : (
            history.map((message, index) => (
              <Box
                key={`${message.role}-${index}-${message.content}`}
                sx={{
                  alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                  bgcolor: message.role === "user" ? "#b46adf" : "#f3f3f5",
                  color: message.role === "user" ? "#fff" : "#1f1f1f",
                  px: 1.5,
                  py: 1.05,
                  borderRadius:
                    message.role === "user"
                      ? "18px 18px 6px 18px"
                      : "18px 18px 18px 6px",
                  maxWidth: "85%",
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {message.content}
                </Typography>
              </Box>
            ))
          )}
        </Stack>

        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ pt: 0.5 }}>
          {quickActions.map((item) => (
            <Button
              key={item}
              variant="outlined"
              size="small"
              onClick={() => setText(item)}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                borderColor: "#b46adf",
                color: "#9b59ca",
                "&:hover": {
                  borderColor: "#9b59ca",
                  bgcolor: "rgba(155, 89, 202, 0.08)",
                },
              }}
            >
              {item}
            </Button>
          ))}
        </Stack>

        {response ? (
          <Box
            sx={{
              mt: 0.5,
              p: 1.5,
              borderRadius: 2,
              bgcolor: "#faf7ff",
              border: "1px solid #eadcf6",
            }}
          >
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                AI: {response.intent}
                {response.time_scope ? ` · ${response.time_scope}` : ""}
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                Service: {response.service_name ?? "unknown"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Date range: {renderDateRange(response.date_range)}
              </Typography>
              {renderServiceData()}
            </Stack>
          </Box>
        ) : null}
      </DialogContent>

      <Box
        sx={{
          p: 1.5,
          borderTop: "1px solid #eee",
          display: "flex",
          gap: 1,
          alignItems: "center",
          bgcolor: "#fff",
        }}
      >
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Reply to UMS ChatBot..."
          fullWidth
          size="small"
          multiline
          maxRows={4}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 999,
              bgcolor: "#fafafa",
            },
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
        />
        <IconButton
          onClick={() => void handleSend()}
          disabled={mutation.isPending || !text.trim() || !role}
          sx={{
            bgcolor: "#b46adf",
            color: "#fff",
            "&:hover": { bgcolor: "#9b59ca" },
            "&.Mui-disabled": { bgcolor: "#e7d7f3", color: "#fff" },
          }}
        >
          <SendRoundedIcon />
        </IconButton>
      </Box>
    </Dialog>
  );
}

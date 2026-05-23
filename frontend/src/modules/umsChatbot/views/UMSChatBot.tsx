import { useEffect, useMemo, useRef, useState } from "react";
import ChatHistory from "../components/ChatHistory";
import ChatInput from "../components/ChatInput";
import ChatResponData from "../components/ChatResponData";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  List,
  ListItemButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import logo from "../../../assets/images/logoUTEHY.png";
import "./styles/UMSChatBot.css";

import { useAuthStore } from "../../../stores/useAuthStore";
import { usePredictIntent } from "../apis/predictIntent";
import type { PredictIntentResponse } from "../apis/predictIntent";
import { chatResponse } from "../utils/chatResponse";
import { capitalizeFirstLetter } from "../utils/textFormat";

const CHATBOT_HISTORY_KEY = "ums_chatbot_history";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
  meta?: PredictIntentResponse;
}

interface ChatConversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}

interface UMSChatBotProps {
  open: boolean;
  onClose: () => void;
}

function resolveIntentForResponse(meta: PredictIntentResponse): string {
  const normalizedIntent = String(meta.intent ?? "").trim().toLowerCase();
  const supportedIntents = new Set([
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
    "learning_schedule",
    "examination_schedule",
  ]);

  if (supportedIntents.has(normalizedIntent)) {
    return normalizedIntent;
  }

  if (meta.service_name === "ScoresServices") {
    return "score_lookup";
  }
  if (meta.service_name === "TeachingScheduleServices") {
    return "learning_schedule";
  }
  if (meta.service_name === "ExaminationScheduleServices") {
    return "examination_schedule";
  }
  return "";
}

export default function UMSChatBot({ open, onClose }: UMSChatBotProps) {
  const user = useAuthStore((state) => state.user);
  const [text, setText] = useState("");
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const mutation = usePredictIntent();
  const response = mutation.data;
  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );
  const history = activeConversation?.messages ?? [];
  const upsertConversation = (conversationId: string, nextMessages: ChatMessage[]) => {
    const nowIso = new Date().toISOString();
    const firstUserTextRaw = nextMessages.find((item) => item.role === "user")?.content?.trim() || "New chat";
    const firstUserText = capitalizeFirstLetter(firstUserTextRaw);
    setConversations((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === conversationId);
      const nextConversation: ChatConversation = {
        id: conversationId,
        title: firstUserText.slice(0, 60),
        updatedAt: nowIso,
        messages: nextMessages,
      };
      let next = prev;
      if (existingIndex >= 0) {
        next = [...prev];
        next[existingIndex] = nextConversation;
      } else {
        next = [nextConversation, ...prev];
      }
      next = [...next].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      localStorage.setItem(CHATBOT_HISTORY_KEY, JSON.stringify(next));
      return next;
    });
    setActiveConversationId(conversationId);
  };

  const role = useMemo(() => {
    const normalized = (user?.role ?? "").trim().toLowerCase();
    return normalized === "student" || normalized === "teacher" ? normalized : "";
  }, [user?.role]);

  const renderServiceData = (meta?: PredictIntentResponse) => {
    return <ChatResponData meta={meta} />;
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const raw = localStorage.getItem(CHATBOT_HISTORY_KEY);
    if (!raw) {
      setConversations([]);
      setActiveConversationId("");
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const isLegacyMessages = parsed.every(
          (item) =>
            item &&
            (item.role === "user" || item.role === "assistant") &&
            typeof item.content === "string"
        );

        if (isLegacyMessages) {
          const migrated: ChatConversation[] = [
            {
              id: `conv-${Date.now()}`,
              title:
                capitalizeFirstLetter(parsed.find((item) => item.role === "user")?.content?.slice(0, 60) || "New chat"),
              updatedAt: new Date().toISOString(),
              messages: parsed as ChatMessage[],
            },
          ];
          setConversations(migrated);
          setActiveConversationId(migrated[0].id);
          localStorage.setItem(CHATBOT_HISTORY_KEY, JSON.stringify(migrated));
          return;
        }

        const normalized = parsed
          .filter(
            (item) =>
              item &&
              typeof item.id === "string" &&
              Array.isArray(item.messages)
          )
          .map((item) => ({
            id: String(item.id),
            title: capitalizeFirstLetter(String(item.title || "New chat")),
            updatedAt: String(item.updatedAt || new Date().toISOString()),
            messages: item.messages.filter(
              (msg: ChatMessage) =>
                msg &&
                (msg.role === "user" || msg.role === "assistant") &&
                typeof msg.content === "string"
            ),
          }));
        setConversations(normalized);
        setActiveConversationId(normalized[0]?.id ?? "");
        return;
      }
    } catch {
      // ignore invalid cache
    }

    setConversations([]);
    setActiveConversationId("");
  }, [open]);

  useEffect(() => {
    if (!viewportRef.current) {
      return;
    }
    viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
  }, [history, response, open]);

  const handleSend = async () => {
    const question = text.trim();
    if (!question) {
      return;
    }

    const currentConversationId = activeConversationId || `conv-${Date.now()}`;
    const nextHistory: ChatMessage[] = [...history, { role: "user", content: question }];
    upsertConversation(currentConversationId, nextHistory);
    setText("");

    try {
      const result = await mutation.mutateAsync({
        payload: {
          message: question,
        },
      });
      const resolvedTimeScope = result.time_scope ?? "today";
      const resolvedIntent = resolveIntentForResponse(result);
      const assistantResponse = chatResponse({
        intent: resolvedIntent,
        timeScope: resolvedTimeScope,
        language: "vi",
        mode:
          Array.isArray(result.service_data) && result.service_data.length > 0
            ? "default"
            : "no_data",
      });
      const hasServiceData = Array.isArray(result.service_data) && result.service_data.length > 0;

      upsertConversation(currentConversationId, [
        ...nextHistory,
        {
          role: "assistant",
          content: assistantResponse.message,
          meta: hasServiceData ? result : undefined,
        },
      ]);
    } catch {
      upsertConversation(currentConversationId, nextHistory);
    }
  };

  const quickActions = [
    "Cho tôi xem lịch học hôm nay",
    "Xem kết quả học tập",
  ];
  const startNewChat = () => {
    const conversationId = `conv-${Date.now()}`;
    const conversation: ChatConversation = {
      id: conversationId,
      title: "New chat",
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setConversations((prev) => {
      const next = [conversation, ...prev];
      localStorage.setItem(CHATBOT_HISTORY_KEY, JSON.stringify(next));
      return next;
    });
    setActiveConversationId(conversationId);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className: "ums-chatbot__paper",
      }}
    >
      <Box className="ums-chatbot__header">
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box className="ums-chatbot__logo-wrap">
            <Box component="img" src={logo} alt="UMS logo" className="ums-chatbot__logo" />
          </Box>
          <Box>
            <Typography fontWeight={700} lineHeight={1.1}>
              UMS ChatBot
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconButton size="small" className="ums-chatbot__close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent dividers className="ums-chatbot__content">
        <Box className="ums-chatbot__sidebar">
          <Button
            className="ums-chatbot__new-btn"
            variant="contained"
            onClick={startNewChat}
          >
            New chat
          </Button>
          <Typography variant="caption" className="ums-chatbot__recent-title">
            Recent chats
          </Typography>
          <List className="ums-chatbot__list">
            {conversations.length === 0 ? (
              <Typography variant="body2" className="ums-chatbot__empty-history">
                No history yet
              </Typography>
            ) : (
              conversations.map((conversation) => (
                <ListItemButton
                  key={conversation.id}
                  className={`ums-chatbot__item ${conversation.id === activeConversationId ? "ums-chatbot__item--active" : ""}`}
                  selected={conversation.id === activeConversationId}
                  onClick={() => setActiveConversationId(conversation.id)}
                >
                  <Typography variant="body2" className="ums-chatbot__item-text">
                    {conversation.title}
                  </Typography>
                </ListItemButton>
              ))
            )}
          </List>
        </Box>

        <Box className="ums-chatbot__main">
          <Box ref={viewportRef} className="ums-chatbot__viewport">
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              {user?.role ?? "unknown"}
            </Typography>

            <ChatHistory
              history={history}
              renderServiceData={renderServiceData}
            />

          </Box>
          <Stack direction="row" flexWrap="wrap" gap={1} className="ums-chatbot__quick-actions">
            {quickActions.map((item) => (
              <Button
                key={item}
                className="ums-chatbot__quick-action"
                variant="outlined"
                size="small"
                onClick={() => setText(item)}
              >
                {item}
              </Button>
            ))}
          </Stack>

          <ChatInput
            text={text}
            onChangeText={setText}
            onSend={() => void handleSend()}
            disabled={mutation.isPending || !text.trim() || !role}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}

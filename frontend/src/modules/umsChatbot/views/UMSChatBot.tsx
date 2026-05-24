import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ChatHistory from "../components/ChatHistory";
import ChatInput from "../components/ChatInput";
import ChatResponData from "../components/ChatResponData";
import TimePicker, { type ChatTimeScope } from "../components/TimePicker";
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

function isScheduleIntent(intent: string): boolean {
  return intent === "learning_schedule" || intent === "teaching_schedule" || intent === "examination_schedule";
}

function hasMeaningfulServiceData(intent: string, serviceData: unknown): boolean {
  if (!Array.isArray(serviceData) || serviceData.length === 0) {
    return false;
  }
  if (intent === "score_lookup") {
    const first = serviceData[0] as { scores?: { items?: unknown[]; total?: number } } | undefined;
    const total = Number(first?.scores?.total ?? 0);
    const itemsCount = Array.isArray(first?.scores?.items) ? first!.scores!.items!.length : 0;
    return total > 0 || itemsCount > 0;
  }
  return true;
}

function buildScopedPrompt(intent: string, timeScope: ChatTimeScope): string {
  if (intent === "learning_schedule") {
    if (timeScope === "tomorrow") return "Cho tôi xem lịch học ngày mai";
    if (timeScope === "this_week") return "Cho tôi xem lịch học tuần này";
    if (timeScope === "next_week") return "Cho tôi xem lịch học tuần sau";
    return "Cho tôi xem lịch học tháng này";
  }
  if (intent === "teaching_schedule") {
    if (timeScope === "tomorrow") return "Cho tôi xem lịch dạy ngày mai";
    if (timeScope === "this_week") return "Cho tôi xem lịch dạy tuần này";
    if (timeScope === "next_week") return "Cho tôi xem lịch dạy tuần sau";
    return "Cho tôi xem lịch dạy tháng này";
  }
  if (intent === "examination_schedule") {
    if (timeScope === "tomorrow") return "Cho tôi xem lịch thi ngày mai";
    if (timeScope === "this_week") return "Cho tôi xem lịch thi tuần này";
    if (timeScope === "next_week") return "Cho tôi xem lịch thi tuần sau";
    return "Cho tôi xem lịch thi tháng này";
  }
  if (timeScope === "tomorrow") return "Cho tôi xem thông tin ngày mai";
  if (timeScope === "this_week") return "Cho tôi xem thông tin tuần này";
  if (timeScope === "next_week") return "Cho tôi xem thông tin tuần sau";
  return "Cho tôi xem thông tin tháng này";
}

function resolveScopeDate(scope: ChatTimeScope): string {
  const current = new Date();
  if (scope === "tomorrow") {
    current.setDate(current.getDate() + 1);
  }
  if (scope === "this_week") {
    const day = current.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    current.setDate(current.getDate() + diffToMonday);
  }
  if (scope === "next_week") {
    const day = current.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    current.setDate(current.getDate() + diffToMonday + 7);
  }
  if (scope === "this_month") {
    current.setDate(1);
  }
  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, "0");
  const day = String(current.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function resolveIntentForResponse(meta: PredictIntentResponse): string {
  const normalizedIntent = String(meta.intent ?? "").trim().toLowerCase();
  if (normalizedIntent === "out_of_scope" || normalizedIntent === "unknown") {
    return "unknown";
  }
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
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [text, setText] = useState("");
  const [selectedTimeScope, setSelectedTimeScope] = useState<ChatTimeScope | null>(null);
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
    const firstUserTextRaw =
      nextMessages.find((item) => item.role === "user")?.content?.trim() || t("umsChatbot.newChat");
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
  const renderTimePicker = (meta: PredictIntentResponse, messageIndex: number) => {
    const intent = String(meta?.intent ?? "").trim().toLowerCase();
    const shouldShow = isScheduleIntent(intent);
    if (!shouldShow) {
      return null;
    }
    return (
      <TimePicker
        value={selectedTimeScope}
        onChange={(nextTimeScope) => {
          setSelectedTimeScope(nextTimeScope);
          if (mutation.isPending) {
            return;
          }
          const scopeDate = resolveScopeDate(nextTimeScope);
          console.log("[UMSChatBot][TimePicker]", {
            selectedTimeScope: nextTimeScope,
            scopeDate,
            intent,
          });
          const scopedPrompt = buildScopedPrompt(intent, nextTimeScope);
          const currentConversationId = activeConversationId || `conv-${Date.now()}`;
          void (async () => {
            try {
              const result = await mutation.mutateAsync({
                payload: {
                  message: scopedPrompt,
                  intent,
                  time_scope: nextTimeScope,
                },
              });
              const resolvedTimeScope = result.time_scope ?? "today";
              const resolvedIntent = resolveIntentForResponse(result);
              const assistantResponse = chatResponse({
                intent: resolvedIntent,
                timeScope: resolvedTimeScope,
                language: i18n.language === "en" ? "en" : "vi",
                mode:
                  hasMeaningfulServiceData(resolvedIntent, result.service_data) ? "default" : "no_data",
              });
              const hasServiceData = hasMeaningfulServiceData(resolvedIntent, result.service_data);
              const shouldRenderServiceData = resolvedIntent !== "unknown" && hasServiceData;
              const shouldKeepMeta = shouldRenderServiceData || isScheduleIntent(resolvedIntent);
              upsertConversation(currentConversationId, [
                ...history,
                {
                  role: "assistant",
                  content: assistantResponse.message,
                  meta: shouldKeepMeta ? result : undefined,
                },
              ]);
            } catch {
              // keep current conversation if refresh fails
            }
          })();
        }}
        disabled={mutation.isPending}
      />
    );
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
                capitalizeFirstLetter(
                  parsed.find((item) => item.role === "user")?.content?.slice(0, 60) || t("umsChatbot.newChat")
                ),
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
            title: capitalizeFirstLetter(String(item.title || t("umsChatbot.newChat"))),
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
          ...(selectedTimeScope ? { time_scope: selectedTimeScope } : {}),
        },
      });
      const resolvedTimeScope = result.time_scope ?? "today";
      const resolvedIntent = resolveIntentForResponse(result);
      const assistantResponse = chatResponse({
        intent: resolvedIntent,
        timeScope: resolvedTimeScope,
        language: i18n.language === "en" ? "en" : "vi",
        mode:
          hasMeaningfulServiceData(resolvedIntent, result.service_data) ? "default" : "no_data",
      });
      const hasServiceData = hasMeaningfulServiceData(resolvedIntent, result.service_data);
      const shouldRenderServiceData = resolvedIntent !== "unknown" && hasServiceData;
      const shouldKeepMeta = shouldRenderServiceData || isScheduleIntent(resolvedIntent);

      upsertConversation(currentConversationId, [
        ...nextHistory,
        {
          role: "assistant",
          content: assistantResponse.message,
          meta: shouldKeepMeta ? result : undefined,
        },
      ]);
    } catch {
      upsertConversation(currentConversationId, nextHistory);
    }
  };

  const quickActions = [
    t("umsChatbot.quickActions.todaySchedule"),
    t("umsChatbot.quickActions.studyResults"),
  ];
  const startNewChat = () => {
    const conversationId = `conv-${Date.now()}`;
    const conversation: ChatConversation = {
      id: conversationId,
      title: t("umsChatbot.newChat"),
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
            <Box component="img" src={logo} alt={t("umsChatbot.logoAlt")} className="ums-chatbot__logo" />
          </Box>
          <Box>
            <Typography fontWeight={700} lineHeight={1.1}>
              {t("umsChatbot.title")}
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
            {t("umsChatbot.newChat")}
          </Button>
          <Typography variant="caption" className="ums-chatbot__recent-title">
            {t("umsChatbot.recentChats")}
          </Typography>
          <List className="ums-chatbot__list">
            {conversations.length === 0 ? (
              <Typography variant="body2" className="ums-chatbot__empty-history">
                {t("umsChatbot.noHistory")}
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
            <ChatHistory
              history={history}
              renderServiceData={renderServiceData}
              renderTimePicker={renderTimePicker}
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

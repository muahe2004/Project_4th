import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Box, IconButton, TextField } from "@mui/material";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./styles/ChatInput.css";

interface ChatInputProps {
  text: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export default function ChatInput({ text, onChangeText, onSend, disabled }: ChatInputProps) {
  const { t } = useTranslation();
  const submitLockRef = useRef(false);

  useEffect(() => {
    if (text === "") {
      submitLockRef.current = false;
    }
  }, [text]);

  return (
    <Box className="chat-input">
      <TextField
        className="chat-input__field"
        value={text}
        onChange={(e) => {
          const normalizedValue = e.target.value.replace(/[\r\n]+/g, " ");
          if (submitLockRef.current) {
            if (normalizedValue === "") {
              onChangeText("");
            }
            return;
          }
          onChangeText(normalizedValue);
        }}
        placeholder={t("umsChatbot.askPlaceholder")}
        fullWidth
        size="small"
        multiline
        maxRows={4}
        onKeyDownCapture={(event) => {
          if (disabled) {
            return;
          }
          if (event.key === "Enter" && !event.shiftKey && !event.repeat && !event.nativeEvent.isComposing) {
            event.preventDefault();
            event.stopPropagation();
            submitLockRef.current = true;
            onChangeText("");
            onSend();
          }
        }}
      />
      <IconButton
        className="chat-input__send"
        onClick={onSend}
        disabled={disabled}
      >
        <SendRoundedIcon />
      </IconButton>
    </Box>
  );
}

import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Box, IconButton, TextField } from "@mui/material";
import "./styles/ChatInput.css";

interface ChatInputProps {
  text: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export default function ChatInput({ text, onChangeText, onSend, disabled }: ChatInputProps) {
  return (
    <Box className="chat-input">
      <TextField
        className="chat-input__field"
        value={text}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder="Reply to UMS ChatBot..."
        fullWidth
        size="small"
        multiline
        maxRows={4}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
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

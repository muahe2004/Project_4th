import { Alert, Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

type ImportFeedbackMessage = {
  severity: "error" | "warning" | "info";
  content: ReactNode;
};

interface ImportFeedbackProps {
  messages: ImportFeedbackMessage[];
}

function ImportFeedback({ messages }: ImportFeedbackProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: "grid", gap: 1.5 }}>
      {messages.map((message, index) => (
        <Alert key={`${message.severity}-${index}`} severity={message.severity}>
          <Typography sx={{ fontWeight: 400, fontSize: "0.95rem" }}>{message.content}</Typography>
        </Alert>
      ))}
    </Box>
  );
}

export default ImportFeedback;

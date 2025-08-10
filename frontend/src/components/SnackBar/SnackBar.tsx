import { Snackbar, Alert } from "@mui/material";

interface CustomSnackbarProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity?: "success" | "error" | "warning" | "info";
}

export default function CustomSnackbar({
  open,
  onClose,
  message,
  severity = "success",
}: CustomSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{ width: "100%" }}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

// src/components/notification/SnackbarProvider.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";

import "./Snackbar.css";

type SnackbarSeverity = "success" | "error" | "warning" | "info";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

interface SnackbarContextProps {
  showSnackbar: (message: string, severity?: SnackbarSeverity) => void;
}

const SnackbarContext = createContext<SnackbarContextProps>({
  showSnackbar: () => {},
});

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = useCallback((message: string, severity: SnackbarSeverity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleClose}
        className="primary-snackbar"
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message} 
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

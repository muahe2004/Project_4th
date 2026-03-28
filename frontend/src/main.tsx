import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { createRouterConfig } from "./routes";
import "./index.css";
import './locale/i18n';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from "@mui/material";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { SnackbarProvider } from "./components/SnackBar/SnackBar";
import { useAuthStore } from "./stores/useAuthStore";

function AuthInitializer() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const authReady = useAuthStore((state) => state.authReady);

  React.useEffect(() => {
    if (!hasHydrated || authReady) {
      return;
    }

    void initializeAuth();
  }, [hasHydrated, authReady, initializeAuth]);

  return null;
}

const queryClient = new QueryClient();

const theme = createTheme({
  typography: {
    fontFamily: 'Montserrat, sans-serif',
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <AuthInitializer />
          <RouterProvider router={createRouterConfig()} />
        </SnackbarProvider>
      </ThemeProvider>
    </React.StrictMode>
  </QueryClientProvider>
);

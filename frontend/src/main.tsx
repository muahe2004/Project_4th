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
          <RouterProvider router={createRouterConfig()} />
        </SnackbarProvider>
      </ThemeProvider>
    </React.StrictMode>
  </QueryClientProvider>
);
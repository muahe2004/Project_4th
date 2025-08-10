import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { createRouterConfig } from "./routes";
import "./index.css";
import './locale/i18n';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
const queryClient = new QueryClient();


ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <RouterProvider router={createRouterConfig()} />
    </React.StrictMode>
  </QueryClientProvider>
);


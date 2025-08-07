import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { createRouterConfig } from "./routes";
import "./index.css";
import './locale/i18n';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={createRouterConfig()} />
  </React.StrictMode>
);

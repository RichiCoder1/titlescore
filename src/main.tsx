import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/inter";
import "./styles/globals.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { SshDemoPage } from "./pages/SshDemoPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SshDemoPage />
  </StrictMode>
);

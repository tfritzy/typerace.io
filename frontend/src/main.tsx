import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SpacetimeProvider } from "./contexts/SpacetimeContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SpacetimeProvider>
      <App />
    </SpacetimeProvider>
  </StrictMode>
);
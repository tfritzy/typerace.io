import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./firebase/AuthContext.tsx";
import { SpacetimeProvider } from "./contexts/SpacetimeContext.tsx";
import { getInitialTheme, applyTheme } from "./utils/themes.ts";

applyTheme(getInitialTheme());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <SpacetimeProvider>
        <App />
      </SpacetimeProvider>
    </AuthProvider>
  </StrictMode>
);
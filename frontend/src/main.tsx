import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./firebase/AuthContext.tsx";
import { DevAuthProvider } from "./firebase/DevAuthProvider.tsx";
import { SpacetimeProvider } from "./contexts/SpacetimeContext.tsx";
import { getInitialTheme, applyTheme, loadGoogleFont } from "./utils/themes.ts";

applyTheme(getInitialTheme());
loadGoogleFont('JetBrains Mono');

const useDevAuth = import.meta.env.VITE_DEV_AUTH === 'true';
const SelectedAuthProvider = useDevAuth ? DevAuthProvider : AuthProvider;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SelectedAuthProvider>
      <SpacetimeProvider>
        <App />
      </SpacetimeProvider>
    </SelectedAuthProvider>
  </StrictMode>
);
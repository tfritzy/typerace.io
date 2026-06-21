import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LobbyPage } from "./pages/LobbyPage";
import { GamePage } from "./pages/GamePage";
import { ProfilePage } from "./pages/ProfilePage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { SiteStatsPage } from "./pages/SiteStatsPage";
import { SpacetimeProvider } from "./contexts/SpacetimeContext";
import { ToastProvider } from "./hooks/useToast";
import { ToastContainer } from "./components/Toast";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <SpacetimeProvider>
          <Routes>
            <Route path="/" element={<LobbyPage />} />
            <Route path="/game/:gameId" element={<GamePage />} />
            <Route path="/profile/:playerId" element={<ProfilePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/stats" element={<SiteStatsPage />} />
            <Route path="/:lang" element={<LobbyPage />} />
            <Route path="/:lang/game/:gameId" element={<GamePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
        </SpacetimeProvider>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;

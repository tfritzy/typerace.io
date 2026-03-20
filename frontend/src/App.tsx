import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LobbyPage } from "./pages/LobbyPage";
import { GamePage } from "./pages/GamePage";
import { ProfilePage } from "./pages/ProfilePage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { SiteStatsPage } from "./pages/SiteStatsPage";
import { GamesPage } from "./games/GamesPage";
import { WordDefensePage } from "./games/word-defense/WordDefensePage";
import { ToastProvider } from "./hooks/useToast";
import { ToastContainer } from "./components/Toast";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LobbyPage />} />
          <Route path="/game/:gameId" element={<GamePage />} />
          <Route path="/profile/:playerId" element={<ProfilePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/stats" element={<SiteStatsPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/word-defense" element={<WordDefensePage />} />
          <Route path="/:lang" element={<LobbyPage />} />
          <Route path="/:lang/game/:gameId" element={<GamePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
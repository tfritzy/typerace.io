import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { LobbyPage } from "./pages/LobbyPage";
import { GamePage } from "./pages/GamePage";
import { ProfilePage } from "./pages/ProfilePage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { SiteStatsPage } from "./pages/SiteStatsPage";
import { GamesPage } from "./games/GamesPage";
import { CosmicDefensePage } from "./games/cosmic-defense/CosmicDefensePage";
import { ItemDesignerPage } from "./item-designer/ItemDesignerPage";
import { SpacetimeProvider } from "./contexts/SpacetimeContext";
import { ToastProvider } from "./hooks/useToast";
import { ToastContainer } from "./components/Toast";

function LanguageGamesFallback() {
  const { lang } = useParams();
  return <Navigate to={`/${lang}/games`} replace />;
}

function ConnectedRoutes() {
  return (
    <SpacetimeProvider>
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/profile/:playerId" element={<ProfilePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/stats" element={<SiteStatsPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/games/cosmic_defense" element={<CosmicDefensePage />} />
        <Route path="/games/:gameId" element={<Navigate to="/games" replace />} />
        <Route path="/:lang/games" element={<GamesPage />} />
        <Route path="/:lang/games/cosmic_defense" element={<CosmicDefensePage />} />
        <Route path="/:lang/games/:gameId" element={<LanguageGamesFallback />} />
        <Route path="/:lang" element={<LobbyPage />} />
        <Route path="/:lang/game/:gameId" element={<GamePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SpacetimeProvider>
  );
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/item-designer" element={<ItemDesignerPage />} />
          <Route path="*" element={<ConnectedRoutes />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;

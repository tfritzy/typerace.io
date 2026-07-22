import { lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LobbyPage } from "./pages/LobbyPage";
import { FindGamePage } from "./pages/FindGamePage";
import { SpacetimeProvider } from "./contexts/SpacetimeContext";
import { AppLayout } from "./components/AppLayout";
import { DatabaseRequired } from "./components/DatabaseRequired";

const GamePage = lazy(() =>
  import("./pages/GamePage").then(({ GamePage }) => ({ default: GamePage })),
);
const ProfilePage = lazy(() =>
  import("./pages/ProfilePage").then(({ ProfilePage }) => ({
    default: ProfilePage,
  })),
);
const PrivacyPolicyPage = lazy(() =>
  import("./pages/PrivacyPolicyPage").then(({ PrivacyPolicyPage }) => ({
    default: PrivacyPolicyPage,
  })),
);
const SiteStatsPage = lazy(() =>
  import("./pages/SiteStatsPage").then(({ SiteStatsPage }) => ({
    default: SiteStatsPage,
  })),
);
function App() {
  return (
    <BrowserRouter>
      <SpacetimeProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<LobbyPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/:lang" element={<LobbyPage />} />
            <Route element={<DatabaseRequired />}>
              <Route path="/game" element={<FindGamePage />} />
              <Route path="/game/:gameId" element={<GamePage />} />
              <Route path="/profile/:playerId" element={<ProfilePage />} />
              <Route path="/stats" element={<SiteStatsPage />} />
              <Route path="/:lang/game" element={<FindGamePage />} />
              <Route path="/:lang/game/:gameId" element={<GamePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </SpacetimeProvider>
    </BrowserRouter>
  );
}

export default App;

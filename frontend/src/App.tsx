import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LobbyPage } from "./pages/LobbyPage";
import { GamePage } from "./pages/GamePage";
import { ProfilePage } from "./pages/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/profile/:playerId" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
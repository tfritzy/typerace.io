import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { SpacetimeDBProvider } from "spacetimedb/react";
import { DbConnection } from "../module_bindings";
import { GamePage } from "./pages/GamePage.tsx";
import { ProfilePage } from "./pages/ProfilePage.tsx";

const onConnect = (_conn: DbConnection, _identity: any, token: string) => {
  localStorage.setItem("auth_token", token);
};

const onDisconnect = () => {
  console.log("Disconnected from SpacetimeDB");
};

const onConnectError = (_ctx: any, err: Error) => {
  console.log("Error connecting to SpacetimeDB:", err);
};

const connectionBuilder = DbConnection.builder()
  .withUri("ws://localhost:3000")
  .withModuleName("typerace")
  .withToken(localStorage.getItem("auth_token") || undefined)
  .onConnect(onConnect)
  .onDisconnect(onDisconnect)
  .onConnectError(onConnectError);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/game/:gameId" element={<GamePage />} />
          <Route path="/profile/:playerId" element={<ProfilePage />} />
        </Routes>
      </BrowserRouter>
    </SpacetimeDBProvider>
  </StrictMode>
);

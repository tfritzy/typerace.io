import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { Identity } from "spacetimedb";
import { SpacetimeDBProvider } from "spacetimedb/react";
import { DbConnection } from "../module_bindings";
import type { ErrorContextInterface } from "spacetimedb/sdk";
import { GamePage } from "./pages/GamePage.tsx";

const onConnect = (conn: DbConnection, _identity: Identity, token: string) => {
  localStorage.setItem("auth_token", token);

  conn
    .subscriptionBuilder()
    .onError((error: ErrorContextInterface) => {
      console.error(error);
    })
    .subscribe(["select * from playerprogress", "select * from player"]);
};

const onDisconnect = () => {
  console.log("Disconnected from SpacetimeDB");
};

const onConnectError = (_ctx: ErrorContextInterface, err: Error) => {
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
        </Routes>
      </BrowserRouter>
    </SpacetimeDBProvider>
  </StrictMode>
);

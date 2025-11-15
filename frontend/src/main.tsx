import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Identity } from "spacetimedb";
import { SpacetimeDBProvider } from "spacetimedb/react";
import { DbConnection } from "../module_bindings";

const onConnect = (conn: DbConnection, identity: Identity, token: string) => {
  localStorage.setItem("auth_token", token);
};

const onDisconnect = () => {
  console.log("Disconnected from SpacetimeDB");
};

const onConnectError = (err: Error) => {
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
      <App />
    </SpacetimeDBProvider>
  </StrictMode>
);

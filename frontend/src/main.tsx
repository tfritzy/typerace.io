import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Identity, type ErrorContextInterface } from "spacetimedb";
import { SpacetimeDBProvider } from "spacetimedb/react";
import { DbConnection } from "../module_bindings";


const onConnect = (conn: DbConnection, identity: Identity, token: string) => {
  localStorage.setItem("auth_token", token);
  conn
    .subscriptionBuilder()
    .onError((error: ErrorContextInterface) => {
      console.error("Error subscribing to player:", error);
    })
    .subscribe([
      `select * from player where Id = '${identity}'`,
      `select * from playerprogress where PlayerId = '${identity}'`,
    ]);
};

const onDisconnect = () => {
  console.log("Disconnected from SpacetimeDB");
};

const onConnectError = (err: any) => {
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

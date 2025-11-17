import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Identity, type ErrorContextInterface } from "spacetimedb";
import { SpacetimeDBProvider, useTable, useSpacetimeDB } from "spacetimedb/react";
import { DbConnection, PlayerColor } from "../module_bindings";
import { setAccentColor } from "./utils/colorMapping";
import type { Player } from "../module_bindings";

const ColorInitializer = () => {
  const conn = useSpacetimeDB<DbConnection>();
  const { rows: players } = useTable<DbConnection, Player>("player");
  
  useEffect(() => {
    if (!conn?.identity) return;
    
    const myPlayer = players.filter(p => p.id.isEqual(conn.identity!))[0];
    if (myPlayer?.color !== undefined) {
      setAccentColor(myPlayer.color as PlayerColor);
    }
  }, [conn, players]);
  
  return null;
};

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
      <ColorInitializer />
      <App />
    </SpacetimeDBProvider>
  </StrictMode>
);

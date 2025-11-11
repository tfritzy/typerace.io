import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Identity } from "spacetimedb";
import { SpacetimeDBProvider } from "spacetimedb/react";
import { DbConnection, type ErrorContext } from "../module_bindings";

const onConnect = (conn: DbConnection, identity: Identity, token: string) => {
  localStorage.setItem("auth_token", token);
  console.log(
    "Connected to SpacetimeDB with identity:",
    identity.toHexString()
  );
  
  // Subscribe with all possible callbacks
  conn.subscriptionBuilder()
    .onApplied(() => {
      console.log(conn.db);
      console.log("✅ Subscription applied!");
      console.log("Person count:", conn.db.person.count());
      console.log("Persons:", Array.from(conn.db.person.iter()));
    })
    .onError((error) => console.error(error))
    .onError((...args) => {
      console.error("❌ Subscription error - args:", args);
      console.error("❌ Subscription error - arg count:", args.length);
      args.forEach((arg, i) => {
        console.error(`❌ Arg ${i}:`, arg);
      });
    })
    .subscribe("select * from person");
};

const onDisconnect = () => {
  console.log("Disconnected from SpacetimeDB");
};

const onConnectError = (_ctx: ErrorContext, err: Error) => {
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

import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { type ErrorContextInterface } from "spacetimedb";
import { SpacetimeDBProvider } from "spacetimedb/react";
import { DbConnection } from "../module_bindings";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { AuthProvider } from "./firebase/AuthContext.tsx";
import eruda from "eruda";

const Root = () => {
  const [token, setToken] = useState<string | undefined>(undefined);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    eruda.init();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        setToken(idToken);
      } else {
        setToken(undefined);
      }
      setAuthLoaded(true);
    });

    return unsubscribe;
  }, []);

  if (!authLoaded) {
    return null;
  }

  const connectionBuilder = DbConnection.builder()
    .withUri(import.meta.env.VITE_SPACETIMEDB_URI || "ws://localhost:3000")
    .withModuleName("typerace")
    .withToken(token)
    .onConnect((conn, identity) => {
      console.log("Connected with identity:", identity.toHexString());
      conn
        .subscriptionBuilder()
        .onError((error: ErrorContextInterface) => {
          console.error("Error subscribing:", error);
        })
        .subscribe([
          `select * from player where Id = '${identity}'`,
          `select * from playerprogress where PlayerId = '${identity}'`,
          `select * from xpgain where PlayerId = '${identity}'`,
        ]);

      const isAnonymous = auth.currentUser?.isAnonymous ?? true;
      conn.reducers.syncAnonymousStatus(isAnonymous);
    })
    .onDisconnect(() => {
      console.log("Disconnected from SpacetimeDB");
    })
    .onConnectError((err: unknown) => {
      console.log("Error connecting to SpacetimeDB:", err);
    });

  return (
    <AuthProvider>
      <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
        <App />
      </SpacetimeDBProvider>
    </AuthProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
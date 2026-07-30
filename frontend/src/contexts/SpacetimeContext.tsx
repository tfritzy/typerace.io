import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { DbConnection, type ReducerEventContext } from "../../module_bindings";
import { useAuth } from "../firebase/AuthContext";

interface SpacetimeProviderProps {
  children: React.ReactNode;
}

export type DatabaseStatus = "loading" | "connected" | "reconnecting" | "error";

interface SpacetimeContextType {
  conn: DbConnection | null;
  status: DatabaseStatus;
  latencyDeltaMs: number | null;
  reconnect: () => void;
}

const SpacetimeContext = createContext<SpacetimeContextType | undefined>(
  undefined,
);
const CONNECTION_TIMEOUT_MS = 5_000;
const CONNECTION_STABLE_MS = 30_000;
const MAX_RECONNECT_ATTEMPTS = 1;
const PING_INTERVAL_MS = 5_000;
const PING_TIMEOUT_MS = 10_000;

export const useDatabase = () => {
  const context = useContext(SpacetimeContext);
  if (!context) {
    throw new Error("Database hooks must be used inside SpacetimeProvider");
  }
  return context;
};

export const SpacetimeProvider = ({ children }: SpacetimeProviderProps) => {
  const { user, loading: authLoading } = useAuth();
  const [conn, setConn] = useState<DbConnection | null>(null);
  const [status, setStatus] = useState<DatabaseStatus>("loading");
  const [latencyDeltaMs, setLatencyDeltaMs] = useState<number | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const connectionStableTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const connectionRef = useRef<DbConnection | null>(null);
  const activeRef = useRef(true);
  const connectionAttemptRef = useRef(0);
  const reconnectAttemptsRef = useRef(0);

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const clearConnectionTimeout = () => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  };

  const clearConnectionStableTimeout = () => {
    if (connectionStableTimeoutRef.current) {
      clearTimeout(connectionStableTimeoutRef.current);
      connectionStableTimeoutRef.current = null;
    }
  };

  const connect = useCallback(
    async (isReconnect = false) => {
      const attempt = ++connectionAttemptRef.current;
      clearReconnectTimeout();
      clearConnectionTimeout();
      clearConnectionStableTimeout();
      setStatus(isReconnect ? "reconnecting" : "loading");

      connectionTimeoutRef.current = setTimeout(() => {
        connectionTimeoutRef.current = null;
        if (!activeRef.current || attempt !== connectionAttemptRef.current)
          return;

        clearConnectionStableTimeout();
        connectionAttemptRef.current += 1;
        connectionRef.current?.disconnect();
        connectionRef.current = null;
        setConn(null);
        setStatus("error");
      }, CONNECTION_TIMEOUT_MS);

      try {
        let builder = DbConnection.builder()
          .withUri(
            import.meta.env.VITE_SPACETIMEDB_URI || "ws://localhost:3000",
          )
          .withModuleName(
            import.meta.env.VITE_SPACETIMEDB_MODULE || "typerace",
          );

        if (user) {
          builder = builder.withToken(await user.getIdToken());
        }

        if (!activeRef.current || attempt !== connectionAttemptRef.current)
          return;

        const connection = builder
          .onConnect((connected) => {
            if (!activeRef.current || attempt !== connectionAttemptRef.current)
              return;
            clearConnectionTimeout();
            clearConnectionStableTimeout();
            connectionStableTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current = 0;
              connectionStableTimeoutRef.current = null;
            }, CONNECTION_STABLE_MS);
            console.log("Connected to SpacetimeDB");
            connected.reducers.syncAnonymousStatus({ isAnonymous: !user });
            connectionRef.current = connected;
            setConn(connected);
            setStatus("connected");
          })
          .onConnectError((_ctx, error) => {
            if (!activeRef.current || attempt !== connectionAttemptRef.current)
              return;
            clearConnectionTimeout();
            console.error("Failed to connect to SpacetimeDB:", error);
            connectionRef.current = null;
            setConn(null);
            setStatus("error");
          })
          .onDisconnect(() => {
            if (!activeRef.current || attempt !== connectionAttemptRef.current)
              return;
            clearConnectionTimeout();
            clearConnectionStableTimeout();
            console.warn("Disconnected from SpacetimeDB");
            connectionRef.current = null;
            setConn(null);

            if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
              setStatus("error");
              return;
            }

            reconnectAttemptsRef.current += 1;
            setStatus("reconnecting");
            reconnectTimeoutRef.current = setTimeout(() => {
              void connect(true);
            }, 1000);
          })
          .build();

        connectionRef.current = connection;
      } catch (error) {
        if (!activeRef.current || attempt !== connectionAttemptRef.current)
          return;
        clearConnectionTimeout();
        console.error("Failed to connect to SpacetimeDB:", error);
        connectionRef.current = null;
        setConn(null);
        setStatus("error");
      }
    },
    [user],
  );

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connectionRef.current?.disconnect();
    connectionRef.current = null;
    void connect(true);
  }, [connect]);

  useEffect(() => {
    activeRef.current = true;
    if (authLoading) {
      setStatus("loading");
      return;
    }

    reconnectAttemptsRef.current = 0;
    void connect();

    return () => {
      activeRef.current = false;
      connectionAttemptRef.current += 1;
      clearReconnectTimeout();
      clearConnectionTimeout();
      clearConnectionStableTimeout();
      connectionRef.current?.disconnect();
      connectionRef.current = null;
      setConn(null);
    };
  }, [authLoading, connect]);

  useEffect(() => {
    if (!conn) {
      setLatencyDeltaMs(null);
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;
    let nonce = 0n;
    let pending: { nonce: bigint; startedAt: number } | null = null;

    const schedulePing = (delayMs: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(sendPing, delayMs);
    };

    const sendPing = () => {
      if (!conn.isActive) return;

      const nextNonce = ++nonce;
      pending = { nonce: nextNonce, startedAt: performance.now() };
      conn.reducers.ping({ nonce: nextNonce });
      timer = setTimeout(() => {
        if (pending?.nonce === nextNonce) pending = null;
        schedulePing(PING_INTERVAL_MS);
      }, PING_TIMEOUT_MS);
    };

    const handlePing = (ctx: ReducerEventContext, args: { nonce: bigint }) => {
      if (!ctx.event.callerConnectionId?.isEqual(conn.connectionId)) return;
      if (!pending || pending.nonce !== args.nonce) return;

      const delta = performance.now() - pending.startedAt;
      pending = null;
      setLatencyDeltaMs(delta);
      schedulePing(PING_INTERVAL_MS);
    };

    conn.setReducerFlags.ping("FullUpdate");
    conn.reducers.onPing(handlePing);
    schedulePing(0);

    return () => {
      if (timer) clearTimeout(timer);
      conn.reducers.removeOnPing(handlePing);
      setLatencyDeltaMs(null);
    };
  }, [conn]);

  return (
    <SpacetimeContext.Provider
      value={{ conn, status, latencyDeltaMs, reconnect }}
    >
      {children}
    </SpacetimeContext.Provider>
  );
};

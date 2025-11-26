import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { DbConnection } from '../../module_bindings';
import { useAuth } from '../firebase/AuthContext';
import { LoadingDots } from '../components/LoadingDots';

interface SpacetimeProviderProps {
    children: React.ReactNode;
}

interface SpacetimeContextType {
    conn: DbConnection | null;
}

const SpacetimeContext = createContext<SpacetimeContextType | undefined>(undefined);

export const useDatabase = () => {
    const context = useContext(SpacetimeContext);
    if (!context) {
        throw new Error('useDatabase must be used within SpacetimeProvider');
    }
    return context.conn;
};

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000;

export const SpacetimeProvider = ({ children }: SpacetimeProviderProps) => {
    const { user } = useAuth();
    const [conn, setConn] = useState<DbConnection | null>(null);
    const reconnectAttempts = useRef(0);
    const reconnectTimeoutRef = useRef<number | null>(null);
    const isConnecting = useRef(false);
    const connectionRef = useRef<DbConnection | null>(null);

    const connectToDatabase = async () => {
        if (!user || isConnecting.current) {
            return;
        }

        isConnecting.current = true;

        try {
            const idToken = await user.getIdToken();

            const connectionBuilder = DbConnection.builder()
                .withUri(import.meta.env.VITE_SPACETIMEDB_URI || 'ws://localhost:3000')
                .withModuleName('typerace')
                .withToken(idToken)
                .onConnect((connection) => {
                    console.log('Connected to SpacetimeDB');
                    reconnectAttempts.current = 0;
                    const isAnonymous = user?.isAnonymous ?? true;
                    connection.reducers.syncAnonymousStatus(isAnonymous);
                    connectionRef.current = connection;
                    setConn(connection);
                    isConnecting.current = false;
                })
                .onDisconnect(() => {
                    console.warn('Disconnected from SpacetimeDB');
                    connectionRef.current = null;
                    setConn(null);
                    isConnecting.current = false;

                    if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
                        const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current);
                        console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);

                        reconnectTimeoutRef.current = setTimeout(() => {
                            reconnectAttempts.current++;
                            connectToDatabase();
                        }, delay);
                    } else {
                        console.error('Max reconnection attempts reached. Please refresh the page.');
                    }
                })
                .onConnectError((error) => {
                    console.error('SpacetimeDB connection error:', error);
                    isConnecting.current = false;
                });

            const connection = connectionBuilder.build();
            return connection;
        } catch (error) {
            console.error('Failed to connect to SpacetimeDB:', error);
            isConnecting.current = false;
            throw error;
        }
    };

    useEffect(() => {
        if (!user) {
            return;
        }

        const connectionPromise = connectToDatabase();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            connectionPromise.then((connection) => {
                connection?.disconnect();
            });
        };
    }, [user]);

    useEffect(() => {
        if (!user) {
            return;
        }

        if (!conn && !isConnecting.current && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
            console.log('No active connection detected during render, attempting to reconnect...');
            connectToDatabase();
        }
    }, [conn, user]);

    if (!user) {
        return <LoadingDots />;
    }

    if (!conn?.identity) {
        return <LoadingDots />;
    }

    return (
        <SpacetimeContext.Provider value={{ conn }}>
            {children}
        </SpacetimeContext.Provider>
    );
};

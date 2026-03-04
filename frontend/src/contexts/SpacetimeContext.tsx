import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { DbConnection } from '../../module_bindings';
import { isFirebaseEnabled, auth } from '../firebase/config';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { LoadingDots } from '../components/LoadingDots';

const SPACETIMEDB_TOKEN_KEY = 'spacetimedb_token';

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

export const SpacetimeProvider = ({ children }: SpacetimeProviderProps) => {
    const [conn, setConn] = useState<DbConnection | null>(null);
    const [showReconnectModal, setShowReconnectModal] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [reconnectFailed, setReconnectFailed] = useState(false);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const failureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const connectionRef = useRef<DbConnection | null>(null);

    const getToken = async (): Promise<{ token?: string; isAnonymous: boolean }> => {
        if (isFirebaseEnabled && auth?.currentUser) {
            const idToken = await auth.currentUser.getIdToken();
            return { token: idToken, isAnonymous: auth.currentUser.isAnonymous };
        }
        const savedToken = localStorage.getItem(SPACETIMEDB_TOKEN_KEY) || undefined;
        return { token: savedToken, isAnonymous: true };
    };

    const connect = async (isAutoReconnect = false) => {
        if (isAutoReconnect) {
            setIsReconnecting(true);
            setReconnectFailed(false);
        }

        try {
            const { token, isAnonymous } = await getToken();
            const builder = DbConnection.builder()
                .withUri(import.meta.env.VITE_SPACETIMEDB_URI || 'ws://localhost:3000')
                .withDatabaseName(import.meta.env.VITE_SPACETIMEDB_MODULE || 'typerace');

            if (token) {
                builder.withToken(token);
            }

            const connection = builder
                .onConnect((conn, _identity, returnedToken) => {
                    console.log('Connected to SpacetimeDB');
                    if (!isFirebaseEnabled) {
                        localStorage.setItem(SPACETIMEDB_TOKEN_KEY, returnedToken);
                    }
                    conn.reducers.syncAnonymousStatus({ isAnonymous });
                    setConn(conn);
                    connectionRef.current = conn;
                    setShowReconnectModal(false);
                    setIsReconnecting(false);
                    setReconnectFailed(false);

                    if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current);
                        reconnectTimeoutRef.current = null;
                    }
                    if (failureTimeoutRef.current) {
                        clearTimeout(failureTimeoutRef.current);
                        failureTimeoutRef.current = null;
                    }
                })
                .onDisconnect(() => {
                    console.warn('Disconnected from SpacetimeDB');
                    setConn(null);
                    connectionRef.current = null;
                    setShowReconnectModal(true);
                    setIsReconnecting(true);
                    setReconnectFailed(false);

                    reconnectTimeoutRef.current = setTimeout(async () => {
                        try {
                            await connect(true);
                            failureTimeoutRef.current = setTimeout(() => {
                                if (!connectionRef.current) {
                                    setIsReconnecting(false);
                                    setReconnectFailed(true);
                                }
                            }, 5000);
                        } catch {
                            setIsReconnecting(false);
                            setReconnectFailed(true);
                        }
                    }, 1000);
                })
                .build();

            return connection;
        } catch (error) {
            console.error('Failed to connect to SpacetimeDB:', error);
            if (isAutoReconnect) {
                setIsReconnecting(false);
                setReconnectFailed(true);
            }
        }
    };

    const handleManualReconnect = () => {
        setIsReconnecting(true);
        setReconnectFailed(false);
        connect(true)
            .then(() => {
                failureTimeoutRef.current = setTimeout(() => {
                    if (!connectionRef.current) {
                        setIsReconnecting(false);
                        setReconnectFailed(true);
                    }
                }, 5000);
            })
            .catch(() => {
                setIsReconnecting(false);
                setReconnectFailed(true);
            });
    };

    useEffect(() => {
        const cleanup = () => {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (failureTimeoutRef.current) clearTimeout(failureTimeoutRef.current);
            connectionRef.current?.disconnect();
            setConn(null);
        };

        if (isFirebaseEnabled && auth) {
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                if (!firebaseUser) {
                    try {
                        await signInAnonymously(auth!);
                    } catch (error) {
                        console.error('Failed to sign in anonymously:', error);
                    }
                    return;
                }
                connectionRef.current?.disconnect();
                connect();
            });
            return () => { unsubscribe(); cleanup(); };
        }

        connect();
        return cleanup;
    }, []);

    if (!conn?.identity && !showReconnectModal) {
        return <LoadingDots />;
    }

    return (
        <SpacetimeContext.Provider value={{ conn }}>
            {showReconnectModal && (
                <div
                    className="fixed inset-0 bg-black/20 flex items-center justify-center z-2000"
                    style={{
                        animation: 'modalFadeIn 0.2s ease-out'
                    }}
                >
                    <style>
                        {`
                            @keyframes spin {
                                to { transform: rotate(360deg); }
                            }
                        `}
                    </style>
                    <div
                        className="glass-surface rounded-xl p-8 min-w-[400px] max-w-[500px]"
                        style={{
                            animation: 'modalSlideIn 0.2s ease-out'
                        }}
                    >
                        <h2 className="text-white text-2xl font-bold mb-4 mt-0">
                            Connection Lost
                        </h2>
                        {isReconnecting ? (
                            <div className="flex flex-col items-center py-4">
                                <div
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        border: '3px solid rgba(255, 255, 255, 0.1)',
                                        borderTopColor: 'rgba(255, 255, 255, 0.6)',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite'
                                    }}
                                />
                                <p className="text-white/60 mt-4 mb-0">
                                    Reconnecting...
                                </p>
                            </div>
                        ) : reconnectFailed ? (
                            <>
                                <p className="text-white/60 mb-8">
                                    Failed to reconnect automatically. Please try again.
                                </p>
                                <button
                                    onClick={handleManualReconnect}
                                    className="w-full border-0 rounded-md px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
                                    style={{
                                        backgroundColor: 'var(--color-accent)'
                                    }}
                                >
                                    Reconnect
                                </button>
                            </>
                        ) : (
                            <p className="text-white/60 mb-0">
                                Your connection to the server has been lost.
                            </p>
                        )}
                    </div>
                </div>
            )}
            {children}
        </SpacetimeContext.Provider>
    );
};

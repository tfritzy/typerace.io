import { createContext, useContext, useEffect, useState, useRef } from 'react';
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
    return context?.conn ?? null;
};

export const SpacetimeProvider = ({ children }: SpacetimeProviderProps) => {
    const { user, loading: authLoading } = useAuth();
    const [conn, setConn] = useState<DbConnection | null>(null);
    const [showReconnectModal, setShowReconnectModal] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [reconnectFailed, setReconnectFailed] = useState(false);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const failureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const connect = async (isAutoReconnect = false) => {
        if (isAutoReconnect) {
            setIsReconnecting(true);
            setReconnectFailed(false);
        }

        try {
            let builder = DbConnection.builder()
                .withUri(import.meta.env.VITE_SPACETIMEDB_URI || 'ws://localhost:3000')
                .withModuleName(import.meta.env.VITE_SPACETIMEDB_MODULE || 'typerace');

            if (user) {
                const idToken = await user.getIdToken();
                builder = builder.withToken(idToken);
            }

            const connection = builder
                .onConnect((conn) => {
                    console.log('Connected to SpacetimeDB');
                    conn.reducers.syncAnonymousStatus({ isAnonymous: !user });
                    setConn(conn);
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
                    setShowReconnectModal(true);
                    setIsReconnecting(true);
                    setReconnectFailed(false);

                    reconnectTimeoutRef.current = setTimeout(async () => {
                        try {
                            await connect(true);
                            failureTimeoutRef.current = setTimeout(() => {
                                if (!conn) {
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
                    if (!conn) {
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
        if (authLoading) return;

        const connectionPromise = connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (failureTimeoutRef.current) {
                clearTimeout(failureTimeoutRef.current);
            }
            connectionPromise.then((connection) => {
                connection?.disconnect();
                setConn(null);
            });
        };
    }, [user?.uid, authLoading]);

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
                        className="bg-card border border-border rounded-xl p-8 min-w-[400px] max-w-[500px]"
                        style={{
                            animation: 'modalSlideIn 0.2s ease-out'
                        }}
                    >
                        <h2 className="text-foreground text-2xl font-bold mb-4 mt-0">
                            Connection Lost
                        </h2>
                        {isReconnecting ? (
                            <div className="flex flex-col items-center py-4">
                                <div
                                    className="w-8 h-8 border-[3px] border-secondary border-t-muted-foreground rounded-full"
                                    style={{
                                        animation: 'spin 0.8s linear infinite'
                                    }}
                                />
                                <p className="text-muted-foreground mt-4 mb-0">
                                    Reconnecting...
                                </p>
                            </div>
                        ) : reconnectFailed ? (
                            <>
                                <p className="text-muted-foreground mb-8">
                                    Failed to reconnect automatically. Please try again.
                                </p>
                                <button
                                    onClick={handleManualReconnect}
                                    className="w-full border-0 rounded-md px-5 py-2.5 text-sm font-semibold text-foreground cursor-pointer bg-primary"
                                >
                                    Reconnect
                                </button>
                            </>
                        ) : (
                            <p className="text-muted-foreground mb-0">
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

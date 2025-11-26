import { createContext, useContext, useEffect, useState } from 'react';
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

export const SpacetimeProvider = ({ children }: SpacetimeProviderProps) => {
    const { user } = useAuth();
    const [conn, setConn] = useState<DbConnection | null>(null);
    const [showReconnectModal, setShowReconnectModal] = useState(false);

    const connect = async () => {
        if (!user) return;

        try {
            const idToken = await user.getIdToken();

            const connection = DbConnection.builder()
                .withUri(import.meta.env.VITE_SPACETIMEDB_URI || 'ws://localhost:3000')
                .withModuleName('typerace')
                .withToken(idToken)
                .onConnect((conn) => {
                    console.log('Connected to SpacetimeDB');
                    conn.reducers.syncAnonymousStatus(user.isAnonymous);
                    setConn(conn);
                    setShowReconnectModal(false);
                })
                .onDisconnect(() => {
                    console.warn('Disconnected from SpacetimeDB');
                    setConn(null);
                    setShowReconnectModal(true);
                })
                .build();

            return connection;
        } catch (error) {
            console.error('Failed to connect to SpacetimeDB:', error);
        }
    };

    useEffect(() => {
        if (!user) {
            return;
        }

        const connectionPromise = connect();

        return () => {
            connectionPromise.then((connection) => {
                connection?.disconnect();
                setConn(null);
            });
        };
    }, [user?.uid]);

    if (!user) {
        return <LoadingDots />;
    }

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
                    <div
                        className="bg-[#272727] border border-white/15 rounded-xl p-8 min-w-[400px] max-w-[500px]"
                        style={{
                            animation: 'modalSlideIn 0.2s ease-out'
                        }}
                    >
                        <h2 className="text-white text-2xl font-bold mb-4 mt-0">
                            Connection Lost
                        </h2>
                        <p className="text-white/60 mb-8">
                            Your connection to the server has been lost. Please reconnect to continue.
                        </p>
                        <button
                            onClick={connect}
                            className="w-full border-0 rounded-md px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
                            style={{
                                backgroundColor: 'var(--color-accent)'
                            }}
                        >
                            Reconnect
                        </button>
                    </div>
                </div>
            )}
            {children}
        </SpacetimeContext.Provider>
    );
};

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

    useEffect(() => {
        if (!user) {
            return;
        }

        const connectToDatabase = async () => {
            const idToken = await user.getIdToken();

            const connectionBuilder = DbConnection.builder()
                .withUri(import.meta.env.VITE_SPACETIMEDB_URI || 'ws://localhost:3000')
                .withModuleName('typerace')
                .withToken(idToken)
                .onConnect((connection) => {
                    const isAnonymous = user?.isAnonymous ?? true;
                    connection.reducers.syncAnonymousStatus(isAnonymous);
                    setConn(connection);
                });

            const connection = connectionBuilder.build();

            return connection;
        };

        const connectionPromise = connectToDatabase();

        return () => {
            connectionPromise.then((connection) => {
                connection?.disconnect();
            });
        };
    }, [user]);

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

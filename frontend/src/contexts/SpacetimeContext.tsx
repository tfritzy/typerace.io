import { useEffect, useState } from 'react';
import { SpacetimeDBProvider, useSpacetimeDB } from 'spacetimedb/react';
import { DbConnection } from '../../module_bindings';
import { useAuth } from '../firebase/AuthContext';
import { LoadingDots } from '../components/LoadingDots';

interface SpacetimeProviderProps {
    children: React.ReactNode;
}

const IdentityGate = ({ children }: { children: React.ReactNode }) => {
    const conn = useSpacetimeDB<DbConnection>();
    const [, setTick] = useState(0);

    useEffect(() => {
        let animationFrameId: number;
        const checkIdentity = () => {
            if (!conn?.identity) {
                setTick(t => t + 1);
                animationFrameId = requestAnimationFrame(checkIdentity);
            } else {
                setTick(t => t + 1);
            }
        };

        animationFrameId = requestAnimationFrame(checkIdentity);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [conn?.identity]);

    if (!conn?.identity) {
        return <LoadingDots key="app-loading" />;
    }

    return <>{children}</>;
};

export const SpacetimeProvider = ({ children }: SpacetimeProviderProps) => {
    const { user } = useAuth();
    const [token, setToken] = useState<string | undefined>(undefined);

    useEffect(() => {
        const loadToken = async () => {
            if (user) {
                const idToken = await user.getIdToken();
                setToken(idToken);
            } else {
                setToken(undefined);
            }
        };

        loadToken();
    }, [user]);

    if (!token) {
        return <LoadingDots key="app-loading" />;
    }

    const connectionBuilder = DbConnection.builder()
        .withUri(import.meta.env.VITE_SPACETIMEDB_URI || 'ws://localhost:3000')
        .withModuleName('typerace')
        .withToken(token)
        .onConnect((conn, identity) => {
            console.log('Connected with identity:', identity.toHexString());
            const isAnonymous = user?.isAnonymous ?? true;
            conn.reducers.syncAnonymousStatus(isAnonymous);
        })
        .onDisconnect(() => {
            console.log('Disconnected from SpacetimeDB');
        })
        .onConnectError((err: unknown) => {
            console.log('Error connecting to SpacetimeDB:', err);
        });

    return (
        <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
            <IdentityGate>
                {children}
            </IdentityGate>
        </SpacetimeDBProvider>
    );
};

import { useEffect, useState, useRef } from 'react';
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
        return <LoadingDots />;
    }

    return <>{children}</>;
};

export const SpacetimeProvider = ({ children }: SpacetimeProviderProps) => {
    const { user } = useAuth();
    const [token, setToken] = useState<string | undefined>(undefined);
    const [tokenUserId, setTokenUserId] = useState<string | undefined>(undefined);
    const previousUserIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!user) {
            setToken(undefined);
            setTokenUserId(undefined);
            previousUserIdRef.current = undefined;
            return;
        }

        const userChanged = user.uid !== previousUserIdRef.current;
        if (userChanged) {
            setToken(undefined);
            setTokenUserId(undefined);
        }

        const loadToken = async () => {
            const idToken = await user.getIdToken();
            setToken(idToken);
            setTokenUserId(user.uid);
            previousUserIdRef.current = user.uid;
        };

        loadToken();
    }, [user]);

    if (!user || !token || tokenUserId !== user.uid) {
        return <LoadingDots />;
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
        <SpacetimeDBProvider key={tokenUserId} connectionBuilder={connectionBuilder}>
            <IdentityGate>
                {children}
            </IdentityGate>
        </SpacetimeDBProvider>
    );
};

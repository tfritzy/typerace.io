'use client';

import { useEffect, useState } from 'react';
import { type ErrorContextInterface } from 'spacetimedb';
import { SpacetimeDBProvider as SpacetimeProvider } from 'spacetimedb/react';
import { DbConnection } from '@/module_bindings';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

interface SpacetimeDBClientProviderProps {
  children: React.ReactNode;
}

export const SpacetimeDBClientProvider = ({ children }: SpacetimeDBClientProviderProps) => {
  const [token, setToken] = useState<string | undefined>(undefined);
  const [authLoaded, setAuthLoaded] = useState(false);

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
    return <>{children}</>;
  }

  const connectionBuilder = DbConnection.builder()
    .withUri(process.env.NEXT_PUBLIC_SPACETIMEDB_URI || 'ws://localhost:3000')
    .withModuleName('typerace')
    .withToken(token)
    .onConnect((conn, identity) => {
      console.log('Connected with identity:', identity.toHexString());
      conn
        .subscriptionBuilder()
        .onError((error: ErrorContextInterface) => {
          console.error('Error subscribing:', error);
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
      console.log('Disconnected from SpacetimeDB');
    })
    .onConnectError((err: unknown) => {
      console.log('Error connecting to SpacetimeDB:', err);
    });

  return (
    <SpacetimeProvider connectionBuilder={connectionBuilder}>
      {children}
    </SpacetimeProvider>
  );
};

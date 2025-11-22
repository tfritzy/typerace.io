'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const GameClient = dynamic(() => import('./GameClient'), {
  ssr: false,
  loading: () => null,
});

export default function GamePageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <GameClient />;
}

'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ProfileClient = dynamic(() => import('./ProfileClient'), {
  ssr: false,
  loading: () => null,
});

export default function ProfilePageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <ProfileClient />;
}

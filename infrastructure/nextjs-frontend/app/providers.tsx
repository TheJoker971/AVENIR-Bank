/**
 * Providers wrapper pour les contexts React
 */
'use client';

import { ReactNode } from 'react';
import { ActiveAccountProvider } from '@/presentation/hooks/useActiveAccount';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ActiveAccountProvider>
      {children}
    </ActiveAccountProvider>
  );
}


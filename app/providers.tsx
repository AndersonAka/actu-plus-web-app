'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@/lib/contexts/ToastContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}

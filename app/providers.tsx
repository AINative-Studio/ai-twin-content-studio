'use client';

import { AINativeProvider } from '@ainative/react-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }));

  const ainativeConfig = {
    apiKey: process.env.NEXT_PUBLIC_AINATIVE_API_KEY ?? '',
    baseUrl: process.env.NEXT_PUBLIC_AINATIVE_API_URL ?? 'https://api.ainative.studio/api/v1/public',
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AINativeProvider config={ainativeConfig}>
        {children}
      </AINativeProvider>
    </QueryClientProvider>
  );
}

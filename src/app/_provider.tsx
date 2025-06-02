'use client';

import { YoutubeInitialize } from '@/shared/api/YoutubeInitialize';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

const queryClient = new QueryClient();

export const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <YoutubeInitialize />
    </QueryClientProvider>
  );
};

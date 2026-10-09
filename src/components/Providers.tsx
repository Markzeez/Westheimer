'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { type ReactNode, useEffect, useState } from 'react';
import { ToastProvider } from './ToastProvider';
import { useCartStore, useWishlistStore } from '@/stores/cartStore';

function AuthenticatedStoreSync() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      void useCartStore.getState().syncFromSupabase();
      void useWishlistStore.getState().syncFromSupabase();
    }
  }, [isLoaded, isSignedIn, user?.id]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ClerkProvider>
      <AuthenticatedStoreSync />
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
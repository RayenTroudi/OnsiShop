'use client';

import GlobalLoading from '@/components/common/GlobalLoading';
import { VideoLoadingMonitor } from '@/components/debug/VideoLoadingMonitor';
import CacheManager from '@/components/dev/CacheManager';
import ServiceWorkerProvider from '@/components/providers/ServiceWorkerProvider';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { LoadingProvider, useLoading } from '@/contexts/LoadingContext';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { setupBroadcastCacheListener, setupCacheInvalidationListener } from '@/lib/cache-invalidation';
import { useEffect } from 'react';

interface ClientProvidersProps {
  children: React.ReactNode;
}

function CartProviderWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Always provide CartProvider, even during loading
  // If user is logged out or loading, use empty userId which will result in empty cart
  const userId = user?.id || '';

  return (
    <CartProvider userId={userId}>
      {children}
    </CartProvider>
  );
}

function GlobalLoadingWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading, loadingTasks } = useLoading();

  return (
    <>
      <GlobalLoading 
        isLoading={isLoading} 
        loadingTasks={loadingTasks}
      />
      {children}
    </>
  );
}

function CacheInvalidationProvider() {
  useEffect(() => {
    // Setup cache invalidation listeners
    setupCacheInvalidationListener();
    setupBroadcastCacheListener();
  }, []);

  return null;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <LoadingProvider>
      <TranslationProvider defaultLanguage="fr">
        <AuthProvider>
          <CartProviderWrapper>
            <GlobalLoadingWrapper>
              <ServiceWorkerProvider />
              <CacheInvalidationProvider />
              <CacheManager />
              <VideoLoadingMonitor />
              {children}
            </GlobalLoadingWrapper>
          </CartProviderWrapper>
        </AuthProvider>
      </TranslationProvider>
    </LoadingProvider>
  );
}

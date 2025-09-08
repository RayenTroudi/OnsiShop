'use client';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { TranslationProvider } from '@/contexts/TranslationContext';

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

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <TranslationProvider defaultLanguage="fr">
      <AuthProvider>
        <CartProviderWrapper>
          {children}
        </CartProviderWrapper>
      </AuthProvider>
    </TranslationProvider>
  );
}

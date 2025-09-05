'use client';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

interface ClientProvidersProps {
  children: React.ReactNode;
}

function CartProviderWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // While auth is loading, don't render cart provider
  if (loading) {
    return <div>{children}</div>;
  }

  // If user is logged out, use empty userId which will result in empty cart
  const userId = user?.id || '';

  return (
    <CartProvider userId={userId}>
      {children}
    </CartProvider>
  );
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AuthProvider>
      <CartProviderWrapper>
        {children}
      </CartProviderWrapper>
    </AuthProvider>
  );
}

'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { useEffect, useState } from 'react';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // In a real app, this would get the userId from authentication context
    // For demo purposes, we'll generate a consistent user ID based on browser
    let storedUserId = localStorage.getItem('demo-user-id');
    if (!storedUserId) {
      storedUserId = `demo-user-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('demo-user-id', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  // Don't render until we have a userId to prevent hydration mismatches
  if (!userId) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <AuthProvider>
      <CartProvider userId={userId}>
        {children}
      </CartProvider>
    </AuthProvider>
  );
}

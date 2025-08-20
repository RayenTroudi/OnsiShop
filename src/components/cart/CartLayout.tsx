'use client';

import { CartProvider } from '@/contexts/CartContext';
import { ReactNode } from 'react';

interface CartLayoutProps {
  children: ReactNode;
  userId: string; // In real app, get this from your auth system
}

export default function CartLayout({ children, userId }: CartLayoutProps) {
  return (
    <CartProvider userId={userId}>
      {children}
    </CartProvider>
  );
}

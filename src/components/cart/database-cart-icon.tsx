'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import CartModal from './database-cart-modal';

interface CartData {
  id: string | null;
  userId: string | null;
  items: any[];
  totalItems: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export default function DatabaseCartIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  // Fetch cart data directly from API
  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/cart', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCart(result.data);
        }
      } else {
        setCart(null);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cart when user changes
  useEffect(() => {
    fetchCart();
  }, [user]);

  // Listen for cart updates from add to cart buttons
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [user]);

  return (
    <>
      <button
        aria-label="Open cart"
        onClick={openCart}
        className="flex h-full items-center justify-center [&>*]:transition-all [&>*]:duration-300 hover:[&>*]:opacity-50"
      >
        <div className="relative">
          <img
            src="/images/cart.png"
            alt="Cart"
            width={36}
            height={36}
            className="w-9 h-9"
          />
          {cart && cart.totalItems > 0 && (
            <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-purple text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] text-[10px] z-10">
              {cart.totalItems > 99 ? '99+' : cart.totalItems}
            </div>
          )}
        </div>
      </button>
      
      {isOpen && (
        <CartModal 
          cart={cart} 
          isOpen={isOpen} 
          onClose={closeCart}
          onCartUpdate={fetchCart}
          userId={user?.id || ''}
        />
      )}
    </>
  );
}
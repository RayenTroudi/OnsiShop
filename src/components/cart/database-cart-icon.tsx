'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useEffect, useState } from 'react';
import CartModal from './database-cart-modal';

export default function DatabaseCartIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  
  // Use try-catch to handle potential context issues gracefully
  let cart: any = null;
  let refreshCart: () => void = () => {};
  
  try {
    const cartContext = useCart();
    cart = cartContext.cart;
    refreshCart = cartContext.refreshCart;
  } catch (error) {
    console.warn('Cart context not available:', error);
  }

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  // Listen for cart updates from add to cart buttons (for backwards compatibility)
  useEffect(() => {
    const handleCartUpdate = () => {
      refreshCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [refreshCart]);

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
          onCartUpdate={refreshCart}
          userId={user?.id || ''}
        />
      )}
    </>
  );
}
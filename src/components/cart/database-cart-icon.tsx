'use client';

import { useCart } from '@/contexts/CartContext';
import { useEffect, useState } from 'react';
import CartModal from './database-cart-modal';

export default function DatabaseCartIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const { cart, refreshCart } = useCart();
  
  useEffect(() => {
    const storedUserId = localStorage.getItem('demo-user-id') || 'demo-user-123';
    setUserId(storedUserId);
  }, []);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

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
          userId={userId}
        />
      )}
    </>
  );
}
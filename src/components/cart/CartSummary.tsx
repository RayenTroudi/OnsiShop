'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CartSummaryProps {
  className?: string;
  showText?: boolean;
}

export default function CartSummary({ className = '', showText = true }: CartSummaryProps) {
  const { cart, loading } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="relative">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m12.5-6v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
          </svg>
        </div>
        {showText && <span className="text-gray-400 text-sm">Cart</span>}
      </div>
    );
  }

  const itemCount = cart?.totalItems || 0;
  const totalAmount = cart?.totalAmount || 0;

  return (
    <Link 
      href="/cart" 
      className={`flex items-center space-x-2 hover:text-purple transition-colors ${className}`}
    >
      <div className="relative">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m12.5-6v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
        </svg>
        
        {/* Cart count badge */}
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-purple text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </div>
      
      {showText && (
        <div className="text-sm">
          {loading ? (
            <span>Loading...</span>
          ) : itemCount > 0 ? (
            <div>
              <div className="font-medium">Cart ({itemCount})</div>
              <div className="text-xs text-gray-500">${totalAmount.toFixed(2)}</div>
            </div>
          ) : (
            <span>Cart</span>
          )}
        </div>
      )}
    </Link>
  );
}

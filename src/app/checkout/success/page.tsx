'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function CheckoutSuccessPage() {
  useEffect(() => {
    // Clear cart after successful order
    const clearCart = async () => {
      try {
        // You can implement a clear cart API endpoint
        // await fetch('/api/cart/clear', { method: 'POST' });
        
        // For now, just trigger a cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    };

    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Order Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been received and will be processed soon.
        </p>
        
        <div className="text-sm text-gray-500 mb-6">
          <p>You will receive an email confirmation shortly.</p>
          <p>Order ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-purple text-white py-3 px-4 rounded-lg font-semibold hover:bg-darkPurple transition-colors"
          >
            Continue Shopping
          </Link>
          
          <Link
            href="/account/orders"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface BuyNowButtonProps {
  productId: string;
  availableForSale?: boolean;
  stock?: number;
  className?: string;
  children?: React.ReactNode;
}

export default function BuyNowButton({
  productId,
  availableForSale = true,
  stock = 0,
  className = '',
  children = 'Buy Now'
}: BuyNowButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyNow = async () => {
    if (!availableForSale || stock <= 0) return;

    setIsLoading(true);

    try {
      if (!user) {
        // Redirect to login with buy now intent
        router.push(`/login?redirect=/products/${productId}&action=buy-now`);
        return;
      }

      // Add to cart first
      const addResponse = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          quantity: 1
        }),
      });

      if (addResponse.ok) {
        // Redirect directly to checkout
        router.push('/checkout');
      } else {
        const errorData = await addResponse.json();
        alert(errorData.error || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error in buy now:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!availableForSale || stock <= 0) {
    return (
      <button
        disabled
        className={`${className} opacity-50 cursor-not-allowed`}
      >
        Out of Stock
      </button>
    );
  }

  return (
    <button
      onClick={handleBuyNow}
      disabled={isLoading}
      className={`${className} ${isLoading ? 'opacity-70 cursor-wait' : 'hover:scale-105'} transition-all`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

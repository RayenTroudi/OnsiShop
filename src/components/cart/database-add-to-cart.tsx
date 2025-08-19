'use client';

import { useState } from 'react';

interface DatabaseAddToCartProps {
  productId: string;
  variantId?: string;
  availableForSale?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function DatabaseAddToCart({
  productId,
  variantId,
  availableForSale = true,
  className = '',
  children
}: DatabaseAddToCartProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddToCart = async () => {
    if (!availableForSale) return;

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          variantId,
          quantity: 1
        })
      });

      if (response.ok) {
        setMessage('Added to cart!');
        // Trigger cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        // Clear message after 2 seconds
        setTimeout(() => setMessage(''), 2000);
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setMessage('Failed to add to cart');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleAddToCart}
        disabled={!availableForSale || isLoading}
        className={`${className} ${
          !availableForSale 
            ? 'cursor-not-allowed opacity-50' 
            : 'hover:opacity-80 transition-opacity'
        }`}
      >
        {children || (
          <span>
            {isLoading ? 'Adding...' : availableForSale ? 'Add to Cart' : 'Sold Out'}
          </span>
        )}
      </button>
      
      {message && (
        <div className={`absolute top-full left-0 mt-2 px-3 py-1 rounded text-sm z-10 ${
          message.includes('Failed') 
            ? 'bg-red-100 text-red-800 border border-red-200' 
            : 'bg-green-100 text-green-800 border border-green-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
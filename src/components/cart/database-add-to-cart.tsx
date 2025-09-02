'use client';

import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

interface DatabaseAddToCartProps {
  productId: string;
  variantId?: string;
  availableForSale?: boolean;
  stock?: number;
  className?: string;
  children?: React.ReactNode;
}

export default function DatabaseAddToCart({
  productId,
  variantId,
  availableForSale = true,
  stock = 0,
  className = '',
  children
}: DatabaseAddToCartProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    if (!availableForSale || stock <= 0) return;

    console.log('DatabaseAddToCart: Adding to cart', {
      productId,
      variantId,
      availableForSale,
      stock
    });

    setIsLoading(true);
    setMessage('');

    try {
      // Only pass variantId if it's actually defined and not empty
      const success = variantId && variantId.trim() !== '' 
        ? await addToCart(productId, 1, variantId)
        : await addToCart(productId, 1);
        
      console.log('DatabaseAddToCart: Result', success);
        
      if (success) {
        setMessage('Added to cart!');
        
        // Clear message after 2 seconds
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage('Failed to add to cart');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('DatabaseAddToCart: Error adding to cart:', error);
      setMessage('Failed to add to cart');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const isOutOfStock = stock <= 0 || !availableForSale;

  return (
    <div className="relative">
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isLoading}
        className={`${className} ${
          isOutOfStock 
            ? 'cursor-not-allowed opacity-50' 
            : 'hover:opacity-80 transition-opacity'
        }`}
      >
        {children || (
          <span>
            {isLoading ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </span>
        )}
      </button>
      
      {stock > 0 && stock <= 5 && !isOutOfStock && (
        <div className="absolute top-full left-0 mt-1 text-xs text-orange-600 whitespace-nowrap">
          Only {stock} left
        </div>
      )}
      
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
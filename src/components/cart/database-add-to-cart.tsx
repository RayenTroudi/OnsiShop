'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();
  const { addToCart, refreshCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddToCart = async () => {
    if (!availableForSale || stock <= 0) return;
    if (!isClient) return;

    // Debug: Check user state
    console.log('🔍 DatabaseAddToCart Debug:', {
      user: user,
      isLoggedIn: !!user,
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email
    });

    // Debug: Check cookies
    if (typeof document !== 'undefined') {
      console.log('🍪 Browser Cookies:', {
        allCookies: document.cookie,
        hasAuthToken: document.cookie.includes('auth-token'),
        authTokenValue: document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1]?.substring(0, 10) + '...'
      });
    }

    // Check if user is logged in
    if (!user) {
      console.log('🚫 User not logged in, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('✅ User is logged in, proceeding with add to cart');
    console.log('DatabaseAddToCart: Adding to cart', {
      productId,
      variantId,
      availableForSale,
      stock
    });

    setIsLoading(true);
    setMessage('');

    try {
      // Use cart context for proper state management
      const success = await addToCart(
        productId, 
        1, 
        variantId && variantId.trim() !== '' ? variantId : undefined
      );
        
      if (success) {
        setMessage('Added to cart!');
        
        // Dispatch custom event to update cart icon (for backwards compatibility)
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        // Clear message after 2 seconds
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage('Failed to add to cart. Please try again.');
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
  const isLoggedOut = !user;

  return (
    <div className="relative">
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isLoading || !isClient}
        className={`${className} ${
          isOutOfStock || !isClient
            ? 'cursor-not-allowed opacity-50' 
            : 'hover:opacity-80 transition-opacity'
        }`}
      >
        {children || (
          <span>
            {isLoading 
              ? 'Adding...' 
              : isOutOfStock 
                ? 'Out of Stock' 
                : !isClient
                  ? 'Loading...'
                  : isLoggedOut
                    ? 'Login to Add to Cart'
                    : 'Add to Cart'
            }
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
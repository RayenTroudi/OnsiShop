'use client';

import { useEffect, useState } from 'react';

interface CartItem {
  id: string;
  quantity: number;
  variantId?: string;
  product: {
    id: string;
    title: string;
    handle: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
  };
}

interface DatabaseCart {
  id: string;
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

export function useDatabaseCart() {
  const [cart, setCart] = useState<DatabaseCart | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const cartData = await response.json();
        setCart(cartData);
      } else {
        setCart({ id: '', items: [], totalQuantity: 0, totalAmount: 0 });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ id: '', items: [], totalQuantity: 0, totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener('cartUpdate', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdate', handleCartUpdate);
    };
  }, []);

  return { cart, loading, refetch: fetchCart };
}

'use client';

import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  images?: string;
}

interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  variantId?: string;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity?: number, variantId?: string) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
  checkout: () => Promise<{ success: boolean; orderId?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
  userId: string; // Empty string when user is logged out
}

export function CartProvider({ children, userId }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart data
  const refreshCart = useCallback(async () => {
    // If no userId (user logged out), clear cart
    if (!userId) {
      setCart(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/cart`);
      const result = await response.json();
      
      if (result.success) {
        setCart(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch cart');
      console.error('Cart fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Add item to cart
  const addToCart = useCallback(async (productId: string, quantity = 1, variantId?: string): Promise<boolean> => {
    // If no userId (user logged out), redirect to login
    if (!userId) {
      // Redirect to login page
      window.location.href = '/login';
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🛒 CartContext addToCart called:', {
        userId,
        productId,
        quantity,
        variantId
      });
      
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, variantId })
      });
      
      const result = await response.json();
      
      console.log('🛒 CartContext addToCart response:', {
        status: response.status,
        success: result.success,
        message: result.message
      });
      
      if (result.success) {
        await refreshCart();
        return true;
      } else {
        if (response.status === 401) {
          // Authentication failed, redirect to login
          window.location.href = '/login';
          return false;
        }
        setError(result.message);
        return false;
      }
    } catch (err) {
      console.error('🛒 CartContext addToCart error:', err);
      setError('Failed to add item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, refreshCart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId: string): Promise<boolean> => {
    // If no userId (user logged out), can't modify cart
    if (!userId) {
      setError('Please log in to modify cart');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/cart/remove/${itemId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        await refreshCart();
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      setError('Failed to remove item from cart');
      console.error('Remove from cart error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, refreshCart]);

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number): Promise<boolean> => {
    // If no userId (user logged out), can't modify cart
    if (!userId) {
      setError('Please log in to modify cart');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity })
      });
      
      const result = await response.json();
      
      if (result.success) {
        await refreshCart();
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      setError('Failed to update item quantity');
      console.error('Update quantity error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, refreshCart]);

  // Clear cart (checkout)
  const checkout = useCallback(async (): Promise<{ success: boolean; orderId?: string }> => {
    // If no userId (user logged out), can't checkout
    if (!userId) {
      setError('Please log in to checkout');
      return { success: false };
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        await refreshCart(); // Refresh to show empty cart
        return { success: true, orderId: result.data.orderId };
      } else {
        setError(result.message);
        return { success: false };
      }
    } catch (err) {
      setError('Checkout failed');
      console.error('Checkout error:', err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [userId, refreshCart]);

  // Clear cart without checkout
  const clearCart = useCallback(async (): Promise<boolean> => {
    if (!userId) return true;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success) {
        await refreshCart(); // Refresh to show empty cart
        return true;
      } else {
        setError(result.message || 'Failed to clear cart');
        return false;
      }
      
    } catch (err) {
      setError('Failed to clear cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, refreshCart]);

  // Load cart on mount and user change
  useEffect(() => {
    refreshCart();
  }, [userId]);

  const value: CartContextType = {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    checkout
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export type { Cart, CartItem, Product };

'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

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
  userId: string; // In real app, get this from auth context
}

export function CartProvider({ children, userId }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart data
  const refreshCart = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/cart/user/${userId}`);
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
  };

  // Add item to cart
  const addToCart = async (productId: string, quantity = 1, variantId?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity, variantId })
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
      setError('Failed to add item to cart');
      console.error('Add to cart error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string): Promise<boolean> => {
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
  };

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
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
  };

  // Clear cart (checkout)
  const checkout = async (): Promise<{ success: boolean; orderId?: string }> => {
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
  };

  // Clear cart without checkout
  const clearCart = async (): Promise<boolean> => {
    if (!cart) return true;
    
    try {
      setLoading(true);
      
      // Remove all items one by one
      for (const item of cart.items) {
        await removeFromCart(item.id);
      }
      
      return true;
    } catch (err) {
      setError('Failed to clear cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

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

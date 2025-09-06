'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CartPage() {
  const { user } = useAuth();
  const { 
    cart, 
    loading, 
    error, 
    updateQuantity, 
    removeFromCart
  } = useCart();
  const router = useRouter();
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setActionLoading(itemId);
    await updateQuantity(itemId, newQuantity);
    setActionLoading(null);
  };

  const handleRemoveItem = async (itemId: string) => {
    setActionLoading(itemId);
    await removeFromCart(itemId);
    setActionLoading(null);
  };

  const handleCheckout = () => {
    if (!user) {
      // Redirect to login with checkout redirect
      router.push('/login?redirect=/checkout');
    } else {
      // User is logged in, go to checkout
      router.push('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading cart...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Your cart is empty</div>
          <a 
            href="/"
            className="mt-4 inline-block bg-purple text-white px-6 py-2 rounded hover:bg-purple/80"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Cart Items */}
        <div className="divide-y divide-gray-200">
          {cart.items.map((item) => {
            const product = item.product;
            const subtotal = (() => {
              const price = (product as any).price || 
                           parseFloat((product as any).priceRange?.minVariantPrice?.amount) || 
                           0;
              return price * item.quantity;
            })();
            
            const imageUrl = (() => {
              // Handle both legacy and Shopify format
              if (product.image) {
                return product.image;
              }
              if ((product as any).images && Array.isArray((product as any).images) && (product as any).images.length > 0) {
                return (product as any).images[0].url;
              }
              if ((product as any).featuredImage?.url) {
                return (product as any).featuredImage.url;
              }
              // Legacy handling for JSON string format
              if (product.images && typeof product.images === 'string') {
                try {
                  const parsed = JSON.parse(product.images);
                  return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
                } catch (e) {
                  return null;
                }
              }
              return '/images/placeholder.jpg';
            })();

            return (
              <div key={item.id} className="p-6 flex items-center space-x-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <Image
                    src={imageUrl}
                    alt={product.name || product.title}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900">
                    {product.name || product.title}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {product.description.substring(0, 100)}...
                    </p>
                  )}
                  <p className="text-lg font-semibold text-purple mt-2">
                    ${(() => {
                      const price = (product as any).price || 
                                   parseFloat((product as any).priceRange?.minVariantPrice?.amount) || 
                                   0;
                      return price.toFixed(2);
                    })()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Stock: {product.stock} available
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={loading}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    disabled={loading || item.quantity >= product.stock}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    ${subtotal.toFixed(2)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* Cart Summary */}
        <div className="bg-gray-50 p-6 border-t">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Total Items: {cart.totalItems}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                Total: ${cart.totalAmount.toFixed(2)}
              </p>
            </div>
            
            <div className="space-x-4">
              <a 
                href="/"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Continue Shopping
              </a>
              <button
                onClick={handleCheckout}
                disabled={cart.items.length === 0}
                className="px-6 py-2 bg-purple text-white rounded-md hover:bg-purple/80 disabled:opacity-50"
              >
                {!user ? 'Login to Checkout' : 'Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

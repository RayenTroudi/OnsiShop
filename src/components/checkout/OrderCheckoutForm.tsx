'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  shippingAddress: string;
}

interface CheckoutFormProps {
  onSubmitSuccess?: (orderId: string) => void;
}

export default function OrderCheckoutForm({ onSubmitSuccess }: CheckoutFormProps) {
  const { user } = useAuth();
  const { cart, clearCart, loading, refreshCart } = useCart();
  const { t } = useTranslation();
  const router = useRouter();
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    shippingAddress: ''
  });
  
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Refresh cart when component mounts to ensure latest data
  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Debug cart state
  useEffect(() => {
    console.log('🛒 Checkout Form Debug:', {
      loading,
      hasCart: !!cart,
      cartItemCount: cart?.items?.length || 0,
      cartItems: cart?.items || []
    });
  }, [cart, loading]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('checkout_full_name_required');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('checkout_email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('checkout_email_invalid');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('checkout_phone_required');
    }

    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = t('checkout_address_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof CheckoutFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!cart || cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Cart is already cleared by the order API
        // Refresh cart to reflect the change in the UI
        await refreshCart();
        
        // Call success callback or redirect
        if (onSubmitSuccess) {
          onSubmitSuccess(result.orderId);
        } else {
          router.push(`/order/${result.orderId}`);
        }
      } else {
        alert(result.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('An error occurred while placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while cart is loading
  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your cart...</p>
      </div>
    );
  }

  // Show empty cart message only after loading is complete
  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600 mb-4">Your cart is empty</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-purple text-white rounded-md hover:bg-purple/80"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-3">
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <span className="font-medium">{item.product.name || item.product.title}</span>
                <span className="text-gray-500 ml-2">× {item.quantity}</span>
              </div>
              <span className="font-semibold">
                ${(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span>${cart.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple/50 ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple/50 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple/50 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your phone number"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Shipping Address</h3>
          
          <div>
            <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Complete Address *
            </label>
            <textarea
              id="shippingAddress"
              name="shippingAddress"
              value={formData.shippingAddress}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple/50 ${
                errors.shippingAddress ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your complete shipping address including street, city, state, and postal code"
            />
            {errors.shippingAddress && <p className="text-red-500 text-sm mt-1">{errors.shippingAddress}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 px-6 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
          >
            Back to Cart
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 px-6 bg-purple text-white rounded-md hover:bg-purple/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>

      {/* Payment Info */}
      <div className="mt-8 p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>Secure Checkout:</strong> Your order will be processed securely. 
          You will receive an email confirmation with order details and tracking information.
        </p>
      </div>
    </div>
  );
}

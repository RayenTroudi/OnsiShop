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
  paymentMethod: string;
  shippingMethod: string;
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
    shippingAddress: '',
    paymentMethod: 'cod',
    shippingMethod: 'standard'
  });

  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
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
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof CheckoutFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      alert(t('cart_empty_error'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
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
        alert(result.error || t('order_place_failed'));
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(t('order_place_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while cart is loading
  if (loading) {
    return (
      <div className="mx-auto mt-8 max-w-md p-6 text-center">
        <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-purple"></div>
        <p className="text-gray-600">Loading your cart...</p>
      </div>
    );
  }

  // Show empty cart message only after loading is complete
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="mx-auto mt-8 max-w-md rounded-lg bg-gray-50 p-6 text-center">
        <p className="mb-4 text-gray-600">Your cart is empty</p>
        <button
          onClick={() => router.push('/')}
          className="rounded-md bg-purple px-6 py-2 text-white hover:bg-purple/80"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-8 text-center text-3xl font-bold">Checkout</h1>

      {/* Order Summary */}
      <div className="mb-8 rounded-lg bg-gray-50 p-6">
        <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
        <div className="space-y-3">
          {(() => {
            try {
              return (
                cart.items?.map((item) => (
                  <div
                    key={item?.id || Math.random()}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <span className="font-medium">
                        {item?.product?.name || item?.product?.title || 'Product Name Unavailable'}
                      </span>
                      <span className="ml-2 text-gray-500">× {item?.quantity || 0}</span>
                    </div>
                    <span className="font-semibold">
                      {((item?.product?.price || 0) * (item?.quantity || 0)).toFixed(2)} DT
                    </span>
                  </div>
                )) || []
              );
            } catch (error) {
              console.error('Error rendering cart items in checkout:', error);
              return (
                <div className="py-4 text-center text-red-500">
                  Error loading cart items. Please try refreshing the page.
                </div>
              );
            }
          })()}
          <div className="mt-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <span>Subtotal:</span>
              <span>{(cart.totalAmount || 0).toFixed(2)} DT</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Shipping:</span>
              <span>{formData.shippingMethod === 'express' ? '15.00' : '0.00'} DT</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t pt-2 text-lg font-bold">
              <span>Total:</span>
              <span>
                {(
                  (cart.totalAmount || 0) + (formData.shippingMethod === 'express' ? 15 : 0)
                ).toFixed(2)}{' '}
                DT
              </span>
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
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple/50 ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple/50 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple/50 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your phone number"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Shipping Address</h3>

          <div>
            <label
              htmlFor="shippingAddress"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Complete Address *
            </label>
            <textarea
              id="shippingAddress"
              name="shippingAddress"
              value={formData.shippingAddress}
              onChange={handleInputChange}
              rows={4}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple/50 ${
                errors.shippingAddress ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your complete shipping address including street, city, state, and postal code"
            />
            {errors.shippingAddress && (
              <p className="mt-1 text-sm text-red-500">{errors.shippingAddress}</p>
            )}
          </div>
        </div>

        {/* Shipping Method */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Shipping Method</h3>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center rounded-md border p-4 hover:bg-gray-50">
              <input
                type="radio"
                name="shippingMethod"
                value="standard"
                checked={formData.shippingMethod === 'standard'}
                onChange={handleInputChange}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium">Standard Shipping - Free</div>
                <div className="text-sm text-gray-500">5-7 business days</div>
              </div>
            </label>
            <label className="flex cursor-pointer items-center rounded-md border p-4 hover:bg-gray-50">
              <input
                type="radio"
                name="shippingMethod"
                value="express"
                checked={formData.shippingMethod === 'express'}
                onChange={handleInputChange}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium">Express Shipping - 15.00 DT</div>
                <div className="text-sm text-gray-500">2-3 business days</div>
              </div>
            </label>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Payment Method</h3>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center rounded-md border p-4 hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={formData.paymentMethod === 'cod'}
                onChange={handleInputChange}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium">💵 Cash on Delivery</div>
                <div className="text-sm text-gray-500">Pay when you receive your order</div>
              </div>
            </label>
            <label className="flex cursor-pointer items-center rounded-md border p-4 hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={formData.paymentMethod === 'card'}
                onChange={handleInputChange}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium">💳 Credit/Debit Card</div>
                <div className="text-sm text-gray-500">Pay securely with your card</div>
              </div>
            </label>
            <label className="flex cursor-pointer items-center rounded-md border p-4 hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="bank_transfer"
                checked={formData.paymentMethod === 'bank_transfer'}
                onChange={handleInputChange}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium">🏦 Bank Transfer</div>
                <div className="text-sm text-gray-500">Transfer payment to our bank account</div>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-md border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Cart
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-md bg-purple px-6 py-3 font-medium text-white hover:bg-purple/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? t('button_placing_order') : t('button_place_order')}
          </button>
        </div>
      </form>

      {/* Payment Info */}
      <div className="mt-8 rounded-lg bg-green-50 p-4">
        <p className="text-sm text-green-800">
          <strong>Secure Checkout:</strong> Your order will be processed securely. You will receive
          an email confirmation with order details and tracking information.
        </p>
      </div>
    </div>
  );
}

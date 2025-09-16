'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get('reservationId');

  useEffect(() => {
    // Clear cart after successful reservation
    const clearCart = async () => {
      try {
        // Trigger a cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    };

    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-green-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Reservation Confirmed!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your reservation has been placed successfully. We will contact you soon to arrange delivery and payment.
        </p>

        {reservationId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Reservation ID:</p>
            <p className="font-mono text-sm font-semibold text-gray-900">
              {reservationId}
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="text-left mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 bg-purple rounded-full mt-2 mr-3"></span>
              We'll review your reservation within 24 hours
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 bg-purple rounded-full mt-2 mr-3"></span>
              You'll receive a confirmation call or email
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 bg-purple rounded-full mt-2 mr-3"></span>
              We'll arrange a convenient delivery time
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 bg-purple rounded-full mt-2 mr-3"></span>
              Payment will be collected upon delivery
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full block px-6 py-3 bg-purple text-white rounded-md hover:bg-purple/80 font-medium text-center"
          >
            Continue Shopping
          </Link>
          
          <Link
            href="/account/reservations"
            className="w-full block px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-center"
          >
            View My Reservations
          </Link>
        </div>

        {/* Contact Information */}
        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-gray-500">
            Need help? Contact us at{' '}
            <a href="mailto:support@example.com" className="text-purple hover:underline">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

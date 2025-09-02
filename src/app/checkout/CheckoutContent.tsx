'use client';

import CheckoutForm from '@/components/checkout/CheckoutForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CheckoutContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      // Redirect to login with return URL
      router.push('/login?redirect=/checkout');
    }
  }, [user, loading, mounted, router]);

  // Show loading state
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple"></div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
            Please log in to continue with your checkout.
          </p>
          <button
            onClick={() => router.push('/login?redirect=/checkout')}
            className="px-6 py-3 bg-purple text-white rounded-md hover:bg-purple/80"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmitSuccess = (reservationId: string) => {
    router.push(`/checkout/success?reservationId=${reservationId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <CheckoutForm onSubmitSuccess={handleSubmitSuccess} />
    </div>
  );
}

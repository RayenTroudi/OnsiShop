'use client';

import dynamic from 'next/dynamic';

// Dynamically import the checkout content to prevent SSR issues
const CheckoutContent = dynamic(() => import('./CheckoutContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple"></div>
    </div>
  )
});

export default function CheckoutPage() {
  return <CheckoutContent />;
}

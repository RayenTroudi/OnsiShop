'use client';

import CartPage from '@/components/cart/CartPage';
import { useEffect, useState } from 'react';

// Prevent static generation since this page uses dynamic cart context
export const dynamic = 'force-dynamic';

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-8 w-48"></div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return <CartPage />;
}

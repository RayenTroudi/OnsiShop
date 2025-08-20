'use client';

import { useEffect, useState } from 'react';
import DatabaseCartIcon from './database-cart-icon';

export default function CartIconWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Show a simple cart icon during SSR/initial load
    return (
      <div className="flex h-full items-center justify-center">
        <div className="relative">
          <img
            src="/images/cart.png"
            alt="Cart"
            width={36}
            height={36}
            className="w-9 h-9"
          />
        </div>
      </div>
    );
  }

  return <DatabaseCartIcon />;
}

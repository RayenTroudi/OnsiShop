'use client';

import CartDrawer from '@/components/cart/CartDrawer';
import { useCart } from '@/contexts/CartContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface CartButtonProps {
  className?: string;
  showText?: boolean;
}

export default function CartButton({ className = '', showText = true }: CartButtonProps) {
  const { cart } = useCart();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleClick = () => {
    setIsOpen(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`relative flex items-center gap-2 rounded-lg px-4 py-2 transition-all hover:bg-gray-100 ${className}`}
      >
        <div className="relative">
          <ShoppingCartIcon className="h-6 w-6" />
          {itemCount > 0 && (
            <span className="bg-purple-600 absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </div>
        {showText && <span className="hidden font-medium md:block">{t('nav_cart')}</span>}
      </button>

      {isOpen && <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
}

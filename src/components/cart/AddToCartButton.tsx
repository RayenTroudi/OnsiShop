'use client';

import { useCart } from '@/contexts/CartContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useState } from 'react';

interface AddToCartButtonProps {
  productId: string;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  variantId?: string;
}

export default function AddToCartButton({ 
  productId, 
  className = '',
  children,
  disabled = false,
  variantId
}: AddToCartButtonProps) {
  const { addToCart, loading } = useCart();
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddToCart = async () => {
    setIsAdding(true);
    setMessage('');
    
    const success = await addToCart(productId, 1, variantId);
    
    if (success) {
      setMessage(t('cart_added_success'));
      setTimeout(() => setMessage(''), 2000);
    }
    
    setIsAdding(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleAddToCart}
        disabled={disabled || loading || isAdding}
        className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isAdding ? t('button_adding') : (children || t('button_add_to_cart'))}
      </button>
      
      {message && (
        <div className="absolute top-full left-0 mt-2 text-sm text-green-600 font-medium">
          {message}
        </div>
      )}
    </div>
  );
}

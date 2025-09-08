'use client';

import { useCart } from '@/contexts/CartContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useState } from 'react';

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  stock?: number;
  disabled?: boolean;
}

export default function AddToCartButton({ 
  productId, 
  productName, 
  stock = 0,
  disabled = false 
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async () => {
    if (isAdding || disabled || stock <= 0) return;

    setIsAdding(true);
    
    try {
      await addToCart(productId, quantity);
      
      // Show success feedback using React state
      setJustAdded(true);
      setTimeout(() => {
        setJustAdded(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(t('product_add_to_cart_error'));
    } finally {
      setIsAdding(false);
    }
  };

  const isOutOfStock = stock <= 0;
  const isDisabled = disabled || isAdding || isOutOfStock;

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center space-x-4">
        <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
          {t('product_quantity')}:
        </label>
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            disabled={quantity <= 1}
          >
            −
          </button>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(stock, parseInt(e.target.value) || 1)))}
            className="w-16 text-center border-none focus:ring-0 focus:outline-none"
            min="1"
            max={stock}
          />
          <button
            type="button"
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            disabled={quantity >= stock}
          >
            +
          </button>
        </div>
        <span className="text-sm text-gray-500">
          {stock > 0 ? `${stock} ${t('product_available')}` : t('product_out_of_stock')}
        </span>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className={`w-full py-4 px-6 rounded-lg font-semibold transition-colors ${
          isOutOfStock
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : isDisabled
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : justAdded
            ? 'bg-green-600 text-white'
            : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {isAdding ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('product_adding_to_cart')}
          </span>
        ) : isOutOfStock ? (
          t('product_out_of_stock')
        ) : justAdded ? (
          `✓ ${t('product_added_to_cart')}`
        ) : (
          t('product_add_to_cart')
        )}
      </button>

      {/* Stock Warning */}
      {stock > 0 && stock <= 5 && (
        <p className="text-sm text-orange-600">
          ⚠️ {t('product_only_left_in_stock').replace('{stock}', stock.toString())}
        </p>
      )}
    </div>
  );
}

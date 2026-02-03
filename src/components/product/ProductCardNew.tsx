'use client';

import { useCart } from '@/contexts/CartContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    handle: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    image?: string;
    images?: string[];
    availableForSale: boolean;
    stock?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);

  const mainImage = product.image || product.images?.[0] || '/placeholder-product.jpg';
  const hasDiscount =
    product.compareAtPrice && product.price && product.compareAtPrice > product.price;
  const discountPercent =
    hasDiscount && product.compareAtPrice && product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.availableForSale) return;

    setIsAdding(true);
    try {
      await addItem(product.id, 1);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
      <Link href={`/product/${product.handle}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={mainImage}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          {hasDiscount && (
            <div className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              -{discountPercent}%
            </div>
          )}

          {!product.availableForSale && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="text-lg font-bold text-white">{t('products_out_of_stock')}</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="group-hover:text-purple-600 mb-2 line-clamp-2 font-semibold text-gray-900 transition-colors">
            {product.title}
          </h3>

          {product.description && (
            <p className="mb-3 line-clamp-2 text-sm text-gray-500">{product.description}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
                {product.price ? product.price.toFixed(2) : '0.00'} DT
              </span>
              {hasDiscount && product.compareAtPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {product.compareAtPrice.toFixed(2)} DT
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.availableForSale || isAdding}
              className="bg-purple-600 hover:bg-purple-700 rounded-full p-2 text-white transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
              title={t('button_add_to_cart')}
            >
              <ShoppingCartIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

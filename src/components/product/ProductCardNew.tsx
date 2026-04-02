'use client';

import { useCart } from '@/contexts/CartContext';
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
  dark?: boolean;
}

const SHEIN_CDN_HOSTS = ['img.ltwebstatic.com', 'img.shein.com', 'shein-us.ltwebstatic.com'];

function resolveImageUrl(url: string | undefined): string {
  if (!url) return '/placeholder-product.jpg';
  try {
    const { hostname } = new URL(url);
    if (SHEIN_CDN_HOSTS.some((h) => hostname.includes(h))) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
  } catch { /* relative or invalid — use as-is */ }
  return url;
}

export default function ProductCard({ product, dark = false }: ProductCardProps) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const mainImage = resolveImageUrl(product.image || product.images?.[0]);
  const hoverImage = resolveImageUrl(product.images?.[1] || product.image || product.images?.[0]);

  const hasDiscount = product.compareAtPrice && product.price && product.compareAtPrice > product.price;
  const discountPct = hasDiscount && product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.availableForSale || adding) return;
    setAdding(true);
    try {
      await addItem(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } finally {
      setAdding(false);
    }
  };

  const textPrimary   = dark ? 'text-cream'    : 'text-ink';
  const textSecondary = dark ? 'text-cream/50'  : 'text-mist';
  const bgCard        = dark ? 'bg-ink-light'   : 'bg-cream';
  const borderCard    = dark ? 'border-white/5' : 'border-border';

  return (
    <div className={`group relative flex flex-col overflow-hidden border ${borderCard} ${bgCard}`}>
      <Link href={`/product/${product.handle}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-stone">
          <Image
            src={mainImage}
            alt={product.title}
            fill
            className="object-cover transition-all duration-700 group-hover:opacity-0"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <Image
            src={hoverImage}
            alt={product.title}
            fill
            className="object-cover opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {hasDiscount && (
              <span className="bg-terracotta px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cream">
                -{discountPct}%
              </span>
            )}
            {!product.availableForSale && (
              <span className="bg-ink/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cream">
                Sold Out
              </span>
            )}
          </div>

          {/* Quick add — slides up on hover */}
          {product.availableForSale && (
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="absolute inset-x-0 bottom-0 translate-y-full bg-ink py-3 text-[10px] font-medium tracking-widest uppercase text-cream transition-transform duration-300 group-hover:translate-y-0 hover:bg-terracotta"
            >
              {added ? '✓ Added' : adding ? '…' : 'Add to Cart'}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className={`mb-1 line-clamp-2 text-sm leading-snug ${textPrimary}`} style={{ fontFamily: 'var(--dm-sans)' }}>
            {product.title}
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${textPrimary}`}>
              {product.price?.toFixed(2)} DT
            </span>
            {hasDiscount && product.compareAtPrice && (
              <span className={`text-xs line-through ${textSecondary}`}>
                {product.compareAtPrice.toFixed(2)} DT
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

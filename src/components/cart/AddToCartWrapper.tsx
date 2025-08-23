'use client';

import { ProductVariant } from '@/lib/shopify/types';
import { Suspense } from 'react';
import { AddToCart } from './add-to-cart';

interface AddToCartWrapperProps {
  variants: ProductVariant[];
  availableForSale: boolean;
}

export default function AddToCartWrapper({ variants, availableForSale }: AddToCartWrapperProps) {
  return (
    <Suspense fallback={
      <button 
        className="relative flex w-full items-center justify-center rounded-full bg-purple p-4 tracking-wide text-white hover:opacity-90"
        disabled
      >
        <div className="absolute left-0 ml-4 h-5 w-5 animate-pulse rounded bg-white/20"></div>
        <span className="animate-pulse">Loading...</span>
      </button>
    }>
      <AddToCart variants={variants} availableForSale={availableForSale} />
    </Suspense>
  );
}

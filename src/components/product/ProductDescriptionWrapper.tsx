'use client';

import { Product } from '@/lib/shopify/types';
import { Suspense } from 'react';
import ProductDescription from './ProductDescription';

interface ProductDescriptionWrapperProps {
  product: Product;
}

export default function ProductDescriptionWrapper({ product }: ProductDescriptionWrapperProps) {
  return (
    <Suspense fallback={
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
          <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    }>
      <ProductDescription product={product} />
    </Suspense>
  );
}

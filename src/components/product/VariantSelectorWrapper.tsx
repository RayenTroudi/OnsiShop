'use client';

import { ProductOption } from '@/lib/shopify/types';
import { Suspense } from 'react';
import { Combination } from './ProductDescription';
import { VariantSelector } from './VariantSelector';

interface VariantSelectorWrapperProps {
  options: ProductOption[];
  combinations: Combination[];
}

export default function VariantSelectorWrapper({ options, combinations }: VariantSelectorWrapperProps) {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        {options.map((option, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2 w-20"></div>
            <div className="flex space-x-2">
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    }>
      <VariantSelector options={options} combinations={combinations} />
    </Suspense>
  );
}

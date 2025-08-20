'use client';

// react
import { useMemo } from 'react';

// components
import DatabaseAddToCart from '../cart/database-add-to-cart';

// types
import { Product } from '@/lib/shopify/types';
import { useSearchParams } from 'next/navigation';
import { VariantSelector } from './VariantSelector';
export type Combination = {
  id: string;
  availableForSale: boolean;
  price: string;
  [key: string]: string | boolean; // ie. { color: 'Red', size: 'Large', ... }
};

const ProductDescription = ({ product }: { product: Product }) => {
  const searchParams = useSearchParams();

  const combinations: Combination[] = useMemo(
    () =>
      product.variants.map((variant) => ({
        id: variant.id,
        availableForSale: variant.availableForSale,
        price: variant.price.amount,
        // Adds key / value pairs for each variant (ie. "color": "Black" and "size": 'M").
        ...variant.selectedOptions.reduce(
          (accumulator, option) => ({ ...accumulator, [option.name.toLowerCase()]: option.value }),
          {}
        )
      })),
    [product.variants]
  );

  // set price of current combination
  const tempSearchParams = new URLSearchParams(searchParams);
  const currentCombinationPrice = combinations.find((comb) => {
    for (const key in comb) {
      if (
        key !== 'id' &&
        key !== 'price' &&
        key !== 'availableForSale' &&
        (!tempSearchParams.get(key) || tempSearchParams.get(key) !== comb[key])
      )
        return false;
    }
    return true;
  })?.price;

  const price = currentCombinationPrice || product.priceRange?.minVariantPrice?.amount || '0';
  return (
    <div className="sticky top-1 flex flex-col items-start justify-start gap-4 px-6 font-lora text-darkPurple">
      <h2 className="hidden text-[clamp(28px,18px_+_2vw,40px)] font-bold leading-[1] md:block">
        {product.title}
      </h2>
      <p className="text-[32px]">
        {Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(Number(price))}
      </p>
      <div className="h-[1px] w-full bg-purple"></div>
      <VariantSelector options={product.options} combinations={combinations} />
      <div>
        <p className="mb-2 text-[26px]">Description</p>
        <div
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml as string }}
          className="font-quicksand text-[18px] text-darkPurple"
        />
      </div>
      <div className="my-2 h-[1px] w-full bg-purple"></div>
      <div className="w-full">
        <DatabaseAddToCart
          productId={product.id}
          availableForSale={product.availableForSale}
          stock={(product as any).stock || 999} // Default high stock for Shopify products
          className="w-full bg-purple text-white py-4 rounded-lg font-quicksand text-[22px] font-semibold hover:bg-darkPurple transition-colors"
        >
          <span>Add To Cart</span>
        </DatabaseAddToCart>
      </div>
    </div>
  );
};

export default ProductDescription;

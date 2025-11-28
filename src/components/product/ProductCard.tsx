'use client';

// next
import Image from 'next/image';

// react
import { useEffect, useMemo, useRef, useState } from 'react';

// framer motion
import { LazyMotion, domAnimation, m } from 'framer-motion';

// clsx
import clsx from 'clsx';

// utils
import { getNumberWithOrdinal } from '@/lib/utils';

// settings
import { colors } from '@/settings/colors';

// types
import DatabaseAddToCart from '@/components/cart/database-add-to-cart';
import { Product } from '@/lib/types';

const ProductCard = ({
  product,
  rank,
  delay = 0,
  duration = 0.5
}: {
  product: Product;
  rank?: number;
  delay?: number;
  duration?: number;
}) => {
  const [activeImage, setActiveImage] = useState('main');
  const [isMounted, setIsMounted] = useState(false);
  const timeoutId = useRef<ReturnType<typeof setTimeout>>();

  // Only render DatabaseAddToCart on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // my old method of getting color and image information
  // get unique color virants with images
  // inspired by: https://stackoverflow.com/a/58429784
  // const colorVariants = useMemo(
  //   () =>
  //     Array.from(
  //       new Map(
  //         product.variants
  //           // filter only variants that have the color key
  //           .filter((variant) => variant.selectedOptions[0]?.name === 'Color')
  //           // extract the needed information from each variant
  //           .map((variant) => ({
  //             name: variant.selectedOptions[0]?.value,
  //             image: variant.image.originalSrc
  //           }))
  //           // convert variants to a map with color name as the key
  //           // so that duplicate keys (colors) get removed
  //           .map((variant) => [variant.name, variant])
  //         // get the values (objects) only
  //       ).values()
  //     ),
  //   [product.variants]
  // );

  // get unique color virants with images
  const colorVariants = useMemo(
    () =>
      product.options
        ?.find((option) => option.name === 'Color')
        ?.values?.map((color) => ({
          name: color,
          image: product.images?.[0]?.url || '/images/placeholder-product.svg' // Use main product image as fallback
        })) || [],
    [product.options, product.images]
  );

  return (
    <LazyMotion features={domAnimation}>
      <m.article
        className="group relative flex w-full flex-col"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ ease: 'easeOut', duration, delay }}
        viewport={{ once: true }}
      >
        <a
          href={'/products/' + product.id}
          className="block"
          onMouseEnter={() => {
            if (product.images?.[1]?.url) {
              setActiveImage('hover');
            }
            clearTimeout(timeoutId.current);
          }}
          onMouseLeave={() => setActiveImage('main')}
        >
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-4 bg-gray-100">
            {rank !== undefined && (
              <div className="absolute left-3 top-3 z-20 flex items-center justify-center px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-lg">
                <span className="text-[14px] font-bold text-veryDarkPurple">
                  {getNumberWithOrdinal(rank)}
                </span>
              </div>
            )}
            
            <Image
              src={product.images?.[0]?.url || '/images/placeholder-product.svg'}
              alt="product image"
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
              className={clsx('object-cover transition-all duration-700 will-change-transform group-hover:scale-105', {
                'opacity-0': activeImage !== 'main',
                'opacity-100': activeImage === 'main'
              })}
            />
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
                className={clsx('object-cover transition-all duration-700 will-change-transform', {
                  'opacity-0': activeImage !== 'hover',
                  'opacity-100': activeImage === 'hover'
                })}
              />
            )}
          </div>
        </a>
        
        <div className="flex flex-col gap-3">
          <a href={'/products/' + product.id} className="block">
            <h3 className="font-quicksand text-[clamp(16px,1.5vw,18px)] font-bold text-darkPurple line-clamp-2 group-hover:text-purple transition-colors duration-300 mb-1">
              {product.title}
            </h3>
          </a>
          
          <div className="flex items-baseline gap-2">
            <p className="font-lora text-[clamp(20px,2vw,24px)] font-bold text-veryDarkPurple">
              {Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(
                Number(product.priceRange?.minVariantPrice?.amount || '0')
              )}
            </p>
          </div>
          
          {colorVariants.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {colorVariants.slice(0, 5).map((variant, i) => (
                <button
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-purple hover:scale-110 transition-all duration-200"
                  style={{ backgroundColor: colors[variant.name as keyof typeof colors] }}
                  onClick={() => setActiveImage(variant.image)}
                  onMouseLeave={() => {
                    timeoutId.current = setTimeout(() => setActiveImage('main'), 2000);
                  }}
                  onMouseEnter={() => clearTimeout(timeoutId.current)}
                  title={variant.name}
                />
              ))}
              {colorVariants.length > 5 && (
                <span className="text-xs text-darkPurple/60">+{colorVariants.length - 5}</span>
              )}
            </div>
          )}
          
          {isMounted && (
            <DatabaseAddToCart
              productId={product.id}
              availableForSale={product.availableForSale}
              stock={typeof (product as any).stock === 'number' ? (product as any).stock : 999}
              className="w-full bg-purple text-white px-4 py-3 rounded-xl font-semibold text-[15px] hover:bg-darkPurple hover:shadow-lg transition-all duration-300"
            >
              <span>Add to Cart</span>
            </DatabaseAddToCart>
          )}
        </div>
      </m.article>
    </LazyMotion>
  );
};

export default ProductCard;

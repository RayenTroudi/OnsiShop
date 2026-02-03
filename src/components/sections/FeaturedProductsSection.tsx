'use client';

import ProductCard from '@/components/product/ProductCardNew';
import { useTranslation } from '@/contexts/TranslationContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Product {
  id: string;
  title: string;
  handle: string;
  description?: string;
  price?: number;
  compareAtPrice?: number;
  image?: string;
  images?: Array<string | { url: string; altText?: string }>;
  featuredImage?: { url: string; altText?: string };
  priceRange?: {
    minVariantPrice?: { amount: string };
  };
  compareAtPriceRange?: {
    minVariantPrice?: { amount: string };
  };
  availableForSale: boolean;
  stock?: number;
}

export default function FeaturedProductsSection() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/list?limit=12');
        const data = await response.json();

        if (data.success && data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-8 h-8 w-64 rounded bg-gray-200"></div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{t('products_featured')}</h2>
            <p className="mt-2 text-gray-600">{t('products_discover_collection')}</p>
          </div>
          <Link
            href="/products"
            className="bg-purple-600 hover:bg-purple-700 hidden items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors sm:flex"
          >
            {t('common_view_all')}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.slice(0, 8).map((product) => {
            // Extract image URLs from the transformed Shopify format
            const imageUrl =
              product.featuredImage?.url || product.images?.[0]?.url || product.images?.[0] || '';
            const imagesArray =
              product.images
                ?.map((img: any) => (typeof img === 'string' ? img : img?.url))
                .filter(Boolean) || [];

            return (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  title: product.title,
                  handle: product.handle,
                  description: product.description,
                  price: parseFloat(
                    product.priceRange?.minVariantPrice?.amount || product.price || 0
                  ),
                  compareAtPrice: product.compareAtPriceRange?.minVariantPrice?.amount
                    ? parseFloat(product.compareAtPriceRange.minVariantPrice.amount)
                    : product.compareAtPrice,
                  image: imageUrl,
                  images: imagesArray,
                  availableForSale: product.availableForSale,
                  stock: product.stock
                }}
              />
            );
          })}
        </div>

        <div className="mt-12 text-center sm:hidden">
          <Link
            href="/products"
            className="bg-purple-600 hover:bg-purple-700 inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white transition-colors"
          >
            {t('common_view_all')}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

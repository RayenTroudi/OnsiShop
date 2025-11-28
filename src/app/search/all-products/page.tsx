'use client';

import ProductCard from '@/components/product/ProductCard';
import { useTranslation } from '@/contexts/TranslationContext';
import { dbService } from '@/lib/appwrite/database';
import { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

export default function AllProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'title'>('newest');
  const isLg = useMediaQuery({ query: '(min-width: 1024px)' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const dbProducts = await dbService.getProducts();
      const transformedProducts = dbProducts.map((product: any) => 
        dbService.transformToShopifyProduct(product)
      );
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.priceRange?.minVariantPrice?.amount || '0') - 
               parseFloat(b.priceRange?.minVariantPrice?.amount || '0');
      case 'price-high':
        return parseFloat(b.priceRange?.minVariantPrice?.amount || '0') - 
               parseFloat(a.priceRange?.minVariantPrice?.amount || '0');
      case 'title':
        return a.title.localeCompare(b.title);
      case 'newest':
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <section className="flex w-full items-center justify-center pb-[48px] pt-[24px] md:pt-[48px]">
        <div className="flex flex-col items-center justify-center gap-[24px] sm:max-w-[95%] md:w-[904px] md:gap-[48px]">
          <div className="h-10 w-64 animate-pulse rounded bg-gray-200"></div>
          <div className="grid w-full grid-cols-2 items-start justify-center gap-x-[4px] gap-y-[16px] xs:gap-x-[16px] md:gap-[32px] lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex w-full items-center justify-center pb-[48px] pt-[24px] md:pt-[48px]">
      <div className="flex flex-col items-center justify-center gap-[24px] sm:max-w-[95%] md:w-[904px] md:gap-[48px]">
        {/* Header */}
        <div className="w-full flex flex-col items-center gap-[16px]">
          <h1 className="w-full text-center font-lora text-[clamp(28px,20px_+_2vw,40px)] font-medium text-veryDarkPurple">
            {t('all_products') || 'All Products'}
          </h1>
          
          {/* Product Count & Sort */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-[12px]">
            <p className="text-[clamp(14px,12px_+_0.5vw,16px)] text-gray-600">
              {products.length} {products.length === 1 ? 'product' : 'products'} available
            </p>
            
            <div className="flex items-center gap-[12px]">
              <label htmlFor="sort" className="text-[clamp(14px,12px_+_0.5vw,16px)] font-medium text-gray-700">
                {t('sort_by') || 'Sort by'}:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-gray-300 bg-white px-[16px] py-[8px] text-[clamp(14px,12px_+_0.5vw,16px)] font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all cursor-pointer"
              >
                <option value="newest">{t('newest_first') || 'Newest First'}</option>
                <option value="price-low">{t('price_low_high') || 'Price: Low to High'}</option>
                <option value="price-high">{t('price_high_low') || 'Price: High to Low'}</option>
                <option value="title">{t('name_a_z') || 'Name: A to Z'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="w-full text-center py-[64px]">
            <div className="flex flex-col items-center gap-[24px]">
              <div className="w-[96px] h-[96px] rounded-full bg-gray-100 flex items-center justify-center">
                <svg 
                  className="w-[48px] h-[48px] text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                  />
                </svg>
              </div>
              <div className="flex flex-col gap-[8px]">
                <h3 className="font-lora text-[clamp(20px,16px_+_1vw,24px)] font-medium text-veryDarkPurple">
                  {t('no_products_found') || 'No products found'}
                </h3>
                <p className="text-[clamp(14px,12px_+_0.5vw,16px)] text-gray-600">
                  {t('no_products_description') || 'Start by adding your first product to the store'}
                </p>
              </div>
              <a
                href="/admin/products/new"
                className="btn text-[clamp(16px,14px_+_0.5vw,18px)] mt-[8px]"
              >
                {t('add_first_product') || 'Add Your First Product'}
              </a>
            </div>
          </div>
        ) : (
          <div className="grid w-full grid-cols-2 items-start justify-center gap-x-[4px] gap-y-[16px] xs:gap-x-[16px] md:gap-[32px] lg:grid-cols-3">
            {sortedProducts.map((product, i) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                delay={(i % (isLg ? 3 : 2)) * 0.25}
              />
            ))}
          </div>
        )}

        {/* Back to Home Button */}
        <a 
          href="/" 
          className="btn text-[clamp(18px,10px_+_2vw,22px)] mt-[24px]"
        >
          {t('back_to_home') || 'Back to Home'}
        </a>
      </div>
    </section>
  );
}

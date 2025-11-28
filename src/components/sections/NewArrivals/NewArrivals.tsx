'use client';

// hooks
import { useEffect, useState } from 'react';

// translation
import { useTranslation } from '@/contexts/TranslationContext';

// server actions
import { getNewArrivalsProducts } from '@/lib/server-actions/products';

// components
import ProductList from './ProductList';

const NewArrivals = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const newProducts = await getNewArrivalsProducts(6);
        setProducts(newProducts);
      } catch (error) {
        console.error('Error loading new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <section className="flex w-full items-center justify-center pb-[48px] pt-[24px] md:pt-[48px]">
        <div className="flex flex-col items-center justify-center gap-[24px] sm:max-w-[95%] md:w-[904px] md:gap-[48px]">
          <div className="h-10 w-64 animate-pulse rounded bg-gray-200"></div>
          <div className="h-64 w-full animate-pulse rounded bg-gray-200"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[14px] uppercase tracking-[0.2em] font-semibold text-purple mb-4">
            {t('section_new_arrivals_eyebrow') || 'Just Landed'}
          </p>
          <h2 className="font-lora text-[clamp(36px,4vw,56px)] font-bold text-veryDarkPurple mb-4">
            {t('section_new_arrivals')}
          </h2>
          <p className="text-[clamp(16px,1.5vw,20px)] text-darkPurple/70 max-w-2xl mx-auto">
            {t('section_new_arrivals_description') || 'Discover the latest additions to our collection'}
          </p>
        </div>
        
        <ProductList products={products} />
        
        <div className="text-center mt-16">
          <a href="/search/all-products" className="inline-block px-10 py-4 bg-purple text-white font-bold text-[18px] rounded-full hover:bg-darkPurple hover:scale-105 transition-all duration-300 shadow-lg">
            {t('button_view_all')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;

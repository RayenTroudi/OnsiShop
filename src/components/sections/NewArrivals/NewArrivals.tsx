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
    <section className="flex w-full items-center justify-center pb-[48px] pt-[24px] md:pt-[48px]">
      <div className="flex flex-col items-center justify-center gap-[24px] sm:max-w-[95%] md:w-[904px] md:gap-[48px]">
        <h2 className="w-full text-center font-lora text-[clamp(28px,20px_+_2vw,40px)] font-medium text-veryDarkPurple md:text-left">
          {t('section_new_arrivals')}
        </h2>
        <ProductList products={products} />
        <a href="/search/all-products" className="btn text-[clamp(18px,10px_+_2vw,22px)]">
          {t('button_view_more')}
        </a>
      </div>
    </section>
  );
};

export default NewArrivals;

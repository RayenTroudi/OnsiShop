'use client';

import ProductCardNew from '@/components/product/ProductCardNew';
import { useTranslation } from '@/contexts/TranslationContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NewArrivals() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=8');
        const data = await response.json();
        if (data.products) {
          setProducts(data.products.slice(0, 8));
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
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 h-8 w-48 animate-pulse rounded bg-gray-200"></div>
            <div className="mx-auto h-6 w-64 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-lg bg-gray-200"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            {t('section_new_arrivals')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            {t('section_new_arrivals_description')}
          </p>
        </div>

        {products.length > 0 ? (
          <>
            <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCardNew key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/products"
                className="bg-purple-600 hover:bg-purple-700 inline-block rounded-lg px-8 py-3 font-semibold text-white transition-colors"
              >
                {t('button_view_all')}
              </Link>
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-500">No products available yet.</p>
            <Link
              href="/admin"
              className="bg-purple-600 hover:bg-purple-700 mt-4 inline-block rounded-lg px-6 py-2 text-white transition-colors"
            >
              Sync Products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

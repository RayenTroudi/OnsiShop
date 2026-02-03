'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Category {
  name: string;
  count: number;
  image?: string;
}

export default function CategoriesSection() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch all products to extract categories from tags
        const response = await fetch('/api/products/list?limit=100');
        const data = await response.json();

        if (data.success && data.products) {
          // Extract unique categories from product tags
          const categoryMap = new Map<string, { count: number; image: string }>();

          data.products.forEach((product: any) => {
            // Use the first image from the product
            const image = product.images?.[0] || '';

            // Get categories from tags (assuming first tag is category)
            if (product.tags && product.tags.length > 0) {
              product.tags.forEach((tag: string) => {
                // Capitalize first letter
                const categoryName = tag.charAt(0).toUpperCase() + tag.slice(1);

                if (categoryMap.has(categoryName)) {
                  categoryMap.get(categoryName)!.count++;
                } else {
                  categoryMap.set(categoryName, { count: 1, image });
                }
              });
            }
          });

          // Convert to array and sort by count
          const categoriesArray = Array.from(categoryMap.entries())
            .map(([name, data]) => ({
              name,
              count: data.count,
              image: data.image
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8); // Show top 8 categories

          setCategories(categoriesArray);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-8 h-8 w-48 rounded bg-gray-200"></div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{t('categories_shop_by')}</h2>
          <Link
            href="/products"
            className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
          >
            {t('common_view_all')} →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/products?search=${encodeURIComponent(category.name.toLowerCase())}`}
              className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="relative aspect-square bg-gray-100">
                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                <h3 className="truncate text-sm font-semibold text-white">{category.name}</h3>
                <p className="mt-1 text-xs text-white/80">
                  {category.count} {category.count === 1 ? 'item' : 'items'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

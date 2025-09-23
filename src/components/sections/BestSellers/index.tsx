'use client';

// react
import { useEffect, useState } from 'react';

// clsx
import clsx from 'clsx';

// translation
import { useTranslation } from '@/contexts/TranslationContext';

// components
import Slider from './Slider';

interface Category {
  id: string;
  name: string;
  handle: string;
}

const BestSellers = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCollection, setActiveCollection] = useState<string>('');

  useEffect(() => {
    // Fetch categories from the database
    const fetchCategories = async () => {
      try {
        // Use public categories API endpoint
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          if (data.length > 0) {
            setActiveCollection(data[0].handle);
          }
        } else {
          // Fallback to hardcoded categories if API fails
          const fallbackCategories = [
            { id: '1', name: 'Clothing', handle: 'clothing' },
            { id: '2', name: 'Bags', handle: 'bags' },
            { id: '3', name: 'Shoes', handle: 'shoes' },
            { id: '4', name: 'Accessories', handle: 'accessories' }
          ];
          setCategories(fallbackCategories);
          setActiveCollection('clothing');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to hardcoded categories
        const fallbackCategories = [
          { id: '1', name: 'Clothing', handle: 'clothing' },
          { id: '2', name: 'Bags', handle: 'bags' },
          { id: '3', name: 'Shoes', handle: 'shoes' },
          { id: '4', name: 'Accessories', handle: 'accessories' }
        ];
        setCategories(fallbackCategories);
        setActiveCollection('clothing');
      }
    };

    fetchCategories();
  }, []);

  if (categories.length === 0) {
    return null; // Don't render if no categories
  }

  return (
    <section className="flex w-full flex-col items-center justify-center gap-[24px] pb-[32px] pt-[24px] md:gap-[48px] md:pb-[64px] md:pt-[48px]">
      <div className="flex w-full max-w-[95%] flex-col items-center justify-center gap-2 font-lora font-medium text-veryDarkPurple md:w-[904px] md:flex-row md:justify-between md:gap-0">
        <h2 className="text-[clamp(28px,20px_+_2vw,40px)]">{t('section_best_sellers')}</h2>
        <div className="flex gap-4 text-[clamp(20px,10px_+_2vw,26px)] md:gap-8">
          {categories.map((category) => (
            <button
              key={category.id}
              className={clsx(
                'relative cursor-pointer leading-[2] transition-all duration-300 first-letter:uppercase before:absolute before:bottom-0 before:left-1/2 before:h-[4px] before:-translate-x-1/2 before:bg-purple before:transition-all before:duration-300 hover:text-purple hover:before:w-full hover:before:opacity-100',
                {
                  'before:w-full before:opacity-100': category.handle === activeCollection,
                  'before:w-0 before:opacity-0': category.handle !== activeCollection
                }
              )}
              onClick={() => setActiveCollection(category.handle)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      <div className="relative max-w-full md:w-[904px]">
        <Slider collection={activeCollection} />
      </div>
    </section>
  );
};

export default BestSellers;

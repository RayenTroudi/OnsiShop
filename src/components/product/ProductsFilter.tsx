'use client';

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
  handle: string;
  _count?: {
    products: number;
  };
}

interface ProductsFilterProps {
  currentCategory?: string;
  currentSort?: string;
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function ProductsFilter({ currentCategory = '', currentSort = 'newest' }: ProductsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isSortOpen, setIsSortOpen] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 when changing filters
    params.delete('page');
    
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/products');
  };

  const hasActiveFilters = currentCategory || (searchParams.get('search'));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div className="mb-6">
        <button
          onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
          className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900 mb-3"
        >
          Categories
          {isCategoriesOpen ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </button>
        
        {isCategoriesOpen && (
          <div className="space-y-2">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-4 rounded"></div>
                ))}
              </div>
            ) : (
              <>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={!currentCategory}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 border-2 rounded-full mr-3 flex items-center justify-center ${
                    !currentCategory ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {!currentCategory && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className={`text-sm ${!currentCategory ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                    All Categories
                  </span>
                </label>

                {categories.map((category) => (
                  <label key={category.id} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={category.handle}
                      checked={currentCategory === category.handle}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 rounded-full mr-3 flex items-center justify-center ${
                      currentCategory === category.handle ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {currentCategory === category.handle && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className={`text-sm ${
                      currentCategory === category.handle ? 'font-medium text-gray-900' : 'text-gray-600'
                    }`}>
                      {category.name}
                      {category._count?.products && (
                        <span className="text-gray-400 ml-1">({category._count.products})</span>
                      )}
                    </span>
                  </label>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Sort Filter */}
      <div>
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900 mb-3"
        >
          Sort By
          {isSortOpen ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </button>
        
        {isSortOpen && (
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={currentSort === option.value}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 border-2 rounded-full mr-3 flex items-center justify-center ${
                  currentSort === option.value ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {currentSort === option.value && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <span className={`text-sm ${
                  currentSort === option.value ? 'font-medium text-gray-900' : 'text-gray-600'
                }`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

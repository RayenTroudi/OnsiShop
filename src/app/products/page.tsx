'use client';

import Loading from '@/components/common/Loading';
import ProductsFilter from '@/components/product/ProductsFilter';
import ProductsGrid from '@/components/product/ProductsGrid';
import { useAuth } from '@/contexts/AuthContext';
import { Suspense, useEffect } from 'react';

interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
    sort?: string;
    page?: string;
  };
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const { user, loading } = useAuth();
  const category = searchParams.category || '';
  const search = searchParams.search || '';
  const sort = searchParams.sort || 'newest';
  const page = parseInt(searchParams.page || '1');

  // Set document title
  useEffect(() => {
    document.title = 'All Products - ONSI Store';
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
              <p className="mt-2 text-gray-600">
                Discover our complete collection of premium clothing and accessories
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block">
            <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-gray-200"></div>}>
              <ProductsFilter currentCategory={category} currentSort={sort} />
            </Suspense>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <Suspense fallback={<Loading />}>
              <ProductsGrid category={category} search={search} sort={sort} page={page} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

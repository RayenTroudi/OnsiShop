import Loading from '@/components/common/Loading';
import ProductsFilter from '@/components/product/ProductsFilter';
import ProductsGrid from '@/components/product/ProductsGrid';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'All Products - ONSI Store',
  description: 'Browse our complete collection of clothing and accessories',
  openGraph: {
    title: 'All Products - ONSI Store',
    description: 'Browse our complete collection of clothing and accessories',
    type: 'website',
  },
};

interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
    sort?: string;
    page?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const category = searchParams.category || '';
  const search = searchParams.search || '';
  const sort = searchParams.sort || 'newest';
  const page = parseInt(searchParams.page || '1');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
              <p className="mt-2 text-gray-600">
                Discover our complete collection of premium clothing and accessories
              </p>
            </div>
            <Link
              href="/products/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block">
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>}>
              <ProductsFilter
                currentCategory={category}
                currentSort={sort}
              />
            </Suspense>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <Suspense fallback={<Loading />}>
              <ProductsGrid
                category={category}
                search={search}
                sort={sort}
                page={page}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

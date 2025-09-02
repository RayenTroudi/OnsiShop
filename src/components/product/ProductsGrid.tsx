'use client';

import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  title: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  handle: string;
  category?: {
    name: string;
  };
  _count?: {
    ratings: number;
  };
  avgRating?: number;
}

interface ProductsGridProps {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
}

interface ProductsResponse {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

const PRODUCTS_PER_PAGE = 12;

export default function ProductsGrid({ category = '', search = '', sort = 'newest', page = 1 }: ProductsGridProps) {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (search) params.append('search', search);
        if (sort) params.append('sort', sort);
        params.append('page', page.toString());
        params.append('limit', PRODUCTS_PER_PAGE.toString());

        const response = await fetch(`/api/products/list?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const result = await response.json();
        
        // Debug logging
        console.log('API response:', result);
        
        // Ensure products is an array
        if (!result.products || !Array.isArray(result.products)) {
          console.error('Invalid products data:', result);
          throw new Error('Invalid response format - products is not an array');
        }
        
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, search, sort, page]);

  const renderStars = (rating: number, count: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <StarOutlineIcon className="w-4 h-4 text-gray-300 absolute" />
            <div className="overflow-hidden w-1/2">
              <StarIcon className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <StarOutlineIcon key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }

    return (
      <div className="flex items-center space-x-1">
        <div className="flex">{stars}</div>
        <span className="text-sm text-gray-600">({count})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data || !data.products || !Array.isArray(data.products) || data.products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No products found.</p>
        {(category || search) && (
          <Link 
            href="/products"
            className="mt-4 inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            View All Products
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          Showing {((page - 1) * PRODUCTS_PER_PAGE) + 1}-{Math.min(page * PRODUCTS_PER_PAGE, data.totalCount)} of {data.totalCount} products
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {data.products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group cursor-pointer"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <Image
                  src={product.image || '/images/placeholder-product.svg'}
                  alt={product.name || product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                    SALE
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {product.name || product.title}
                </h3>
                
                {product.category && (
                  <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
                )}

                {product.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Rating */}
                {product.avgRating && product._count?.ratings && (
                  <div className="mb-3">
                    {renderStars(product.avgRating, product._count.ratings)}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          {page > 1 && (
            <Link
              href={`/products?${new URLSearchParams({ 
                ...(category && { category }), 
                ...(search && { search }), 
                ...(sort && { sort }), 
                page: (page - 1).toString() 
              }).toString()}`}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Previous
            </Link>
          )}
          
          <span className="text-gray-600">
            Page {page} of {data.totalPages}
          </span>
          
          {page < data.totalPages && (
            <Link
              href={`/products?${new URLSearchParams({ 
                ...(category && { category }), 
                ...(search && { search }), 
                ...(sort && { sort }), 
                page: (page + 1).toString() 
              }).toString()}`}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

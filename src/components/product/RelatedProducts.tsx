'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  title: string;
  handle: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  avgRating?: number;
  ratingCount?: number;
}

interface RelatedProductsProps {
  currentProductId: string;
  productTags: string[];
}

export default function RelatedProducts({ currentProductId, productTags }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [customersAlsoViewed, setCustomersAlsoViewed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        // Fetch products from the same category/tags
        const relatedResponse = await fetch(
          `/api/products/related?productId=${currentProductId}&tags=${productTags.join(',')}&limit=8`
        );
        
        // Fetch customers also viewed (random selection for demo)
        const alsoViewedResponse = await fetch(
          `/api/products/list?limit=8&sort=newest&exclude=${currentProductId}`
        );

        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedProducts(relatedData.products || []);
        }

        if (alsoViewedResponse.ok) {
          const alsoViewedData = await alsoViewedResponse.json();
          setCustomersAlsoViewed(alsoViewedData.products || []);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, productTags]);

  const renderStars = (rating: number, count: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-yellow-400" />);
      } else {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-gray-300" />);
      }
    }

    return (
      <div className="flex items-center space-x-1">
        <div className="flex">{stars}</div>
        <span className="text-sm text-gray-600">({count})</span>
      </div>
    );
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Link
      href={`/products/${product.id}`}
      className="group cursor-pointer block min-w-0 flex-shrink-0"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          <Image
            src={product.image || '/images/placeholder-product.svg'}
            alt={product.name || product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          />
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
              SALE
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">
            {product.name || product.title}
          </h3>
          {product.avgRating && product.ratingCount && (
            <div className="mb-2">
              {renderStars(product.avgRating, product.ratingCount)}
            </div>
          )}
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
  );

  const ProductCarousel = ({ 
    products, 
    title, 
    currentSlide, 
    setCurrentSlide 
  }: { 
    products: Product[]; 
    title: string;
    currentSlide: number;
    setCurrentSlide: (slide: number) => void;
  }) => {
    const itemsPerView = 4;
    const maxSlide = Math.max(0, products.length - itemsPerView);

    const nextSlide = () => {
      setCurrentSlide(Math.min(currentSlide + 1, maxSlide));
    };

    const prevSlide = () => {
      setCurrentSlide(Math.max(currentSlide - 1, 0));
    };

    if (products.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          {products.length > itemsPerView && (
            <div className="flex space-x-2">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentSlide >= maxSlide}
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ 
              transform: `translateX(-${currentSlide * (100 / itemsPerView)}%)`,
              width: `${(products.length / itemsPerView) * 100}%`
            }}
          >
            {products.map((product) => (
              <div key={product.id} className="px-2" style={{ width: `${100 / products.length}%` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-200 aspect-square rounded-lg"></div>
            ))}
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-200 aspect-square rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Related Products */}
      <ProductCarousel
        products={relatedProducts}
        title="Related Products"
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
      />

      {/* Customers Also Viewed */}
      <ProductCarousel
        products={customersAlsoViewed}
        title="Customers Also Viewed"
        currentSlide={0}
        setCurrentSlide={() => {}}
      />
    </div>
  );
}

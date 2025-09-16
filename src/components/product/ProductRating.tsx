'use client';

import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

interface RatingData {
  totalRatings: number;
  averageRating: number;
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface ProductRatingProps {
  productId: string;
}

export default function ProductRating({ productId }: ProductRatingProps) {
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatingData = async () => {
      try {
        const response = await fetch(`/api/products/${productId}/ratings`);
        if (response.ok) {
          const data = await response.json();
          setRatingData({
            totalRatings: data.totalRatings,
            averageRating: data.averageRating,
            ratingBreakdown: data.ratingBreakdown,
          });
        }
      } catch (error) {
        console.error('Error fetching rating data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatingData();
  }, [productId]);

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIcon key={i} className={`${sizeClasses[size]} text-yellow-400`} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className={`relative ${sizeClasses[size]}`}>
            <StarOutlineIcon className={`${sizeClasses[size]} text-gray-300 absolute`} />
            <div className="overflow-hidden w-1/2">
              <StarIcon className={`${sizeClasses[size]} text-yellow-400`} />
            </div>
          </div>
        );
      } else {
        stars.push(
          <StarOutlineIcon key={i} className={`${sizeClasses[size]} text-gray-300`} />
        );
      }
    }

    return <div className="flex">{stars}</div>;
  };

  const renderRatingBar = (starCount: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <div className="flex items-center space-x-2 text-sm">
        <span className="w-8 text-right">{starCount}★</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="w-8 text-left text-gray-600">{count}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!ratingData || ratingData.totalRatings === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h3>
        <div className="text-center py-8">
          <div className="flex justify-center mb-2">
            {renderStars(0, 'lg')}
          </div>
          <p className="text-gray-600">No reviews yet</p>
          <p className="text-sm text-gray-500 mt-1">Be the first to review this product!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            {renderStars(ratingData.averageRating, 'lg')}
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {ratingData.averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">
            Based on {ratingData.totalRatings} review{ratingData.totalRatings !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((starCount) => 
            renderRatingBar(starCount, ratingData.ratingBreakdown[starCount as keyof typeof ratingData.ratingBreakdown], ratingData.totalRatings)
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Found this helpful? Check out all reviews below
          </span>
          <button
            onClick={() => {
              const reviewsSection = document.getElementById('product-reviews');
              if (reviewsSection) {
                reviewsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
          >
            See all reviews
          </button>
        </div>
      </div>
    </div>
  );
}

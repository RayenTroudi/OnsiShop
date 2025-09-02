'use client';

import { CheckIcon, PlusIcon, StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface Rating {
  id: string;
  stars: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface ReviewData {
  comments: Comment[];
  ratings: Rating[];
  userRating?: Rating;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviewData, setReviewData] = useState<ReviewData>({ comments: [], ratings: [] });
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        const [commentsResponse, ratingsResponse] = await Promise.all([
          fetch(`/api/products/${productId}/comments`),
          fetch(`/api/products/${productId}/ratings`)
        ]);

        const [comments, ratingsData] = await Promise.all([
          commentsResponse.json(),
          ratingsResponse.json()
        ]);

        setReviewData({
          comments: comments || [],
          ratings: ratingsData.ratings || [],
          userRating: ratingsData.ratings?.find((r: Rating) => r.user.id === 'current-user'), // TODO: Get actual current user
        });
      } catch (error) {
        console.error('Error fetching review data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        setIsAuthenticated(response.ok);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    fetchReviewData();
    checkAuth();
  }, [productId]);

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const Icon = i <= rating ? StarIcon : StarOutlineIcon;
      stars.push(
        <button
          key={i}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          onClick={() => interactive && onStarClick && onStarClick(i)}
          className={`w-5 h-5 ${
            interactive 
              ? 'cursor-pointer hover:scale-110 transition-transform' 
              : 'cursor-default'
          } ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          <Icon className="w-full h-full" />
        </button>
      );
    }

    return <div className="flex space-x-1">{stars}</div>;
  };

  const handleSubmitReview = async () => {
    if (!newComment.trim() || newRating === 0) {
      alert('Please provide both a rating and a comment');
      return;
    }

    setSubmitting(true);
    try {
      // Submit rating
      const ratingResponse = await fetch(`/api/products/${productId}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stars: newRating }),
      });

      // Submit comment
      const commentResponse = await fetch(`/api/products/${productId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (ratingResponse.ok && commentResponse.ok) {
        // Refresh the data
        window.location.reload(); // Simple refresh, could be optimized
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Combine comments and ratings by user
  const combinedReviews = reviewData.comments.map(comment => {
    const userRating = reviewData.ratings.find(r => r.user.id === comment.user.id);
    return {
      ...comment,
      rating: userRating?.stars || null,
    };
  });

  if (loading) {
    return (
      <div id="product-reviews" className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="product-reviews">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
        {isAuthenticated && (
          <button
            onClick={() => setShowAddReview(!showAddReview)}
            className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {showAddReview ? (
              <CheckIcon className="w-5 h-5" />
            ) : (
              <PlusIcon className="w-5 h-5" />
            )}
            <span>{showAddReview ? 'Cancel' : 'Write a Review'}</span>
          </button>
        )}
      </div>

      {/* Add Review Form */}
      {showAddReview && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Write Your Review</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            {renderStars(newRating, true, setNewRating)}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              placeholder="Share your thoughts about this product..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSubmitReview}
              disabled={submitting || !newComment.trim() || newRating === 0}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              onClick={() => setShowAddReview(false)}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {combinedReviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">No reviews yet</p>
          <p className="text-sm text-gray-500">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {combinedReviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                    {review.rating && renderStars(review.rating)}
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Authentication prompt */}
      {!isAuthenticated && (
        <div className="mt-8 text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-3">Want to share your experience?</p>
          <a
            href="/login"
            className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign in to write a review
          </a>
        </div>
      )}
    </div>
  );
}

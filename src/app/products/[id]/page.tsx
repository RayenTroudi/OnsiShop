import BuyNowButton from '@/components/cart/BuyNowButton';
import DatabaseAddToCart from '@/components/cart/database-add-to-cart';
import DeleteProductButton from '@/components/product/DeleteProductButton';
import ProductRating from '@/components/product/ProductRating';
import ProductReviews from '@/components/product/ProductReviews';
import RelatedProducts from '@/components/product/RelatedProducts';
import { prisma } from '@/lib/database';
import jwt from 'jsonwebtoken';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

// Types
interface Product {
  id: string;
  name: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    handle: string;
  };
  avgRating?: number;
  _count: {
    ratings: number;
    comments: number;
  };
  comments: Array<{
    id: string;
    text: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
    };
  }>;
}

// Check if current user is admin
async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return false;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    return user?.role === 'admin';
  } catch (error) {
    return false;
  }
}

// Fetch product data
async function getProduct(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products/${id}`, {
      cache: 'no-store', // Always fetch fresh data
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function generateMetadata({
  params
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }

  const price = (product as any).price || 
               parseFloat((product as any).priceRange?.minVariantPrice?.amount) || 
               0;

  // Get the correct image URL
  const imageUrl = (() => {
    if (product.image) {
      return product.image;
    }
    if ((product as any).images && Array.isArray((product as any).images) && (product as any).images.length > 0) {
      return (product as any).images[0].url;
    }
    if ((product as any).featuredImage?.url) {
      return (product as any).featuredImage.url;
    }
    return null;
  })();

  return {
    title: `${product.name} - ONSI Store`,
    description: product.description || `Buy ${product.name} at ONSI Store for $${price.toFixed(2)}`,
    openGraph: {
      title: `${product.name} - ONSI Store`,
      description: product.description || `Buy ${product.name} at ONSI Store for $${price.toFixed(2)}`,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  const isAdmin = await isCurrentUserAdmin();

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <div className="space-x-4">
              <Link
                href="/products"
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Browse All Products
              </Link>
              <Link
                href="/"
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: (() => {
      // Handle both legacy and Shopify format
      if (product.image) {
        return product.image;
      }
      if ((product as any).images && Array.isArray((product as any).images) && (product as any).images.length > 0) {
        return (product as any).images[0].url;
      }
      if ((product as any).featuredImage?.url) {
        return (product as any).featuredImage.url;
      }
      return null;
    })(),
    offers: {
      '@type': 'Offer',
      price: (product as any).price || 
             parseFloat((product as any).priceRange?.minVariantPrice?.amount) || 
             0,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: product.avgRating ? {
      '@type': 'AggregateRating',
      ratingValue: product.avgRating,
      reviewCount: (product as any)._count?.ratings || 0,
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd)
        }}
      />
      
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <Link href="/products" className="text-gray-500 hover:text-gray-700">
                Products
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={(() => {
                  // Handle both legacy and Shopify format
                  if (product.image) {
                    return product.image;
                  }
                  if ((product as any).images && Array.isArray((product as any).images) && (product as any).images.length > 0) {
                    return (product as any).images[0].url;
                  }
                  if ((product as any).featuredImage?.url) {
                    return (product as any).featuredImage.url;
                  }
                  return '/images/placeholder-product.svg';
                })()}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.title || product.name}
                </h1>
                {product.category && (
                  <p className="text-lg text-gray-600 mb-4">
                    Category: {product.category.name}
                  </p>
                )}
                <div className="text-3xl font-bold text-gray-900 mb-4">
                  ${(() => {
                    const price = (product as any).price || 
                                 parseFloat((product as any).priceRange?.minVariantPrice?.amount) || 
                                 0;
                    return price.toFixed(2);
                  })()}
                </div>
              </div>

              {/* Rating */}
              <Suspense fallback={<div className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>}>
                <ProductRating productId={product.id} />
              </Suspense>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <Suspense fallback={
                  <div className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
                }>
                  <div className="flex space-x-3">
                    <DatabaseAddToCart 
                      productId={product.id} 
                      availableForSale={(() => {
                        const stock = (product as any).stock;
                        const availableForSale = (product as any).availableForSale;
                        return typeof stock === 'number' ? stock > 0 : (availableForSale !== false);
                      })()}
                      stock={(product as any).stock || 1}
                      className="flex-1 bg-purple text-white py-3 px-6 rounded-lg hover:bg-darkPurple transition-colors font-semibold text-center"
                    >
                      Add to Cart
                    </DatabaseAddToCart>
                    <BuyNowButton
                      productId={product.id}
                      availableForSale={(() => {
                        const stock = (product as any).stock;
                        const availableForSale = (product as any).availableForSale;
                        return typeof stock === 'number' ? stock > 0 : (availableForSale !== false);
                      })()}
                      stock={(product as any).stock || 1}
                      className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors font-semibold text-center"
                    >
                      Buy Now
                    </BuyNowButton>
                  </div>
                </Suspense>
                
                {/* Admin-only buttons */}
                {isAdmin && (
                  <div className="flex space-x-4">
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
                    >
                      Edit Product
                    </Link>
                    
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                <dl className="space-y-3">
                  <div className="flex">
                    <dt className="w-1/3 text-gray-600">Stock:</dt>
                    <dd className="w-2/3 text-gray-900">
                      {(() => {
                        // Handle both legacy and Shopify format
                        const stock = (product as any).stock;
                        const availableForSale = (product as any).availableForSale;
                        
                        if (typeof stock === 'number') {
                          return stock > 0 ? (
                            <span className="text-green-600">{stock} available</span>
                          ) : (
                            <span className="text-red-600">Out of stock</span>
                          );
                        } else if (typeof availableForSale === 'boolean') {
                          return availableForSale ? (
                            <span className="text-green-600">In stock</span>
                          ) : (
                            <span className="text-red-600">Out of stock</span>
                          );
                        } else {
                          return <span className="text-gray-500">Stock status unknown</span>;
                        }
                      })()}
                    </dd>
                  </div>
                  <div className="flex">
                    <dt className="w-1/3 text-gray-600">Created:</dt>
                    <dd className="w-2/3 text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="flex">
                    <dt className="w-1/3 text-gray-600">Last Updated:</dt>
                    <dd className="w-2/3 text-gray-900">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>}>
              <ProductReviews productId={product.id} />
            </Suspense>
          </div>
        </section>

        {/* Related Products Section */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
              <RelatedProducts 
                currentProductId={product.id} 
                productTags={[]} 
              />
            </Suspense>
          </div>
        </section>
      </div>
    </>
  );
}

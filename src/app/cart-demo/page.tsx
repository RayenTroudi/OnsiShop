'use client';

import AddToCartButton from '@/components/cart/AddToCartButton';
import CartLayout from '@/components/cart/CartLayout';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Prevent static generation since this page uses dynamic cart context
export const dynamic = 'force-dynamic';

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  images?: string;
  name?: string;
  stock?: number;
}

export default function CartDemoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Demo user ID (in real app, get from auth)
  const demoUserId = 'demo-user-123';

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products?limit=6');
        if (response.ok) {
          const data = await response.json();
          setProducts(Array.isArray(data) ? data : data.products || []);
        } else {
          console.error('Failed to fetch products');
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <CartLayout userId={demoUserId}>
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-8 w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CartLayout>
    );
  }

  return (
    <CartLayout userId={demoUserId}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Cart System Demo</h1>
          <Link 
            href="/cart"
            className="bg-purple text-white px-4 py-2 rounded hover:bg-purple/80"
          >
            View Cart
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const productData = product as any;
            const imageUrl = (() => {
              // Handle both legacy and Shopify format
              if (productData.image) {
                return productData.image;
              }
              if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
                return productData.images[0].url;
              }
              if (productData.featuredImage?.url) {
                return productData.featuredImage.url;
              }
              // Legacy handling for JSON string format
              if (product.images && typeof product.images === 'string') {
                try {
                  const parsed = JSON.parse(product.images);
                  return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
                } catch (e) {
                  return null;
                }
              }
              return '/images/placeholder.jpg';
            })();

            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={productData.name || product.title}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {productData.name || product.title}
                  </h3>
                  
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-purple">
                      ${(() => {
                        const price = (product as any).price || 
                                     parseFloat((product as any).priceRange?.minVariantPrice?.amount) || 
                                     0;
                        return price.toFixed(2);
                      })()}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {productData.stock || 0}
                    </span>
                  </div>
                  
                  <AddToCartButton
                    productId={product.id}
                    disabled={!productData.stock || productData.stock === 0}
                    className="w-full bg-purple text-white py-2 px-4 rounded hover:bg-purple/80 disabled:bg-gray-300"
                  >
                    {productData.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </AddToCartButton>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Available API Endpoints:</h2>
          <ul className="space-y-2 text-sm">
            <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/cart</code> - Create cart</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/cart/add</code> - Add item to cart</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">PUT /api/cart/update</code> - Update item quantity</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">DELETE /api/cart/remove/[itemId]</code> - Remove item</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/cart/[userId]</code> - Get cart</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/cart/checkout</code> - Checkout</li>
          </ul>
        </div>
      </div>
    </CartLayout>
  );
}

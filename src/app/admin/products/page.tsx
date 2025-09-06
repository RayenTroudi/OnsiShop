'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Product {
  id: string;
  title: string;
  handle: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  availableForSale: boolean;
  images?: string;
  category?: {
    id: string;
    name: string;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/admin/products?id=${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setProducts(products.filter(p => p.id !== id));
        } else {
          alert('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all products in your store including their name, category, price, and status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add product
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {filteredProducts.length === 0 ? (
                <div className="bg-white px-4 py-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
                  <div className="mt-6">
                    <Link
                      href="/admin/products/new"
                      className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Product
                    </Link>
                  </div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {(() => {
                                // Check for Shopify format first
                                if ((product as any).images && Array.isArray((product as any).images) && (product as any).images.length > 0) {
                                  const firstImage = (product as any).images[0].url;
                                  if (firstImage) {
                                    return (
                                      <img
                                        className="h-10 w-10 rounded-lg object-cover"
                                        src={firstImage}
                                        alt={product.title}
                                        onError={(e) => {
                                          console.error('❌ Image load error for product:', product.id);
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    );
                                  }
                                }

                                // Check for featuredImage
                                if ((product as any).featuredImage?.url) {
                                  return (
                                    <img
                                      className="h-10 w-10 rounded-lg object-cover"
                                      src={(product as any).featuredImage.url}
                                      alt={product.title}
                                      onError={(e) => {
                                        console.error('❌ Image load error for product:', product.id);
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  );
                                }

                                // Legacy format handling
                                if (product.images) {
                                  try {
                                    let parsed = JSON.parse(product.images);
                                    
                                    // Handle double-encoded JSON arrays
                                    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string' && parsed[0].startsWith('[')) {
                                      try {
                                        parsed = JSON.parse(parsed[0]);
                                      } catch (e) {
                                        // If parsing fails, use the original
                                      }
                                    }
                                    
                                    const firstImage = Array.isArray(parsed) ? parsed[0] : parsed;
                                    const isValidUrl = firstImage && 
                                                     typeof firstImage === 'string' && 
                                                     (firstImage.startsWith('data:') || firstImage.startsWith('http') || firstImage.startsWith('/')) &&
                                                     !firstImage.includes('[') && 
                                                     !firstImage.includes(']') &&
                                                     firstImage.trim() !== '';
                                    
                                    console.log('🖼️ Product image check:', product.id, 'Image type:', Array.isArray(parsed) ? 'array' : typeof parsed, 'First image valid:', isValidUrl);
                                    
                                    if (isValidUrl) {
                                      return (
                                        <img
                                          className="h-10 w-10 rounded-lg object-cover"
                                          src={firstImage}
                                          alt={product.title}
                                          onError={(e) => {
                                            console.error('❌ Image load error for product:', product.id);
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      );
                                    }
                                  } catch (e) {
                                    console.error('❌ Error parsing product images for product:', product.id, e);
                                  }
                                }

                                // Fallback placeholder
                                return (
                                  <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.title}</div>
                              <div className="text-sm text-gray-500">{product.handle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {product.category?.name || 'No Category'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          ${(() => {
                            const price = (product as any).price || 
                                         parseFloat((product as any).priceRange?.minVariantPrice?.amount) || 
                                         0;
                            return price.toFixed(2);
                          })()}
                          {(() => {
                            const comparePrice = (product as any).compareAtPrice || 
                                                parseFloat((product as any).compareAtPriceRange?.minVariantPrice?.amount) || 
                                                0;
                            return comparePrice && (
                              <span className="ml-2 text-xs text-gray-500 line-through">
                                ${comparePrice.toFixed(2)}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.availableForSale 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.availableForSale ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

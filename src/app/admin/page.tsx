'use client';

export const dynamic = 'force-dynamic';

import { useTranslation } from '@/contexts/TranslationContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [contentCount, setContentCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load data using API routes instead of direct DB calls
        const productsResponse = await fetch('/api/admin/products');

        if (!productsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const productsData = await productsResponse.json();

        setProducts(productsData);

        // Fetch content count
        fetchContentCount();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadData();

    setIsLoaded(true);
  }, []);

  const fetchContentCount = async () => {
    try {
      const response = await fetch('/api/content');
      const result = await response.json();
      if (result.success && result.items) {
        setContentCount(result.items.length);
      }
    } catch (error) {
      console.error('Error fetching content count:', error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-600">{t('common_loading')}</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Dashboard Stats */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-500">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    {t('admin_total_products')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{products.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-purple-500 flex h-8 w-8 items-center justify-center rounded-md">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    {t('admin_content_items')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{contentCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-yellow-500">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    {t('admin_available_products')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {products.filter((p) => p.availableForSale).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">
            {t('admin_quick_actions')}
          </h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/admin/ingest-products', { method: 'POST' });
                  const result = await response.json();
                  alert(
                    `Ingestion complete: ${result.imported} imported, ${result.updated} updated`
                  );
                  window.location.reload();
                } catch (error) {
                  alert('Ingestion failed');
                }
              }}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Sync Products
            </button>
            <Link
              href="/admin/content"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              {t('admin_manage_content')}
            </Link>
            <Link
              href="/admin/products"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              {t('admin_manage_products')}
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">
            {t('admin_recent_products')}
          </h3>
          {products.length === 0 ? (
            <p className="text-gray-500">{t('admin_no_products_yet')}</p>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t('nav_products')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t('admin_category')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t('product_price')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t('admin_status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {products.slice(0, 5).map((product) => (
                    <tr key={product.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {(() => {
                              // Handle both legacy and Shopify format
                              if (
                                (product as any).images &&
                                Array.isArray((product as any).images) &&
                                (product as any).images.length > 0
                              ) {
                                const firstImage = (product as any).images[0];
                                const imageUrl =
                                  typeof firstImage === 'object' ? firstImage.url : firstImage;
                                if (imageUrl) {
                                  return (
                                    <img
                                      className="h-10 w-10 rounded-lg object-cover"
                                      src={imageUrl}
                                      alt={product.title}
                                    />
                                  );
                                }
                              }

                              if ((product as any).featuredImage?.url) {
                                return (
                                  <img
                                    className="h-10 w-10 rounded-lg object-cover"
                                    src={(product as any).featuredImage.url}
                                    alt={product.title}
                                  />
                                );
                              }

                              // Legacy format - check if images is a string array
                              if (
                                product.images &&
                                Array.isArray(product.images) &&
                                product.images.length > 0
                              ) {
                                return (
                                  <img
                                    className="h-10 w-10 rounded-lg object-cover"
                                    src={product.images[0]}
                                    alt={product.title}
                                  />
                                );
                              }

                              // Fallback placeholder
                              return (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
                                  <svg
                                    className="h-5 w-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
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
                        {product.category}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            product.availableForSale
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.availableForSale
                            ? t('product_in_stock')
                            : t('product_out_of_stock')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

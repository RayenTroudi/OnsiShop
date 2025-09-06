'use client';

import ImageUpload from '@/components/admin/ImageUpload';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
  handle: string;
}

interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  availableForSale: boolean;
  images: string;
  tags?: string;
  category?: {
    id: string;
    name: string;
  };
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  
  // Robust productId extraction
  let productId = '';
  if (params.id) {
    if (typeof params.id === 'string') {
      productId = params.id;
    } else if (Array.isArray(params.id)) {
      productId = params.id[0] || '';
    } else {
      productId = String(params.id);
    }
  }
  
  console.log('🔍 Raw params:', params);
  console.log('📝 Extracted productId:', productId);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    handle: '',
    description: '',
    price: 0,
    compareAtPrice: 0,
    categoryId: '',
    images: [''],
    tags: '',
    availableForSale: true,
  });

  useEffect(() => {
    console.log('🔍 Edit page initialized with params:', params);
    console.log('📝 Product ID:', productId);
    
    // Enhanced validation to prevent malformed URLs
    if (!productId || 
        productId === '[object Object]' || 
        productId.includes('[') || 
        productId.includes(']') ||
        productId.trim() === '' ||
        productId === 'undefined' ||
        productId === 'null') {
      console.error('❌ Invalid product ID detected:', productId);
      console.log('🔄 Redirecting to products list');
      window.location.href = '/admin/products';
      return;
    }
    
    fetchCategories();
    fetchProduct();
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const apiUrl = `/api/admin/products?id=${productId}`;
      console.log('🔄 Fetching product from:', apiUrl);
      
      const response = await fetch(apiUrl);
      if (response.ok) {
        const productData = await response.json();
        setProduct(productData);
        
        // Parse images JSON string with better error handling
        let productImages: string[] = [];
        try {
          if (productData.images) {
            if (typeof productData.images === 'string') {
              // Try to parse as JSON first
              try {
                const parsed = JSON.parse(productData.images);
                if (Array.isArray(parsed)) {
                  productImages = parsed.filter((img: any) => {
                    // Strict validation to prevent malformed URLs
                    return img && 
                           typeof img === 'string' && 
                           img.trim() !== '' &&
                           !img.includes('[') &&
                           !img.includes(']') &&
                           img !== 'undefined' &&
                           img !== 'null';
                  });
                } else {
                  // If not an array, treat as single image URL
                  const singleImg = productData.images.trim();
                  if (singleImg && !singleImg.includes('[') && !singleImg.includes(']')) {
                    productImages = [singleImg];
                  }
                }
              } catch {
                // If JSON parse fails, treat as single image URL
                const singleImg = productData.images.trim();
                if (singleImg && !singleImg.includes('[') && !singleImg.includes(']')) {
                  productImages = [singleImg];
                }
              }
            } else if (Array.isArray(productData.images)) {
              // Already an array
              productImages = productData.images.filter((img: any) => {
                // Strict validation to prevent malformed URLs
                return img && 
                       typeof img === 'string' && 
                       img.trim() !== '' &&
                       !img.includes('[') &&
                       !img.includes(']') &&
                       img !== 'undefined' &&
                       img !== 'null';
              });
            }
          }
        } catch (e) {
          console.error('Error parsing product images:', e);
          productImages = [];
        }
        
        console.log('🖼️ Parsed product images:', productImages);
        
        // Ensure we always have at least one empty string for the form only if no valid images
        if (productImages.length === 0) {
          productImages = [''];
        }
        
        setFormData({
          title: productData.title || '',
          handle: productData.handle || '',
          description: productData.description || '',
          price: productData.price || 0,
          compareAtPrice: productData.compareAtPrice || 0,
          categoryId: productData.category?.id || '',
          images: productImages,
          tags: productData.tags || '',
          availableForSale: productData.availableForSale !== false,
        });
      } else {
        console.error('Product not found');
        try {
          router.push('/admin/products');
        } catch (error) {
          console.error('Router navigation failed:', error);
          window.location.href = '/admin/products';
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      try {
        router.push('/admin/products');
      } catch (routerError) {
        console.error('Router navigation failed:', routerError);
        window.location.href = '/admin/products';
      }
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));

    // Auto-generate handle from title
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        handle: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Filter and validate images before sending
      const validImages = formData.images.filter(img => {
        const isValid = img && img.trim() !== '' && !img.includes('[') && !img.includes(']');
        console.log('🔍 Image validation:', img?.substring(0, 50) + '...', 'Valid:', isValid);
        return isValid;
      });

      const productData = {
        id: productId,
        title: formData.title,
        handle: formData.handle,
        description: formData.description,
        price: formData.price,
        compareAtPrice: formData.compareAtPrice || null,
        categoryId: formData.categoryId || null,
        images: validImages, // Send as array, not stringified
        tags: formData.tags,
        availableForSale: formData.availableForSale,
      };

      console.log('� Sending product data with images:', {
        ...productData,
        images: validImages.map(img => img?.substring(0, 50) + '...')
      });

      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Product updated successfully!' });
        
        // Use a more reliable navigation approach with additional safeguards
        const redirectToProducts = () => {
          try {
            // Use replace instead of push to avoid back button issues
            router.replace('/admin/products');
          } catch (error) {
            console.error('Router navigation failed, using window.location:', error);
            
            // Ensure we're using absolute URL for window.location
            const baseUrl = window.location.origin;
            window.location.href = `${baseUrl}/admin/products`;
          }
        };
        
        setTimeout(redirectToProducts, 1500);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: `Failed to update product: ${error.error || 'Unknown error'}` });
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setMessage({ type: 'error', text: 'Failed to update product. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Product not found</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Edit Product: {product.title}
          </h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/admin/products"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </Link>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`mt-4 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8 divide-y divide-gray-200">
        <div className="space-y-8 divide-y divide-gray-200">
          {/* Basic Information */}
          <div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Product Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Update the basic information about your product.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Product Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="handle" className="block text-sm font-medium text-gray-700">
                  Handle (URL slug)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="handle"
                    id="handle"
                    required
                    value={formData.handle}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <div className="mt-1">
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price ($)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="price"
                    id="price"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="compareAtPrice" className="block text-sm font-medium text-gray-700">
                  Compare at Price ($)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="compareAtPrice"
                    id="compareAtPrice"
                    min="0"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags (comma separated)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="tags"
                    id="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="casual, cotton, summer"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <div className="flex items-center">
                  <input
                    id="availableForSale"
                    name="availableForSale"
                    type="checkbox"
                    checked={formData.availableForSale}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="availableForSale" className="ml-2 block text-sm text-gray-900">
                    Available for sale
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Product Images</h3>
              <p className="mt-1 text-sm text-gray-500">
                Update images for your product. You can upload files or enter URLs.
              </p>
            </div>

            <div className="mt-6">
              <ImageUpload 
                images={formData.images}
                onImagesChange={(newImages) => {
                  console.log('🖼️ ImageUpload onChange received:', newImages.map(img => img?.substring(0, 50) + '...'));
                  setFormData(prev => ({ ...prev, images: newImages }));
                }}
              />
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <Link
              href="/admin/products"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

'use client';

import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from '@/contexts/TranslationContext';

export default function TranslationDemoPage() {
  const { t, language, isLoading } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('msg_welcome')}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Translation System Demo - Current Language: <span className="font-semibold">{language.toUpperCase()}</span>
          </p>
          <div className="flex justify-center">
            <LanguageSelector />
          </div>
        </div>

        {/* Navigation Demo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="font-medium">{t('nav_home')}</div>
              <div className="text-sm text-gray-500">nav_home</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="font-medium">{t('nav_products')}</div>
              <div className="text-sm text-gray-500">nav_products</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="font-medium">{t('nav_cart')}</div>
              <div className="text-sm text-gray-500">nav_cart</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="font-medium">{t('nav_account')}</div>
              <div className="text-sm text-gray-500">nav_account</div>
            </div>
          </div>
        </div>

        {/* Product Demo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Product Section</h2>
          <div className="border rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-2">Sample Product</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <span className="font-medium">{t('product_price')}:</span> €29.99
                </div>
                <div className="mb-2">
                  <span className="font-medium">{t('product_availability')}:</span>{' '}
                  <span className="text-green-600">{t('product_in_stock')}</span>
                </div>
                <div className="mb-4">
                  <span className="font-medium">{t('product_description')}:</span> Lorem ipsum dolor sit amet
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <label className="block font-medium mb-2">{t('product_quantity')}:</label>
                  <input 
                    type="number" 
                    defaultValue="1" 
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                  {t('product_add_to_cart')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Demo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('cart_title')}</h2>
          <div className="border rounded-lg p-4">
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">{t('cart_empty')}</div>
              <button className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700">
                {t('nav_products')}
              </button>
            </div>
          </div>
        </div>

        {/* Form Demo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Form Example</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2">{t('form_first_name')}</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-2">{t('form_last_name')}</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-2">{t('form_email')}</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">{t('form_phone')}</label>
              <input 
                type="tel" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex space-x-4">
              <button 
                type="submit" 
                className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700"
              >
                {t('common_save')}
              </button>
              <button 
                type="button" 
                className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600"
              >
                {t('common_cancel')}
              </button>
            </div>
          </form>
        </div>

        {/* Messages Demo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Messages</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="text-green-800">{t('msg_login_success')}</div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-blue-800">{t('msg_item_added_to_cart')}</div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="text-green-800">{t('msg_order_placed')}</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">How to use:</h3>
          <ul className="text-yellow-700 space-y-1">
            <li>• Use the language selector above to switch between French, English, and Arabic</li>
            <li>• Translations automatically fall back to French if missing in the selected language</li>
            <li>• Visit <code className="bg-yellow-100 px-1 rounded">/admin/translations</code> to manage translations</li>
            <li>• Use <code className="bg-yellow-100 px-1 rounded">t('translation_key')</code> in your components</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

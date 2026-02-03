'use client';

import { useCart } from '@/contexts/CartContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { MinusIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, updateItemQuantity, removeItem, loading } = useCart();
  const { t } = useTranslation();
  const router = useRouter();

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 transition-opacity" onClick={onClose} />

      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-2xl font-bold">{t('cart_title')}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="border-purple-600 h-12 w-12 animate-spin rounded-full border-b-2"></div>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                <ShoppingCartIcon className="h-12 w-12 text-gray-400" />
              </div>
              <p className="mb-6 text-gray-500">{t('cart_empty')}</p>
              <button
                onClick={onClose}
                className="bg-purple-600 hover:bg-purple-700 rounded-lg px-6 py-3 text-white transition-colors"
              >
                {t('cart_continue_shopping')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-lg bg-gray-50 p-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                    <Image
                      src={
                        item.product?.image ||
                        item.product?.images?.[0] ||
                        '/placeholder-product.jpg'
                      }
                      alt={item.product?.title || 'Product'}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.product?.handle}`}
                      onClick={onClose}
                      className="hover:text-purple-600 line-clamp-2 font-medium text-gray-900"
                    >
                      {item.product?.title || 'Unknown Product'}
                    </Link>

                    <p className="mt-1 text-sm text-gray-500">
                      {(item.product?.price || 0).toFixed(2)} DT
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-lg border bg-white">
                        <button
                          onClick={() =>
                            updateItemQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          className="rounded-l-lg p-2 transition-colors hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="px-3 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="rounded-r-lg p-2 transition-colors hover:bg-gray-100"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="space-y-4 border-t p-6">
            <div className="flex justify-between text-lg font-semibold">
              <span>{t('common_subtotal')}</span>
              <span>{(cart.totalAmount || 0).toFixed(2)} DT</span>
            </div>

            <button
              onClick={handleCheckout}
              className="bg-purple-600 hover:bg-purple-700 w-full rounded-lg py-4 font-semibold text-white shadow-lg transition-colors"
            >
              {t('cart_checkout')}
            </button>

            <button
              onClick={onClose}
              className="w-full rounded-lg border border-gray-300 py-3 font-medium transition-colors hover:bg-gray-50"
            >
              {t('cart_continue_shopping')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function ShoppingCartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

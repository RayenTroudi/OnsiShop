'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export default function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Redirect to products list after successful deletion
        router.push('/products?deleted=true');
      } else {
        const error = await response.json();
        alert(`${t('delete_product_failed')}: ${error.error || t('unknown_error')}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(t('delete_product_error'));
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="flex-1 space-y-2">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 mb-3">
            {t('delete_product_confirm')} <strong>&quot;{productName}&quot;</strong>? {t('action_cannot_be_undone')}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:bg-red-400 transition-colors"
            >
              {isDeleting ? t('button_deleting') : t('button_yes_delete')}
            </button>
            <button
              onClick={handleCancel}
              disabled={isDeleting}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300 transition-colors"
            >
              {t('button_cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center space-x-2"
    >
      <TrashIcon className="w-5 h-5" />
      <span>{t('button_delete_product')}</span>
    </button>
  );
}

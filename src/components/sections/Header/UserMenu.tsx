'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Image from 'next/image';
import Link from 'next/link';

export default function UserMenu() {
  const { t } = useTranslation();
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    // Show a subtle loading indicator
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-9 h-9 rounded-full border-2 border-gray-200 border-t-gray-400 animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Show login icon for unauthenticated users
    return (
      <Link 
        href="/login" 
        className="flex h-full items-center justify-center [&>*]:transition-all [&>*]:duration-300 hover:[&>*]:opacity-50"
        title={t('nav_login')}
      >
        <Image 
          src="/images/profile.png" 
          width="36" 
          height="36" 
          alt={t('nav_login')} 
          className="transition-all duration-300"
        />
      </Link>
    );
  }

  // Show user menu for authenticated users
  return (
    <div className="relative group flex h-full items-center justify-center">
      <button 
        className="flex h-full items-center justify-center [&>*]:transition-all [&>*]:duration-300 hover:[&>*]:opacity-50" 
        title={`Logged in as ${user.name || user.email}`}
      >
        <Image 
          src="/images/profile.png" 
          width="36" 
          height="36" 
          alt={t('menu_profile')} 
          className="transition-all duration-300"
        />
      </button>
      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-200">
        <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
          <div className="font-medium">{user.name || 'User'}</div>
          <div className="text-xs text-gray-400">{user.email}</div>
        </div>
        <Link
          href="/orders"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          📦 {t('nav_orders')}
        </Link>
        {user.isAdmin && (
          <>
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              🛠️ {t('menu_admin')}
            </Link>
            <Link
              href="/admin/hero-video"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              🎥 Hero Video
            </Link>
          </>
        )}
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          🚪 {t('nav_logout')}
        </button>
      </div>
    </div>
  );
}

'use client';

import CartButton from '@/components/cart/CartButton';
import LanguageSelector from '@/components/LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { href: '/', label: t('nav_home') },
    { href: '/products', label: t('nav_products') },
    { href: '/about', label: t('nav_about') },
    { href: '/contact', label: t('nav_contact') }
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-purple-600 text-2xl font-bold">
            OnsiShop
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-purple-100 text-purple-700'
                    : 'hover:text-purple-600 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <CartButton />

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center space-x-3">
                {user && 'role' in user && user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-purple-600 hover:bg-purple-50 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                  >
                    {t('menu_admin')}
                  </Link>
                )}
                <Link
                  href="/account"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  {t('nav_account')}
                </Link>
                <button
                  onClick={logout}
                  className="rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  {t('nav_logout')}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-purple-600 hover:bg-purple-700 rounded-md px-4 py-2 font-medium text-white transition-colors"
              >
                {t('nav_login')}
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
            >
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t bg-white md:hidden">
            <div className="space-y-2 py-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-purple-100 text-purple-700'
                      : 'hover:text-purple-600 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {user ? (
                <div className="mt-4 space-y-2 border-t pt-4">
                  {user && 'role' in user && user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-purple-600 hover:bg-purple-50 block px-4 py-3 text-sm font-medium transition-colors"
                    >
                      {t('menu_admin')}
                    </Link>
                  )}
                  <Link
                    href="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    {t('nav_account')}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    {t('nav_logout')}
                  </button>
                </div>
              ) : (
                <div className="mt-4 border-t pt-4">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-purple-600 hover:bg-purple-700 mx-4 block rounded-md px-4 py-2 text-center font-medium text-white transition-colors"
                  >
                    {t('nav_login')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

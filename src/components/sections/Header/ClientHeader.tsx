'use client';

import CartIconWrapper from '@/components/cart/CartIconWrapper';
import Logo from '@/components/layout/Logo';
import { getMenu } from '@/lib/mock-shopify';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import ClientMenu from './ClientMenu';
import LanguageSelector from './LanguageSelector';
import SearchIcon from './SearchIcon';
import UserMenu from './UserMenu';

// Dynamically import MobileMenu to prevent SSR issues with useSearchParams
const ClientMobileMenu = dynamic(() => import('./ClientMobileMenu'), {
  ssr: false,
  loading: () => (
    <div className="flex h-8 w-8 items-center justify-center">
      <div className="h-6 w-6 animate-pulse rounded bg-gray-200"></div>
    </div>
  )
});

interface Category {
  id: string;
  name: string;
  handle: string;
}

export default function ClientHeader() {
  const [menu, setMenu] = useState<Array<{ title: string; path: string; items: any[] }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const categories: Category[] = await response.json();
        
        // Transform categories into menu format
        const categoryMenu = categories.map(category => ({
          title: category.name,
          path: `/search/${category.handle}`,
          items: []
        }));
        
        // Use categories if available, otherwise fallback to mock menu
        if (categoryMenu.length > 0) {
          setMenu(categoryMenu);
        } else {
          // Fallback to mock menu
          const mockMenu = await getMenu('main-menu');
          setMenu(mockMenu);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Use mock menu as fallback
        try {
          const mockMenu = await getMenu('main-menu');
          setMenu(mockMenu);
        } catch (mockError) {
          console.error('Error fetching mock menu:', mockError);
          setMenu([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <header className="sticky top-0 z-40 flex w-full items-center justify-center border-b border-purple/20 bg-white/90 px-4 py-2 shadow-sm backdrop-blur-md md:h-20 md:py-0 xl:px-12">
      <h1 className="sr-only">ONSI</h1>
      <nav className="flex h-full w-full max-w-7xl items-center justify-between">
        <h2 className="sr-only">Main Navigation Menu</h2>
        <div className="flex h-full w-full items-center justify-between">
          {/* Mobile menu */}
          <Suspense fallback={
            <div className="flex h-8 w-8 items-center justify-center md:hidden">
              <div className="h-6 w-6 animate-pulse rounded bg-gray-200"></div>
            </div>
          }>
            <div className="md:hidden">
              <ClientMobileMenu initialMenu={menu} />
            </div>
          </Suspense>
          
          {/* Logo */}
          <Link
            href="/"
            title="Home"
            className="group flex h-full items-center justify-center transition-transform duration-300 hover:scale-105"
          >
            <Logo size="lg" />
          </Link>
          
          {/* Desktop menu */}
          <div className="hidden md:flex md:flex-1 md:justify-center">
            {loading ? (
              <div className="flex items-center space-x-4">
                <div className="h-6 w-20 animate-pulse rounded bg-gray-200"></div>
                <div className="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
                <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
              </div>
            ) : (
              <ClientMenu initialMenu={menu} />
            )}
          </div>
          
          {/* Right side actions */}
          <div className="flex h-full items-center justify-end space-x-4 md:w-40 xl:w-48">
            <div className="flex h-full items-center justify-center">
              <LanguageSelector />
            </div>
            <div className="flex h-full items-center justify-center">
              <SearchIcon />
            </div>
            <div className="flex h-full items-center justify-center">
              <UserMenu />
            </div>
            <Suspense fallback={<div className="h-9 w-9"></div>}>
              <div className="flex h-full items-center justify-center">
                <CartIconWrapper />
              </div>
            </Suspense>
          </div>
        </div>
      </nav>
    </header>
  );
}
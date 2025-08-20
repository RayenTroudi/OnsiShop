import { getMenu } from '@/lib/shopify';

import Link from 'next/link';
import MobileMenu from './mobile-menu';

// next

// components
import CartIconWrapper from '@/components/cart/CartIconWrapper';
import Logo from '@/components/layout/Logo';
import { Suspense } from 'react';
import Menu from './Menu';
import SearchIcon from './SearchIcon';
import UserMenu from './UserMenu';

// Get categories from API route (safer for server components)
async function getCategories() {
  try {
    console.log('🔍 Getting categories from API route...');
    
    // In production or server environment, use the full URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/categories`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.warn('❌ Failed to fetch categories:', response.status);
      return [];
    }
    
    const categories = await response.json();
    console.log('✅ Categories from API:', categories.length, categories.map((c: any) => c.name));
    
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return [];
  }
}

const Header = async () => {
  // Get categories from our database
  const categories = await getCategories();
  console.log('🔍 Categories in header:', categories.length, categories.map(c => c.name));
  
  // Transform categories into menu format
  const categoryMenu = categories.map(category => ({
    title: category.name,
    path: `/search/${category.handle}`,
    items: []
  }));
  
  // Fallback to Shopify menu if no categories
  const shopifyMenu = categoryMenu.length === 0 ? await getMenu('main-menu') : [];
  const menu = categoryMenu.length > 0 ? categoryMenu : shopifyMenu;
  
  console.log('🔍 Final menu:', menu.length, menu.map(m => m.title));
  return (
    <header className="sticky top-0 z-40 flex w-full items-center justify-center border-b border-purple/20 bg-white/90 px-4 py-2 shadow-sm backdrop-blur-md md:h-20 md:py-0 xl:px-12">
      <h1 className="sr-only">ONSI</h1>
      <nav className="flex h-full w-full max-w-7xl items-center justify-between">
        <h2 className="sr-only">Main Navigation Menu</h2>
        <div className="flex h-full w-full items-center justify-between">
          {/* Mobile menu */}
          <div className="md:hidden">
            <MobileMenu menu={menu} />
          </div>
          
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
            <Menu menu={menu} />
          </div>
          
          {/* Right side actions */}
          <div className="flex h-full items-center justify-end space-x-4 md:w-32 xl:w-40">
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
};

export default Header;

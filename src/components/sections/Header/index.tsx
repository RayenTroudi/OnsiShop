import { getMenu } from '@/lib/mock-shopify';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// next

// components
import CartIconWrapper from '@/components/cart/CartIconWrapper';
import Logo from '@/components/layout/Logo';
import { Suspense } from 'react';
import ClientMenu from './ClientMenu';
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

// Get categories from database
async function getCategories(): Promise<Array<{ id: string; name: string; handle: string }>> {
  // During build time, skip the fetch to prevent errors
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) {
    console.log('🔍 Skipping category fetch during build');
    return [];
  }
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        handle: true,
      },
    });
    
    await prisma.$disconnect();
    
    return categories.map((category: any) => ({
      id: String(category.id),
      name: category.name,
      handle: category.handle
    }));
  } catch (error) {
    console.log('🔍 Error fetching categories:', error);
    return [];
  }
}

const Header = async () => {
  // Get categories from our database
  const categories = await getCategories();
  console.log('🔍 Categories in header:', categories.length, categories.length > 0 ? categories.map(c => c.name) : []);
  
  // Transform categories into menu format
  const categoryMenu = categories.map(category => ({
    title: category.name,
    path: `/search/${category.handle}`,
    items: []
  }));
  
  // Fallback to mock menu if no categories
  const mockMenu = categoryMenu.length === 0 ? await getMenu('main-menu') : [];
  const menu = categoryMenu.length > 0 ? categoryMenu : mockMenu;
  
  console.log('🔍 Final menu:', menu.length, menu.map((m: any) => m.title));
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
            <ClientMenu initialMenu={menu} />
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

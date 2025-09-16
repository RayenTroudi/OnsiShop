'use client';

import { Menu } from '@/lib/types';
import { useEffect, useState } from 'react';
import MobileMenu from './mobile-menu';

interface ClientMobileMenuProps {
  initialMenu: Menu[];
}

const ClientMobileMenu = ({ initialMenu }: ClientMobileMenuProps) => {
  const [menu, setMenu] = useState<Menu[]>(initialMenu);

  useEffect(() => {
    // If we have initial menu or we're on server, don't fetch
    if (initialMenu.length > 0 || typeof window === 'undefined') {
      return;
    }

    // Fetch categories on client side as fallback
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          console.log('🔍 Client-side category fetch failed');
          return;
        }
        
        const data = await response.json();
        const categories = Array.isArray(data) ? data : data.categories || [];
        
        if (categories.length > 0) {
          const categoryMenu = categories.map((category: any) => ({
            title: category.name,
            path: `/search/${category.handle || category.name.toLowerCase().replace(/\s+/g, '-')}`,
            items: []
          }));
          
          setMenu(categoryMenu);
        }
      } catch (error) {
        console.log('🔍 Error fetching categories on client:', error);
      }
    };

    fetchCategories();
  }, [initialMenu]);

  return <MobileMenu menu={menu} />;
};

export default ClientMobileMenu;

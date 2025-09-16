'use client';

// react
import { useEffect, useState } from 'react';

// next
import Link from 'next/link';

// shopify
import { getMenu } from '@/lib/mock-shopify';
import { Menu } from '@/lib/types';

// contexts  
import { useTranslation } from '@/contexts/TranslationContext';

const Categories = () => {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<Menu[]>([]);
  
  // Translation key mapping for menu items
  const getTranslatedTitle = (title: string) => {
    const titleMap: Record<string, string> = {
      'Best Sellers': 'nav_best_sellers',
      'New Arrivals': 'nav_new_arrivals', 
      'Clothing': 'nav_clothing',
      'Accessories': 'nav_accessories'
    };
    return titleMap[title] || title;
  };
  
  useEffect(() => {
    const fetchMenu = async () => {
      const menuData = await getMenu('main-menu');
      setMenu(menuData);
    };
    fetchMenu();
  }, []);
  
  return (
    <div className="flex w-full flex-col items-center justify-center md:w-auto md:items-start md:justify-start">
      <h3 className="text-[20px] font-semibold text-veryDarkPurple">{t('nav_navigation')}</h3>
      <div className="mt-4 flex flex-col items-start justify-start gap-2 md:mt-2">
        {menu.map((menuItem, i) => (
          <div
            className="mb-4 flex flex-col gap-4 text-darkPurple md:mb-0 md:flex-row md:pl-[14px]"
            key={i}
          >
            <Link href={menuItem.path} key={i} className="hover-line text-[18px] font-semibold">
              {t(getTranslatedTitle(menuItem.title))}
            </Link>
            {menuItem.items.map((subMenuItem, i) => (
              <Link href={subMenuItem.path} key={i} className="hover-line ml-4 text-[18px] md:ml-0">
                {t(getTranslatedTitle(subMenuItem.title))}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;

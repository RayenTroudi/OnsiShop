'use client';

import Link from 'next/link';

import SubMenu from './SubMenu';

import { useTranslation } from '@/contexts/TranslationContext';
import { Menu as MenuType } from '@/lib/types';

const Menu = ({ menu }: { menu: MenuType[] }) => {
  const { t } = useTranslation();
  
  // Translation key mapping for menu items
  const getTranslatedTitle = (title: string) => {
    const titleMap: Record<string, string> = {
      'Best Sellers': 'nav_best_sellers',
      'New Arrivals': 'nav_new_arrivals', 
      'Clothing': 'nav_clothing',
      'Accessories': 'nav_accessories'
    };
    const translationKey = titleMap[title];
    return translationKey ? t(translationKey) : title;
  };

  // Show actual categories if available, otherwise show "All Products"
  const menuItems = menu && menu.length > 0 ? menu : [
    { title: 'All Products', path: '/products', items: [] }
  ];

  // Check if this is a special category
  const getItemVariant = (title: string) => {
    if (title.toLowerCase().includes('best sellers') || title.toLowerCase().includes('bestsellers')) {
      return 'featured';
    }
    if (title.toLowerCase().includes('new') || title.toLowerCase().includes('arrivals')) {
      return 'new';
    }
    return 'default';
  };

  const getItemStyles = (variant: string) => {
    switch (variant) {
      case 'featured':
        return {
          container: 'group relative flex h-full items-center justify-center px-4 py-2 lg:px-5 xl:px-6 transition-all duration-300 ease-in-out',
          background: 'absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-100 to-amber-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          text: 'relative z-10 text-sm font-bold tracking-wide text-amber-700 transition-colors duration-300 group-hover:text-amber-800 lg:text-base xl:text-lg',
          bottomBorder: 'absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-amber-500 to-yellow-600 transition-all duration-300 ease-out group-hover:w-full group-hover:-translate-x-1/2',
          topAccent: 'absolute top-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-yellow-400 to-amber-500 opacity-0 transition-all duration-300 ease-out group-hover:w-3/4 group-hover:opacity-100 group-hover:-translate-x-1/2',
          badge: true
        };
      case 'new':
        return {
          container: 'group relative flex h-full items-center justify-center px-4 py-2 lg:px-5 xl:px-6 transition-all duration-300 ease-in-out',
          background: 'absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-100 to-green-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          text: 'relative z-10 text-sm font-semibold tracking-wide text-emerald-700 transition-colors duration-300 group-hover:text-emerald-800 lg:text-base xl:text-lg',
          bottomBorder: 'absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-300 ease-out group-hover:w-full group-hover:-translate-x-1/2',
          topAccent: 'absolute top-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 transition-all duration-300 ease-out group-hover:w-3/4 group-hover:opacity-100 group-hover:-translate-x-1/2',
          badge: false
        };
      default:
        return {
          container: 'group relative flex h-full items-center justify-center px-3 py-2 lg:px-4 xl:px-6 transition-all duration-300 ease-in-out',
          background: 'absolute inset-0 rounded-lg bg-gradient-to-r from-purple/10 to-lightPurple/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          text: 'relative z-10 text-sm font-semibold tracking-wide text-veryDarkPurple transition-colors duration-300 group-hover:text-purple lg:text-base xl:text-lg',
          bottomBorder: 'absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-purple to-darkPurple transition-all duration-300 ease-out group-hover:w-full group-hover:-translate-x-1/2',
          topAccent: 'absolute top-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-lightPurple to-purple opacity-0 transition-all duration-300 ease-out group-hover:w-3/4 group-hover:opacity-100 group-hover:-translate-x-1/2',
          badge: false
        };
    }
  };

  return (
    <>
      {menuItems.length ? (
        <nav className="hidden h-full md:flex md:items-center">
          <ul className="flex h-full items-center gap-1 lg:gap-2 xl:gap-3">
            {menuItems.map((item: MenuType, index) => {
              const variant = getItemVariant(item.title);
              const styles = getItemStyles(variant);
              
              return (
                <li
                  key={item.title}
                  className="h-full"
                  onMouseLeave={(e) => {
                    if (
                      !item.items.length ||
                      (e.relatedTarget as HTMLElement).parentElement === e.currentTarget
                    )
                      return;
                    ((e.currentTarget as HTMLLIElement).lastChild as HTMLDivElement).classList.add(
                      'opacity-0',
                      'pointer-events-none',
                      '[&_.fade-up]:animate-fadeOut',
                      '[&_.fade-up-delay]:animate-fadeOut'
                    );
                  }}
                >
                  <Link
                    href={item.path}
                    className={styles.container}
                    onMouseEnter={(e) => {
                      if (!item.items.length) return;
                      const containerElement = (e.target as HTMLAnchorElement)
                        .nextSibling as HTMLDivElement;
                      if (!containerElement || !containerElement.classList.contains('opacity-0'))
                        return;
                      containerElement.classList.remove(
                        'opacity-0',
                        'pointer-events-none',
                        '[&_.fade-up]:animate-fadeOut',
                        '[&_.fade-up-delay]:animate-fadeOut',
                        '[&_.fade-up]:animate-fadeUp',
                        '[&_.fade-up-delay]:animate-fadeUpDelay'
                      );
                      void containerElement.offsetHeight;
                      containerElement.classList.add(
                        '[&_.fade-up]:animate-fadeUp',
                        '[&_.fade-up-delay]:animate-fadeUpDelay'
                      );
                    }}
                  >
                    {/* Background hover effect */}
                    <div className={styles.background} />
                    
                    {/* Text with optional badge */}
                    <span className={styles.text}>
                      {getTranslatedTitle(item.title)}
                      {styles.badge && (
                        <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 animate-pulse" />
                      )}
                    </span>
                    
                    {/* Bottom border */}
                    <div className={styles.bottomBorder} />
                    
                    {/* Subtle top accent */}
                    <div className={styles.topAccent} />
                  </Link>
                  {item.items.length > 0 && <SubMenu items={item.items} parent={item.title} />}
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </>
  );
};

export default Menu;

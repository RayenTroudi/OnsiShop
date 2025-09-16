'use client';

import { Dialog, Transition } from '@headlessui/react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';

import { useTranslation } from '@/contexts/TranslationContext';
import { Menu } from '@/lib/types';
import { Spin as Hamburger } from 'hamburger-react';
import SearchWrapper from './SearchWrapper';

export default function MobileMenu({ menu }: { menu: Menu[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const closeMobileMenu = () => setIsOpen(false);

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  return (
    <>
      <div className="relative z-40">
        <Hamburger
          toggled={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
          label="Open mobile menu"
          size={30}
        />
      </div>
      <Transition show={isOpen}>
        <Dialog onClose={closeMobileMenu} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-[-100%]"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-[-100%]"
          >
            <Dialog.Panel className="fixed bottom-0 left-0 right-0 top-0 flex h-full w-full flex-col bg-white/95 pb-6 backdrop-blur-xl">
              <div className="px-6 pb-4 pt-4">
                <div className="mb-6 text-darkPurple">
                  <Hamburger
                    toggled={isOpen}
                    onToggle={() => setIsOpen(!isOpen)}
                    label="Close mobile menu"
                    size={30}
                  />
                </div>

                <div className="mb-6 w-full">
                  <SearchWrapper />
                </div>
                {menu.length ? (
                  <nav className="flex w-full flex-col">
                    <ul className="space-y-1">
                      {menu.map((item: Menu, index) => (
                        <li key={item.title} className="group">
                          <Link 
                            href={item.path} 
                            onClick={closeMobileMenu} 
                            className="flex items-center justify-between rounded-xl bg-gradient-to-r from-lightPurple/30 to-veryLightPurple/50 px-4 py-4 text-lg font-semibold text-veryDarkPurple transition-all duration-300 hover:from-purple/20 hover:to-lightPurple/40 hover:text-purple active:scale-95"
                          >
                            <span className="flex items-center">
                              <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple to-darkPurple text-sm font-bold text-white">
                                {getTranslatedTitle(item.title).charAt(0)}
                              </span>
                              {getTranslatedTitle(item.title)}
                            </span>
                            <div className="h-1.5 w-1.5 rounded-full bg-purple opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          </Link>
                          {item.items.length > 0 && (
                            <ul className="ml-8 mt-2 space-y-1">
                              {item.items.map((subItem) => (
                                <li key={subItem.title}>
                                  <Link
                                    href={subItem.path}
                                    onClick={closeMobileMenu}
                                    className="block rounded-lg px-4 py-3 text-base font-medium text-darkPurple transition-all duration-300 hover:bg-lightPurple/40 hover:text-purple active:scale-95"
                                  >
                                    {getTranslatedTitle(subItem.title)}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </nav>
                ) : null}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}

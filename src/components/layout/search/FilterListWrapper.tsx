'use client';

import { Suspense } from 'react';
import type { ListItem } from './filter';
import FilterList from './filter';

interface FilterListWrapperProps {
  list: ListItem[];
  title?: string;
}

export default function FilterListWrapper({ list, title }: FilterListWrapperProps) {
  return (
    <Suspense fallback={
      <nav className="flex items-center justify-center gap-x-8 animate-pulse">
        {title && (
          <div className="hidden font-lora text-xs text-darkPurple md:block md:text-lg">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
        )}
        <ul className="hidden items-center justify-center gap-4 md:flex">
          <div className="flex space-x-4">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-14"></div>
          </div>
        </ul>
        <ul className="md:hidden">
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
        </ul>
      </nav>
    }>
      <FilterList list={list} title={title} />
    </Suspense>
  );
}

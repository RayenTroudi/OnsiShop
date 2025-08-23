'use client';

import { Suspense } from 'react';
import type { ListItem } from './filter';
import FilterItemDropdown from './filter/dropdown';

interface FilterItemDropdownWrapperProps {
  list: ListItem[];
}

export default function FilterItemDropdownWrapper({ list }: FilterItemDropdownWrapperProps) {
  return (
    <Suspense fallback={
      <div className="relative">
        <div className="flex items-center rounded-md border bg-white p-4 text-sm animate-pulse">
          <div className="h-4 w-20 bg-gray-200 rounded mr-2"></div>
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <FilterItemDropdown list={list} />
    </Suspense>
  );
}

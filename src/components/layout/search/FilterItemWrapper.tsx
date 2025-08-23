'use client';

import { Suspense } from 'react';
import type { ListItem } from './filter';
import { FilterItem } from './filter/item';

interface FilterItemListWrapperProps {
  list: ListItem[];
}

function FilterItemList({ list }: { list: ListItem[] }) {
  return (
    <>
      {list.map((item: ListItem, i) => (
        <FilterItem key={i} item={item} />
      ))}
    </>
  );
}

export default function FilterItemListWrapper({ list }: FilterItemListWrapperProps) {
  return (
    <Suspense fallback={
      <div className="animate-pulse flex space-x-4">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-14"></div>
      </div>
    }>
      <FilterItemList list={list} />
    </Suspense>
  );
}

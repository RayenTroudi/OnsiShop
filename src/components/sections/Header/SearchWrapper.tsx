'use client';

import { Suspense } from 'react';
import Search from './search';

export default function SearchWrapper() {
  return (
    <Suspense fallback={
      <div className="relative w-full max-w-[550px] lg:w-80 xl:w-full">
        <div className="w-full rounded-lg border border-purple bg-white/80 px-4 py-2 text-sm animate-pulse h-10"></div>
      </div>
    }>
      <Search />
    </Suspense>
  );
}

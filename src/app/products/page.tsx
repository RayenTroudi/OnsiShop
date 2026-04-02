'use client';

import ProductsGrid from '@/components/product/ProductsGrid';
import { WOMEN_CATEGORIES } from '@/data/categories';
import Link from 'next/link';
import { useEffect } from 'react';

interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
    sort?: string;
    page?: string;
  };
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const category = searchParams.category || '';
  const search   = searchParams.search   || '';
  const sort     = searchParams.sort     || 'newest';
  const page     = parseInt(searchParams.page || '1');

  const activeLabel = search
    ? `Results for "${search}"`
    : WOMEN_CATEGORIES.find((c) => c.handle === category)?.label || 'All Products';

  useEffect(() => {
    document.title = `${activeLabel} — ONSI`;
  }, [activeLabel]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Page header */}
      <div className="border-b border-border bg-stone px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="section-label mb-2">
            {search ? 'Search' : 'Category'}
          </p>
          <h1 style={{ fontFamily: 'var(--cormorant)', fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 300, lineHeight: 1.1 }}>
            {activeLabel}
          </h1>
        </div>
      </div>

      {/* Category strip */}
      <div className="border-b border-border bg-cream">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-max gap-1 py-2">
            <Link href="/products"
              className={`px-4 py-2 text-xs font-medium tracking-widest uppercase transition-colors hover:text-terracotta ${!category && !search ? 'text-terracotta border-b-2 border-terracotta' : 'text-mist'}`}>
              All
            </Link>
            {WOMEN_CATEGORIES.filter((c) => !c.subcategories).map((cat) => (
              <Link key={cat.handle} href={`/products?category=${cat.handle}`}
                className={`px-4 py-2 text-xs font-medium tracking-widest uppercase transition-colors hover:text-terracotta ${category === cat.handle ? 'text-terracotta border-b-2 border-terracotta' : cat.highlight ? 'text-terracotta' : 'text-mist'}`}>
                {cat.label}
              </Link>
            ))}
            {WOMEN_CATEGORIES.find((c) => c.subcategories)?.subcategories?.map((sub) => (
              <Link key={sub.handle} href={`/products?category=${sub.handle}`}
                className={`px-4 py-2 text-xs font-medium tracking-widest uppercase transition-colors hover:text-terracotta ${category === sub.handle ? 'text-terracotta border-b-2 border-terracotta' : 'text-mist'}`}>
                {sub.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ProductsGrid category={category} search={search} sort={sort} page={page} />
      </div>
    </div>
  );
}

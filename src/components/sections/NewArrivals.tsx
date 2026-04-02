'use client';

import ProductCard from '@/components/product/ProductCardNew';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NewArrivals() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?limit=4&category=women-clothing')
      .then((r) => r.json())
      .then((data) => { if (data.products) setProducts(data.products.slice(0, 4)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const skeleton = Array.from({ length: 4 });

  return (
    <section className="bg-ink py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="section-label mb-2 text-cream/40">Latest</p>
            <h2 className="text-cream" style={{ fontFamily: 'var(--cormorant)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, lineHeight: 1.1 }}>
              New Arrivals
            </h2>
          </div>
          <Link href="/products?category=new-in" className="hidden text-xs font-medium tracking-widest uppercase text-cream/40 transition-colors hover:text-cream sm:block">
            New In →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading
            ? skeleton.map((_, i) => <div key={i} className="aspect-[3/4] animate-shimmer rounded-sm opacity-20" />)
            : products.map((product) => {
                const imageUrl = product.featuredImage?.url || product.images?.[0]?.url || product.images?.[0] || '';
                const imagesArr = (product.images || []).map((img: any) => typeof img === 'string' ? img : img?.url).filter(Boolean);
                return (
                  <ProductCard
                    key={product.id}
                    dark
                    product={{
                      id: product.id, title: product.title, handle: product.handle,
                      price: parseFloat(product.priceRange?.minVariantPrice?.amount || product.price || 0),
                      compareAtPrice: product.compareAtPriceRange?.minVariantPrice?.amount ? parseFloat(product.compareAtPriceRange.minVariantPrice.amount) : product.compareAtPrice,
                      image: imageUrl, images: imagesArr, availableForSale: product.availableForSale,
                    }}
                  />
                );
              })}
        </div>

        <div className="mt-12 text-center">
          <Link href="/products?category=new-in" className="inline-flex items-center gap-3 border border-cream/30 px-8 py-4 text-xs font-medium tracking-widest uppercase text-cream/70 transition-all duration-300 hover:border-cream hover:text-cream">
            View All New Arrivals
          </Link>
        </div>
      </div>
    </section>
  );
}

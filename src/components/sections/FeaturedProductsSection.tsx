'use client';

import ProductCard from '@/components/product/ProductCardNew';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function FeaturedProductsSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products/list?limit=8&category=women-clothing')
      .then((r) => r.json())
      .then((data) => { if (data.products) setProducts(data.products.slice(0, 8)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const skeleton = Array.from({ length: 8 });

  return (
    <section className="bg-stone py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="section-label mb-2">Handpicked</p>
            <h2 style={{ fontFamily: 'var(--cormorant)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, lineHeight: 1.1 }}>
              Featured Pieces
            </h2>
          </div>
          <Link href="/products" className="hidden text-xs font-medium tracking-widest uppercase text-mist transition-colors hover:text-terracotta sm:block">
            See All →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? skeleton.map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-shimmer rounded-sm" />
              ))
            : products.map((product) => {
                const imageUrl = product.featuredImage?.url || product.images?.[0]?.url || product.images?.[0] || '';
                const imagesArr = (product.images || []).map((img: any) => typeof img === 'string' ? img : img?.url).filter(Boolean);
                return (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      title: product.title,
                      handle: product.handle,
                      price: parseFloat(product.priceRange?.minVariantPrice?.amount || product.price || 0),
                      compareAtPrice: product.compareAtPriceRange?.minVariantPrice?.amount
                        ? parseFloat(product.compareAtPriceRange.minVariantPrice.amount)
                        : product.compareAtPrice,
                      image: imageUrl,
                      images: imagesArr,
                      availableForSale: product.availableForSale,
                    }}
                  />
                );
              })}
        </div>
      </div>
    </section>
  );
}

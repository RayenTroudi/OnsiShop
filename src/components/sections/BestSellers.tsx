'use client';

import ProductCard from '@/components/product/ProductCardNew';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function BestSellers() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?limit=6&category=women-clothing')
      .then((r) => r.json())
      .then((data) => { if (data.products) setProducts(data.products.slice(0, 6)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const skeleton = Array.from({ length: 6 });

  return (
    <section className="bg-cream py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="section-label mb-3">Most Loved</p>
          <h2 style={{ fontFamily: 'var(--cormorant)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, lineHeight: 1.1 }}>
            Best Sellers
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
          {loading
            ? skeleton.map((_, i) => <div key={i} className="aspect-[3/4] animate-shimmer rounded-sm" />)
            : products.map((product) => {
                const imageUrl = product.featuredImage?.url || product.images?.[0]?.url || product.images?.[0] || '';
                const imagesArr = (product.images || []).map((img: any) => typeof img === 'string' ? img : img?.url).filter(Boolean);
                return (
                  <ProductCard
                    key={product.id}
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
          <Link href="/products" className="btn-outline">
            Explore Full Collection
          </Link>
        </div>
      </div>
    </section>
  );
}

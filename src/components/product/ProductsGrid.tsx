'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Product {
  id: string;
  title: string;
  handle: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  images?: string[];
  availableForSale: boolean;
  source?: string;
}

interface ProductsGridProps {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
}

const PER_PAGE = 40;

const SHEIN_CDN_HOSTS = ['img.ltwebstatic.com', 'img.shein.com'];
function resolveImg(url?: string) {
  if (!url) return '/placeholder-product.jpg';
  try {
    const { hostname } = new URL(url);
    if (SHEIN_CDN_HOSTS.some((h) => hostname.includes(h)))
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  } catch { /* ignore */ }
  return url;
}

export default function ProductsGrid({
  category = '',
  search = '',
  sort = 'newest',
  page = 1,
}: ProductsGridProps) {
  const [products, setProducts]     = useState<Product[]>([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [source, setSource]         = useState<'shein' | 'db'>('db');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setProducts([]);

    async function load() {
      try {
        // ── Route to SHEIN API when category or search is specified ──
        if (category || search) {
          const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) });
          if (category) params.set('category', category);
          if (search)   params.set('search', search);

          const res  = await fetch(`/api/shein/products?${params}`);
          const data = await res.json();

          if (!cancelled && data.products?.length) {
            setProducts(data.products);
            setTotal(data.total ?? data.products.length);
            setTotalPages(data.totalPages ?? 1);
            setSource('shein');
            return;
          }
          // Fall through to DB if SHEIN returned nothing
        }

        // ── Fall back to DB ──────────────────────────────────────────
        const params = new URLSearchParams({
          page:  String(page),
          limit: String(PER_PAGE),
          sort,
        });
        if (category) params.set('category', category);
        if (search)   params.set('search', search);

        const res  = await fetch(`/api/products/list?${params}`);
        const data = await res.json();

        if (!cancelled) {
          const raw = data.products ?? [];
          const normalized = raw.map((p: any) => ({
            id:              p.id,
            title:           p.title,
            handle:          p.handle,
            price:           parseFloat(p.priceRange?.minVariantPrice?.amount ?? p.price ?? 0),
            compareAtPrice:  p.compareAtPriceRange?.minVariantPrice?.amount
              ? parseFloat(p.compareAtPriceRange.minVariantPrice.amount)
              : p.compareAtPrice,
            image:           p.featuredImage?.url ?? p.images?.[0]?.url ?? p.images?.[0],
            images:          (p.images ?? []).map((i: any) => (typeof i === 'string' ? i : i?.url)).filter(Boolean),
            availableForSale: p.availableForSale ?? true,
            source:          'db',
          }));
          setProducts(normalized);
          setTotal(data.totalCount ?? normalized.length);
          setTotalPages(data.totalPages ?? 1);
          setSource('db');
        }
      } catch (err) {
        console.error('ProductsGrid fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [category, search, sort, page]);

  const pageHref = (p: number) => {
    const q = new URLSearchParams();
    if (category) q.set('category', category);
    if (search)   q.set('search', search);
    if (sort)     q.set('sort', sort);
    q.set('page', String(p));
    return `/products?${q}`;
  };

  // ── Skeleton ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-shimmer rounded-sm" />
        ))}
      </div>
    );
  }

  // ── Empty ───────────────────────────────────────────────────
  if (!products.length) {
    return (
      <div className="py-20 text-center">
        <p className="mb-2 text-2xl" style={{ fontFamily: 'var(--cormorant)' }}>No products found</p>
        <p className="mb-6 text-sm text-mist">
          {search ? `Nothing matched "${search}"` : 'This category is empty right now.'}
        </p>
        <Link href="/products" className="btn-outline">Browse All Products</Link>
      </div>
    );
  }

  // ── Grid ─────────────────────────────────────────────────────
  return (
    <div>
      {/* Meta row */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs text-mist">
          {total} {source === 'shein' ? 'results from SHEIN' : 'products'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => {
          const img      = resolveImg(p.image ?? p.images?.[0]);
          const hoverImg = resolveImg(p.images?.[1] ?? p.image ?? p.images?.[0]);
          const hasDisc  = p.compareAtPrice && p.compareAtPrice > p.price;
          const pct      = hasDisc && p.compareAtPrice
            ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)
            : 0;
          // SHEIN products link to SHEIN; DB products link internally
          const href = source === 'shein'
            ? `/product/${p.handle}`
            : `/product/${p.handle}`;

          return (
            <div key={p.id} className="group relative flex flex-col overflow-hidden border border-border bg-cream">
              <Link href={href} className="block">
                <div className="relative aspect-[3/4] overflow-hidden bg-stone">
                  <Image src={img} alt={p.title} fill
                    className="object-cover transition-all duration-700 group-hover:opacity-0"
                    sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw" />
                  <Image src={hoverImg} alt={p.title} fill
                    className="object-cover opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
                    sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw" />

                  {hasDisc && (
                    <span className="absolute left-2 top-2 bg-terracotta px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cream">
                      -{pct}%
                    </span>
                  )}
                </div>

                <div className="p-3">
                  <p className="mb-1 line-clamp-2 text-sm leading-snug text-ink">{p.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">{p.price.toFixed(2)} DT</span>
                    {hasDisc && p.compareAtPrice && (
                      <span className="text-xs text-mist line-through">{p.compareAtPrice.toFixed(2)} DT</span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="btn-outline py-2 px-5 text-xs">← Prev</Link>
          )}
          <span className="text-xs text-mist">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={pageHref(page + 1)} className="btn-outline py-2 px-5 text-xs">Next →</Link>
          )}
        </div>
      )}
    </div>
  );
}

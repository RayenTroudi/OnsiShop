'use client';

import CartButton from '@/components/cart/CartButton';
import { WOMEN_CATEGORIES } from '@/data/categories';
import { useAuth } from '@/contexts/AuthContext';
import { Bars3Icon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SearchResult {
  id: string;
  title: string;
  handle: string;
  price: number;
  image?: string;
}

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

export default function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [searchOpen, setSearchOpen]       = useState(false);
  const [query, setQuery]                 = useState('');
  const [results, setResults]             = useState<SearchResult[]>([]);
  const [searching, setSearching]         = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Close search on route change
  useEffect(() => { setSearchOpen(false); setQuery(''); setResults([]); }, [pathname]);

  // Debounced live search
  const runSearch = useCallback((term: string) => {
    clearTimeout(debounceRef.current);
    if (!term.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        // Try SHEIN live search first
        const sheinRes  = await fetch(`/api/shein/products?search=${encodeURIComponent(term)}&limit=6`);
        const sheinData = await sheinRes.json();
        if (sheinData.products?.length) {
          setResults(sheinData.products.map((p: any) => ({
            id: p.id, title: p.title, handle: p.handle,
            price: p.price, image: p.image,
          })));
        } else {
          // Fallback to DB
          const res  = await fetch(`/api/products/list?search=${encodeURIComponent(term)}&limit=6`);
          const data = await res.json();
          const raw  = data.products || [];
          setResults(raw.map((p: any) => ({
            id: p.id, title: p.title, handle: p.handle,
            price: parseFloat(p.priceRange?.minVariantPrice?.amount || p.price || 0),
            image: p.featuredImage?.url || p.images?.[0]?.url || p.images?.[0],
          })));
        }
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 320);
  }, []);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery('');
    setResults([]);
  };

  const popularCategories = WOMEN_CATEGORIES.slice(0, 5);

  return (
    <>
      {/* ── Announcement strip ──────────────────────────────────── */}
      <div className="bg-ink py-2 text-center text-[11px] tracking-[0.18em] uppercase text-cream/60">
        Free shipping on orders over 150 DT
      </div>

      {/* ── Primary nav bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-cream/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Left — mobile hamburger */}
          <button onClick={() => setMobileOpen(true)} className="p-2 text-ink transition-opacity hover:opacity-60 lg:hidden" aria-label="Open menu">
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Center — Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
            style={{ fontFamily: 'var(--cormorant)', fontSize: '1.75rem', fontWeight: 500, letterSpacing: '0.08em' }}>
            ONSI
          </Link>

          {/* Right */}
          <div className="flex items-center gap-1">
            <button onClick={openSearch} className="flex items-center gap-2 rounded-none border border-transparent px-3 py-2 text-xs font-medium tracking-wider uppercase text-mist transition-all hover:border-border hover:text-ink" aria-label="Search">
              <MagnifyingGlassIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </button>

            <CartButton />

            {user ? (
              <div className="hidden items-center gap-1 lg:flex">
                {user && 'role' in user && user.role === 'admin' && (
                  <Link href="/admin" className="px-3 py-2 text-xs font-medium tracking-wider uppercase text-mist transition-colors hover:text-ink">Admin</Link>
                )}
                <Link href="/account" className="px-3 py-2 text-xs font-medium tracking-wider uppercase text-mist transition-colors hover:text-ink">Account</Link>
                <button onClick={logout} className="px-3 py-2 text-xs font-medium tracking-wider uppercase text-mist transition-colors hover:text-terracotta">Logout</button>
              </div>
            ) : (
              <Link href="/login" className="hidden px-3 py-2 text-xs font-medium tracking-wider uppercase text-mist transition-colors hover:text-ink lg:block">Sign In</Link>
            )}
          </div>
        </div>

        {/* ── Category bar (desktop) ───────────────────────────── */}
        <nav className="hidden border-t border-border lg:block">
          <ul className="mx-auto flex max-w-7xl items-center justify-center gap-1 px-8">
            {WOMEN_CATEGORIES.map((cat) =>
              cat.subcategories ? (
                <li key={cat.handle} className="mega-menu-trigger relative">
                  <Link href={`/products?category=${cat.handle}`}
                    className={`flex items-center gap-1 px-4 py-3 text-xs font-medium tracking-widest uppercase transition-colors hover:text-terracotta ${pathname.includes(cat.handle) ? 'text-terracotta' : 'text-ink-light'}`}>
                    {cat.label}
                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                  <div className="mega-menu">
                    <div className="mx-auto max-w-7xl px-8 py-8">
                      <p className="section-label mb-5">{cat.label}</p>
                      <ul className="grid grid-cols-4 gap-x-8 gap-y-3">
                        {cat.subcategories.map((sub) => (
                          <li key={sub.handle}>
                            <Link href={`/products?category=${sub.handle}`} className="text-sm text-ink-light transition-colors hover:text-terracotta">{sub.label}</Link>
                          </li>
                        ))}
                        <li>
                          <Link href={`/products?category=${cat.handle}`} className="text-sm font-medium text-terracotta underline underline-offset-2">View All Clothing →</Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </li>
              ) : (
                <li key={cat.handle}>
                  <Link href={`/products?category=${cat.handle}`}
                    className={`block px-4 py-3 text-xs font-medium tracking-widest uppercase transition-colors hover:text-terracotta ${cat.highlight ? 'text-terracotta' : pathname.includes(cat.handle) ? 'text-terracotta' : 'text-ink-light'}`}>
                    {cat.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>
      </header>

      {/* ── Search overlay ──────────────────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: 'rgba(13,11,9,0.6)', backdropFilter: 'blur(4px)' }}>
          {/* Search panel */}
          <div className="animate-slide-down w-full bg-cream shadow-2xl">
            {/* Input row */}
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <form onSubmit={handleSubmit} className="flex items-center gap-4 border-b-2 border-ink py-5">
                <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-mist" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); runSearch(e.target.value); }}
                  placeholder="Search for dresses, tops, shoes…"
                  className="flex-1 bg-transparent text-xl text-ink placeholder-mist/60 outline-none"
                  style={{ fontFamily: 'var(--cormorant)', fontWeight: 300 }}
                />
                {searching && <span className="text-xs text-mist animate-pulse">searching…</span>}
                <button type="button" onClick={() => setSearchOpen(false)} className="shrink-0 text-mist transition-colors hover:text-ink">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </form>
            </div>

            <div className="mx-auto max-w-3xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
              {/* Live results */}
              {results.length > 0 ? (
                <div>
                  <p className="section-label mb-4">Results</p>
                  <ul className="divide-y divide-border">
                    {results.map((r) => (
                      <li key={r.id}>
                        <Link href={`/product/${r.handle}`} onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-4 py-3 transition-colors hover:text-terracotta">
                          <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-stone">
                            <Image src={resolveImg(r.image)} alt={r.title} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm text-ink">{r.title}</p>
                            <p className="text-xs text-mist">{r.price.toFixed(2)} DT</p>
                          </div>
                          <svg className="h-4 w-4 shrink-0 text-mist" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <button onClick={handleSubmit as any}
                      className="text-xs font-medium tracking-widest uppercase text-terracotta hover:underline">
                      See all results for &ldquo;{query}&rdquo; →
                    </button>
                  </div>
                </div>
              ) : query.length > 1 && !searching ? (
                <p className="text-sm text-mist">No products found for &ldquo;{query}&rdquo;</p>
              ) : (
                /* Popular categories when idle */
                <div>
                  <p className="section-label mb-4">Popular Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {popularCategories.map((cat) => (
                      <Link key={cat.handle} href={`/products?category=${cat.handle}`}
                        onClick={() => setSearchOpen(false)}
                        className="border border-border px-4 py-2 text-xs font-medium tracking-wider uppercase text-ink-light transition-all hover:border-ink hover:text-ink">
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Click outside to close */}
          <div className="flex-1" onClick={() => setSearchOpen(false)} />
        </div>
      )}

      {/* ── Mobile drawer ────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex lg:hidden">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="animate-slide-down relative flex h-full w-80 flex-col overflow-y-auto bg-cream shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span style={{ fontFamily: 'var(--cormorant)', fontSize: '1.4rem', fontWeight: 500 }}>Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-ink transition-opacity hover:opacity-60">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile search bar */}
            <div className="border-b border-border px-5 py-3">
              <button onClick={() => { setMobileOpen(false); openSearch(); }}
                className="flex w-full items-center gap-3 text-sm text-mist">
                <MagnifyingGlassIcon className="h-4 w-4" />
                Search products…
              </button>
            </div>

            <nav className="flex-1 px-5 py-6">
              <ul className="space-y-1">
                {WOMEN_CATEGORIES.map((cat) => (
                  <li key={cat.handle}>
                    {cat.subcategories ? (
                      <>
                        <button onClick={() => setMobileExpanded(mobileExpanded === cat.handle ? null : cat.handle)}
                          className="flex w-full items-center justify-between py-3 text-sm font-medium tracking-widest uppercase text-ink">
                          {cat.label}
                          <svg className={`h-4 w-4 transition-transform ${mobileExpanded === cat.handle ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none">
                            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        {mobileExpanded === cat.handle && (
                          <ul className="mb-2 ml-3 space-y-1 border-l border-border pl-4">
                            {cat.subcategories.map((sub) => (
                              <li key={sub.handle}>
                                <Link href={`/products?category=${sub.handle}`} onClick={() => setMobileOpen(false)}
                                  className="block py-2 text-sm text-mist transition-colors hover:text-terracotta">
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link href={`/products?category=${cat.handle}`} onClick={() => setMobileOpen(false)}
                        className={`block py-3 text-sm font-medium tracking-widest uppercase transition-colors hover:text-terracotta ${cat.highlight ? 'text-terracotta' : 'text-ink'}`}>
                        {cat.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-8 border-t border-border pt-6 space-y-2">
                {user ? (
                  <>
                    {user && 'role' in user && user.role === 'admin' && (
                      <Link href="/admin" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-mist hover:text-ink">Admin Panel</Link>
                    )}
                    <Link href="/account" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-mist hover:text-ink">My Account</Link>
                    <button onClick={() => { logout(); setMobileOpen(false); }} className="block py-2 text-sm text-terracotta">Logout</button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-primary block w-full text-center">Sign In</Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

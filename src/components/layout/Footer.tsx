'use client';

import { WOMEN_CATEGORIES } from '@/data/categories';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-ink text-cream/70">
      {/* Top section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-1">
            <p
              className="mb-4 text-cream"
              style={{ fontFamily: 'var(--cormorant)', fontSize: '2rem', fontWeight: 400, letterSpacing: '0.08em' }}
            >
              ONSI
            </p>
            <p className="mb-6 text-sm leading-relaxed text-cream/50">
              Curated women&apos;s fashion inspired by global trends, delivered to your door.
            </p>
            <div className="flex gap-4">
              {['Instagram', 'TikTok', 'Facebook'].map((s) => (
                <a key={s} href="#" className="text-xs tracking-wider uppercase text-cream/30 transition-colors hover:text-cream">
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="mb-5 text-[10px] font-medium tracking-widest uppercase text-cream/40">Shop</p>
            <ul className="space-y-3">
              {WOMEN_CATEGORIES.map((cat) => (
                <li key={cat.handle}>
                  <Link
                    href={`/products?category=${cat.handle}`}
                    className={`text-sm transition-colors hover:text-cream ${cat.highlight ? 'text-terracotta' : 'text-cream/60'}`}
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="mb-5 text-[10px] font-medium tracking-widest uppercase text-cream/40">Support</p>
            <ul className="space-y-3">
              {[
                { label: 'FAQ',             href: '/faq'         },
                { label: 'Shipping Info',   href: '/shipping'    },
                { label: 'Returns',         href: '/returns'     },
                { label: 'Size Guide',      href: '/size-guide'  },
                { label: 'Contact Us',      href: '/contact'     },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-cream/60 transition-colors hover:text-cream">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="mb-5 text-[10px] font-medium tracking-widest uppercase text-cream/40">Stay Updated</p>
            <p className="mb-4 text-sm leading-relaxed text-cream/50">
              Get early access to new arrivals and exclusive offers.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder-cream/30 outline-none focus:border-cream/30"
              />
              <button
                type="submit"
                className="bg-terracotta px-4 py-3 text-xs font-medium tracking-widest uppercase text-cream transition-colors hover:bg-terracotta-hover"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-cream/30">© {new Date().getFullYear()} ONSI. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service'].map((l) => (
              <Link key={l} href="#" className="text-xs text-cream/30 transition-colors hover:text-cream/60">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

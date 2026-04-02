'use client';

import { WOMEN_CATEGORIES } from '@/data/categories';
import Link from 'next/link';

const CATEGORY_VISUALS: Record<string, { bg: string; emoji: string }> = {
  'new-in':      { bg: '#1A1714', emoji: '✦'  },
  'clothing':    { bg: '#2C2420', emoji: '👗'  },
  'shoes':       { bg: '#3A2E28', emoji: '👠'  },
  'bags':        { bg: '#2A2824', emoji: '👜'  },
  'accessories': { bg: '#28261E', emoji: '💍'  },
  'beauty':      { bg: '#2E2218', emoji: '💄'  },
  'sale':        { bg: '#C85D3A', emoji: '%'   },
};

export default function CategoriesSection() {
  const displayCats = WOMEN_CATEGORIES.slice(0, 6);

  return (
    <section className="bg-cream py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="section-label mb-2">Browse</p>
            <h2 style={{ fontFamily: 'var(--cormorant)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, lineHeight: 1.1 }}>
              Shop by Category
            </h2>
          </div>
          <Link href="/products" className="hidden text-xs font-medium tracking-widest uppercase text-mist transition-colors hover:text-terracotta sm:block">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {displayCats.map((cat) => {
            const visual = CATEGORY_VISUALS[cat.handle] || { bg: '#1A1714', emoji: '✦' };
            return (
              <Link
                key={cat.handle}
                href={`/products?category=${cat.handle}`}
                className="group relative flex aspect-[3/4] flex-col items-center justify-end overflow-hidden p-4 text-center transition-transform duration-300 hover:-translate-y-1"
                style={{ backgroundColor: visual.bg }}
              >
                {/* Subtle grain overlay */}
                <div className="pointer-events-none absolute inset-0 opacity-5"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\'/%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
                />

                <span className="mb-3 text-3xl">{visual.emoji}</span>
                <span
                  className={`text-xs font-medium tracking-widest uppercase transition-colors group-hover:text-terracotta ${
                    cat.highlight ? 'text-terracotta' : 'text-cream/80'
                  }`}
                >
                  {cat.label}
                </span>
                <div className="mt-2 h-px w-0 bg-terracotta transition-all duration-300 group-hover:w-8" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

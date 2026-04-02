'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface HeroContent {
  backgroundImage?: string;
  backgroundVideo?: string;
}

export default function HeroSection() {
  const [content, setContent] = useState<HeroContent>({});

  useEffect(() => {
    fetch('/api/content', { cache: 'no-store' })
      .then((r) => r.json())
      .then((result) => {
        if (result.success && result.data) {
          setContent({
            backgroundImage: result.data.hero_background_image,
            backgroundVideo: result.data.hero_background_video,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-ink">
      {content.backgroundVideo ? (
        <video src={content.backgroundVideo} className="absolute inset-0 h-full w-full object-cover opacity-60" autoPlay muted loop playsInline />
      ) : content.backgroundImage ? (
        <Image src={content.backgroundImage} alt="Hero" fill className="object-cover opacity-60" priority unoptimized={content.backgroundImage.startsWith('data:')} />
      ) : (
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #C85D3A 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />

      <div className="relative z-10 w-full pb-20 pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="animate-fade-in section-label mb-6 text-cream/50">Spring — Summer 2025</p>

          <h1
            className="animate-fade-in-up animation-delay-100 mb-8 text-cream"
            style={{ fontFamily: 'var(--cormorant)', fontSize: 'clamp(3.5rem, 9vw, 9rem)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            Discover<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>Your Style</em>
          </h1>

          <p className="animate-fade-in-up animation-delay-200 mb-12 max-w-md text-base leading-relaxed text-cream/70">
            Curated women&apos;s fashion — everyday essentials to statement pieces. New arrivals every week.
          </p>

          <div className="animate-fade-in-up animation-delay-300 flex flex-wrap gap-4">
            <Link href="/products" className="inline-flex items-center gap-3 border border-cream/80 px-8 py-4 text-xs font-medium tracking-widest uppercase text-cream transition-all duration-300 hover:bg-cream hover:text-ink">
              Shop All
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link href="/products?category=new-in" className="inline-flex items-center gap-3 bg-terracotta px-8 py-4 text-xs font-medium tracking-widest uppercase text-cream transition-all duration-300 hover:bg-terracotta-hover">
              New In
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-10 hidden flex-col items-center gap-2 md:flex">
        <span className="section-label text-cream/30">Scroll</span>
        <div className="h-10 w-px animate-pulse bg-cream/20" />
      </div>
    </section>
  );
}

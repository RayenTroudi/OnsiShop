import { fetchByCategory, fetchBySearch } from '@/lib/scraper/shein-api';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

interface CacheEntry {
  data: any;
  expiresAt: number;
}

// Simple in-memory cache (30 min TTL)
const cache = new Map<string, CacheEntry>();
const TTL = 30 * 60 * 1000;

function getCached(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}

function setCached(key: string, data: any) {
  cache.set(key, { data, expiresAt: Date.now() + TTL });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || '';
  const search   = searchParams.get('search')   || '';
  const page     = parseInt(searchParams.get('page')  || '1');
  const limit    = parseInt(searchParams.get('limit') || '40');

  if (!category && !search) {
    return NextResponse.json({ error: 'Provide category or search param' }, { status: 400 });
  }

  const cacheKey = category
    ? `cat:${category}:${page}:${limit}`
    : `q:${search}:${page}:${limit}`;

  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  try {
    const result = category
      ? await fetchByCategory(category, page, limit)
      : await fetchBySearch(search, page, limit);

    const payload = {
      products:   result.products,
      total:      result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
      source:     'shein',
      cached:     false,
    };

    // Only cache non-empty results
    if (result.products.length > 0) setCached(cacheKey, payload);

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error('SHEIN API error:', err?.message);
    return NextResponse.json(
      { error: 'Failed to fetch from SHEIN', details: err?.message },
      { status: 502 },
    );
  }
}

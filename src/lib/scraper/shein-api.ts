/**
 * SHEIN HTML scraper — ar.shein.com
 *
 * Strategy:
 *  1. Fetch the category/search HTML page
 *  2. Extract JSON that SHEIN embeds in <script> tags for SSR
 *  3. Fallback: parse product card elements from the DOM with cheerio
 */

import * as cheerio from 'cheerio';

export interface NormalizedProduct {
  id: string;
  title: string;
  handle: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images: string[];
  availableForSale: boolean;
  source: 'shein';
}

// ── Category page URL map ────────────────────────────────────────
const CATEGORY_URLS: Record<string, string> = {
  'new-in':      '/New-Arrivals-Women-sc-00050001.html',
  'clothing':    '/Women-sc-00217071.html',
  'dresses':     '/Women-Dresses-c-1727.html',
  'tops':        '/Women-Tops-c-1739.html',
  'bottoms':     '/Women-Bottoms-c-1740.html',
  'outerwear':   '/Women-Outerwear-Coats-c-1741.html',
  'co-ords':     '/Women-Two-piece-Outfits-c-2549.html',
  'activewear':  '/Women-Activewear-c-2398.html',
  'swimwear':    '/Women-Swimwear-c-2022.html',
  'lingerie':    '/Women-Lingerie-Sleep-c-1750.html',
  'shoes':       '/Women-Shoes-c-2403.html',
  'bags':        '/Bags-c-1748.html',
  'accessories': '/Women-Accessories-c-1757.html',
  'beauty':      '/Beauty-c-2031.html',
  'sale':        '/sale-women.html',
};

const BASE    = 'https://ar.shein.com';
const UA      = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function pageHeaders(referer = BASE + '/') {
  return {
    'User-Agent':      UA,
    'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'ar-SA,ar;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer':         referer,
    'Cache-Control':   'no-cache',
    'Pragma':          'no-cache',
  };
}

// ── Image normalizer ─────────────────────────────────────────────
function cleanImg(src: string): string {
  if (!src) return '';
  const full = src.startsWith('//') ? `https:${src}` : src;
  return full.split('?')[0];
}

// ── Slug helper ──────────────────────────────────────────────────
function toHandle(name: string, id: string) {
  return (name || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + id;
}

// ── JSON extraction from script tags ────────────────────────────
function extractFromScripts($: cheerio.CheerioAPI): NormalizedProduct[] {
  const products: NormalizedProduct[] = [];

  $('script').each((_, el) => {
    const raw = $(el).html() || '';
    if (!raw.includes('goods_id') && !raw.includes('goodsId')) return;

    // Match JSON arrays that look like product lists
    const patterns = [
      /["']?goodsList["']?\s*:\s*(\[[\s\S]*?\])/,
      /["']?goods_list["']?\s*:\s*(\[[\s\S]*?\])/,
      /["']?products["']?\s*:\s*(\[[\s\S]*?\])/,
    ];

    for (const pattern of patterns) {
      const m = raw.match(pattern);
      if (!m) continue;
      try {
        const arr = JSON.parse(m[1]) as any[];
        for (const g of arr) {
          const id    = String(g.goods_id || g.goodsId || g.id || '');
          const name  = String(g.goods_name || g.goodsName || g.name || '');
          if (!id || !name) continue;

          const sale   = parseFloat(g.salePrice?.amount || g.sale_price || g.price || '0');
          const retail = parseFloat(g.retailPrice?.amount || g.retail_price || '0');
          const img    = cleanImg(g.goods_img || g.goodsImg || g.img || '');
          const slug   = String(g.goods_url_name || g.goodsUrlName || '');

          products.push({
            id:             `shein-${id}`,
            title:          name,
            handle:         toHandle(slug || name, id),
            price:          sale,
            compareAtPrice: retail > sale ? retail : undefined,
            image:          img,
            images:         img ? [img] : [],
            availableForSale: sale > 0,
            source:         'shein',
          });
        }
        if (products.length) return false; // break .each
      } catch { /* bad JSON — continue */ }
    }
  });

  return products;
}

// ── DOM-level product card extraction ───────────────────────────
function extractFromDOM($: cheerio.CheerioAPI): NormalizedProduct[] {
  const products: NormalizedProduct[] = [];

  const ITEM_SELECTORS = [
    'a[href*="-p-"]',
    '[class*="product-item"] a',
    '[class*="ProductItem"] a',
    '[class*="product-card"] a',
    'section[data-id] a',
    'li[class*="product"] a',
  ];

  const seen = new Set<string>();
  for (const sel of ITEM_SELECTORS) {
    $(sel).each((_, el) => {
      const href = $(el).attr('href') || '';
      if (!href.includes('-p-') || seen.has(href)) return;
      seen.add(href);

      // Extract goods_id from URL like /some-name-p-12345.html
      const idMatch = href.match(/-p-(\d+)/);
      if (!idMatch) return;
      const id = idMatch[1];

      const img  = cleanImg(
        $(el).find('img').first().attr('src') ||
        $(el).find('img').first().attr('data-src') ||
        $(el).find('img').first().attr('data-original') || ''
      );

      const name =
        $(el).find('[class*="name"], [class*="title"], [class*="Name"], [class*="Title"]').first().text().trim() ||
        $(el).find('p, h3, h4').first().text().trim() ||
        'Product';

      const priceText = $(el).find('[class*="price"], [class*="Price"]').first().text().replace(/[^0-9.]/g, '');
      const price     = parseFloat(priceText) || 0;

      if (!img && !name) return;

      const slug = href.replace(/.*\//,'').replace('.html','').split('-p-')[0];
      products.push({
        id:             `shein-${id}`,
        title:          name,
        handle:         toHandle(slug || name, id),
        price,
        image:          img,
        images:         img ? [img] : [],
        availableForSale: true,
        source:         'shein',
      });
    });
    if (products.length >= 10) break;
  }

  return products;
}

// ── Core fetch + parse ───────────────────────────────────────────
async function fetchAndParse(url: string): Promise<{ products: NormalizedProduct[]; total: number }> {
  const res = await fetch(url, { headers: pageHeaders(), redirect: 'follow', cache: 'no-store' });

  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

  const html = await res.text();
  const $    = cheerio.load(html);

  // 1. Try JSON extraction (most accurate)
  let products = extractFromScripts($);

  // 2. Fall back to DOM parsing
  if (!products.length) {
    products = extractFromDOM($);
  }

  // Deduplicate by id
  const seen  = new Set<string>();
  const dedup = products.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  return { products: dedup, total: dedup.length };
}

// ── Public API ───────────────────────────────────────────────────

export async function fetchByCategory(
  categoryHandle: string,
  page = 1,
): Promise<{ products: NormalizedProduct[]; total: number }> {
  const path  = CATEGORY_URLS[categoryHandle] || CATEGORY_URLS['clothing'];
  const sep   = path.includes('?') ? '&' : '?';
  const url   = `${BASE}${path}${sep}page=${page}&limit=40`;

  return fetchAndParse(url);
}

export async function fetchBySearch(
  keywords: string,
  page = 1,
): Promise<{ products: NormalizedProduct[]; total: number }> {
  const url = `${BASE}/pdsearch/${encodeURIComponent(keywords)}.html?page=${page}`;
  return fetchAndParse(url);
}

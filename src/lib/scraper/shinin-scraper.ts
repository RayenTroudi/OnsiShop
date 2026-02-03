import * as cheerio from 'cheerio';

interface ScrapedProduct {
  name: string;
  title: string;
  handle: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants: Array<{
    size?: string;
    color?: string;
    price: number;
    stock: number;
  }>;
  category: string;
  tags: string[];
  availableForSale: boolean;
  stock: number;
}

export class ShininScraper {
  private baseUrl = 'https://roe.shein.com';

  async scrapeProductsList(page: number = 1): Promise<string[]> {
    try {
      const url = `${this.baseUrl}/Women-Clothing-c-2021.html?page=${page}`;
      console.log(`Fetching: ${url}`);

      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          Connection: 'keep-alive'
        }
      });

      if (!response.ok) {
        console.error(`HTTP ${response.status} for ${url}`);
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      console.log(`Received ${html.length} bytes of HTML`);

      const $ = cheerio.load(html);

      const productUrls: string[] = [];

      // Try multiple selectors for product links
      const selectors = [
        'a[href*="-p-"]',
        'a.S-product-item__wrapper',
        'a.product-card',
        'a[class*="product"]',
        'div.product-list a',
        'a[data-product-id]'
      ];

      for (const selector of selectors) {
        $(selector).each((_, el) => {
          const href = $(el).attr('href');
          if (href && href.includes('-p-')) {
            const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
            if (fullUrl.includes('shein.com') && !productUrls.includes(fullUrl)) {
              productUrls.push(fullUrl);
            }
          }
        });

        if (productUrls.length > 0) {
          console.log(`Found ${productUrls.length} URLs with selector: ${selector}`);
          break;
        }
      }

      console.log(`Total unique product URLs found: ${productUrls.length}`);
      return Array.from(new Set(productUrls));
    } catch (error) {
      console.error('Error scraping product list:', error);
      return [];
    }
  }

  async scrapeProduct(url: string): Promise<ScrapedProduct | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      const $ = cheerio.load(html);

      let name = $('h1.product-intro__head-name, h1[class*="product"], .product-intro__head-name')
        .first()
        .text()
        .trim();

      if (!name) {
        const scriptData = $('script')
          .filter((_, el) => {
            const text = $(el).html() || '';
            return text.includes('productIntroData') || text.includes('gbProductInfo');
          })
          .html();

        if (scriptData) {
          const nameMatch = scriptData.match(/"goods_name"\s*:\s*"([^"]+)"/);
          if (nameMatch && nameMatch[1])
            name = nameMatch[1].replace(/\\u[\dA-F]{4}/gi, (match) =>
              String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
            );
        }
      }

      if (!name) name = 'Untitled Product';

      let price = 0;
      const priceText = $(
        '.product-intro__head-price span[class*="price"], .from-price-wrap .price'
      )
        .first()
        .text()
        .trim();
      if (priceText) {
        price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
      }

      if (!price) {
        const scriptData = $('script')
          .filter((_, el) => {
            const text = $(el).html() || '';
            return text.includes('salePrice') || text.includes('retailPrice');
          })
          .html();

        if (scriptData) {
          const priceMatch = scriptData.match(
            /"salePrice"\s*:\s*\{[^}]*"amount"\s*:\s*"?([0-9.]+)"?/
          );
          if (priceMatch && priceMatch[1]) price = parseFloat(priceMatch[1]);
        }
      }

      let compareAtPrice: number | undefined;
      const comparePriceText = $('.product-intro__head-price del, .del-price')
        .first()
        .text()
        .trim();
      if (comparePriceText) {
        compareAtPrice = parseFloat(comparePriceText.replace(/[^0-9.]/g, ''));
      }

      const description =
        $('.product-intro__description, .product-intro__desc, [class*="description"]')
          .first()
          .text()
          .trim() || name;

      const images: string[] = [];
      $('img[class*="product"], .product-intro__thumb-img img').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src && !src.includes('placeholder')) {
          let fullSrc = src.startsWith('//')
            ? `https:${src}`
            : src.startsWith('http')
            ? src
            : `https:${src}`;
          const baseSrc = fullSrc.split('?')[0];
          if (baseSrc) {
            fullSrc = baseSrc.replace('_thumbnail_', '_');
          }
          if (!images.includes(fullSrc)) {
            images.push(fullSrc);
          }
        }
      });

      const category = 'Women Clothing';
      const tags: string[] = [];

      const urlParts = url.split('-p-');
      const productId = urlParts[1]?.split('.')[0] || '';
      const handle = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${productId}`;

      const availableForSale = price > 0;
      const stock = availableForSale ? 50 : 0;

      const variants: ScrapedProduct['variants'] = [{ price, stock }];

      return {
        name,
        title: name,
        handle,
        description: description.substring(0, 500),
        price,
        compareAtPrice,
        images: images.slice(0, 5),
        variants,
        category,
        tags,
        availableForSale,
        stock
      };
    } catch (error) {
      console.error(`Error scraping product ${url}:`, error);
      return null;
    }
  }

  async scrapeAllProducts(maxPages: number = 5): Promise<ScrapedProduct[]> {
    const allProducts: ScrapedProduct[] = [];
    const seenUrls = new Set<string>();

    for (let page = 1; page <= maxPages; page++) {
      console.log(`📄 Scraping page ${page}...`);
      const urls = await this.scrapeProductsList(page);

      if (urls.length === 0) {
        console.log(`No more products found on page ${page}`);
        break;
      }

      console.log(`Found ${urls.length} product URLs on page ${page}`);

      for (const url of urls) {
        if (seenUrls.has(url)) continue;
        seenUrls.add(url);

        const product = await this.scrapeProduct(url);
        if (product) {
          allProducts.push(product);
          console.log(`✅ Scraped: ${product.name} - ${product.price} DT`);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log(`\n🎉 Total products scraped: ${allProducts.length}`);
    return allProducts;
  }
}

export const shininScraper = new ShininScraper();

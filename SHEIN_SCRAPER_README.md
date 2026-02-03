# Shein Product Scraping & Import

## ⚠️ IMPORTANT LEGAL NOTICE

**WARNING:** Web scraping Shein's website may violate their Terms of Service and could infringe on their intellectual property rights (product descriptions, images, etc.). This tool is provided for **educational and testing purposes only**.

**DO NOT USE THIS FOR:**

- Commercial purposes
- Production websites
- Any activity that violates Shein's Terms of Service
- Copyright infringement

**You are responsible for ensuring your use complies with all applicable laws and terms of service.**

---

## Overview

This project includes tools to:

1. Scrape product data from Shein.com
2. Clear existing products from your Appwrite database
3. Import scraped products into your Appwrite database

## Prerequisites

1. **Environment Variables**: Ensure your `.env.local` file has:

   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=your_endpoint
   NEXT_PUBLIC_APPWRITE_PROJECT=your_project_id
   APPWRITE_API_KEY=your_api_key
   APPWRITE_DATABASE_ID=your_database_id
   APPWRITE_PRODUCTS_COLLECTION_ID=your_products_collection_id
   ```

2. **Dependencies**: Already installed (`cheerio`, `node-appwrite`)

## Available Scripts

### 1. Clear All Products

Delete all existing products from the database:

```bash
npm run products:clear
```

### 2. Scrape & Import Shein Products

Scrape products from Shein and import them (keeps existing products):

```bash
npm run products:scrape
# Or specify number of pages:
npm run products:scrape -- 5
```

### 3. Replace All Products (Recommended)

Delete all existing products and replace with Shein products:

```bash
npm run products:replace
# Or specify number of pages:
npm run products:replace -- 3
```

## Usage

### Quick Start

To replace all your current products with Shein products (2 pages):

```bash
npm run products:replace
```

To scrape more products (e.g., 5 pages):

```bash
npm run products:replace -- 5
```

### What Happens

1. **Scraping Phase**:

   - Visits Shein's women's clothing category
   - Extracts product URLs from multiple pages
   - Scrapes detailed product information for each URL
   - Rate-limited to avoid overwhelming their servers (1-2 second delays)

2. **Import Phase**:
   - Creates products in your Appwrite database
   - Maps Shein data to your product schema
   - Handles errors gracefully (continues if some products fail)

### Scraped Data

Each product includes:

- Name/Title
- Description
- Price (in DT - Tunisian Dinar)
- Compare at price (if on sale)
- Multiple product images
- Product handle (URL-friendly slug)
- Stock status
- Availability
- Tags
- Variants (sizes, colors if available)

## Limitations

1. **Rate Limiting**: Script includes delays to avoid overwhelming Shein's servers
2. **Data Accuracy**: Scraped data depends on Shein's HTML structure (may break if they change their site)
3. **Images**: Uses Shein's image URLs directly (consider downloading and hosting yourself)
4. **Legal**: Again, use at your own risk and only for testing/educational purposes

## Troubleshooting

### "HTTP 403" or "HTTP 429" errors

- Shein is blocking the requests (too many requests or detected as bot)
- Solution: Reduce the number of pages or increase delays in the scraper

### "No products found"

- Shein's HTML structure may have changed
- Solution: Update the CSS selectors in `src/lib/scraper/shinin-scraper.ts`

### Import failures

- Check your Appwrite credentials and collection schema
- Ensure the collection has all required attributes
- Check the console for specific error messages

## Technical Details

### File Structure

```
scripts/
  ├── clear-products.ts              # Delete all products
  ├── scrape-import-shein.ts         # Scrape and import (keep existing)
  └── replace-with-shein-products.ts # Clear + Scrape + Import

src/lib/scraper/
  └── shinin-scraper.ts              # Shein scraping logic
```

### Customization

To customize the scraping:

1. **Change the category**: Edit `baseUrl` and URLs in `shinin-scraper.ts`
2. **Adjust delays**: Modify `setTimeout` values in the scraper
3. **Filter products**: Add filtering logic before importing
4. **Transform data**: Modify the `importProduct` function in the scripts

## Best Practices

1. **Start Small**: Test with 1-2 pages first
2. **Verify Data**: Check imported products in your admin panel
3. **Backup**: Backup your database before running clear/replace scripts
4. **Attribution**: If you use this data, consider proper attribution to Shein
5. **Respect Robots**: Add delays, respect rate limits, and check `robots.txt`

## Alternative Approaches (Legal)

Instead of scraping, consider:

1. Using Shein's official API (if available)
2. Creating your own product database
3. Using wholesale suppliers with official APIs
4. Dropshipping platforms with legal integrations
5. Stock photo + description services designed for e-commerce

---

## License & Responsibility

This code is provided as-is for educational purposes. The authors are not responsible for:

- Any legal issues arising from web scraping
- Copyright infringement
- Terms of Service violations
- Any damages or losses

**Use responsibly and at your own risk.**

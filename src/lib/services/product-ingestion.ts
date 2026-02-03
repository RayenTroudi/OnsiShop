import { dbService } from '@/lib/appwrite/database';
import { shininScraper } from '@/lib/scraper/shinin-scraper';

export class ProductIngestionService {
  private isRunning = false;
  private lastRun: Date | null = null;

  async ingestProducts(): Promise<{
    success: boolean;
    imported: number;
    updated: number;
    errors: number;
  }> {
    if (this.isRunning) {
      throw new Error('Ingestion already running');
    }

    this.isRunning = true;
    let imported = 0;
    let updated = 0;
    let errors = 0;

    try {
      console.log('🔄 Starting product ingestion from Shinin...');

      const scrapedProducts = await shininScraper.scrapeAllProducts(10);

      console.log(`📦 Scraped ${scrapedProducts.length} products`);

      for (const scraped of scrapedProducts) {
        try {
          let category = await dbService.getCategoryByHandle(
            scraped.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          );

          if (!category) {
            category = await dbService.createCategory({
              name: scraped.category,
              handle: scraped.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              description: `Products in ${scraped.category}`
            });
          }

          const existing = await dbService.getProductByHandle(scraped.handle);

          const productData = {
            name: scraped.name,
            title: scraped.title,
            handle: scraped.handle,
            description: scraped.description,
            price: scraped.price,
            compareAtPrice: scraped.compareAtPrice,
            image: scraped.images[0] || '/placeholder-product.jpg',
            images: scraped.images,
            categoryId: category.id,
            tags: scraped.tags,
            availableForSale: scraped.availableForSale,
            stock: scraped.stock,
            variants: scraped.variants
          };

          if (existing) {
            await dbService.updateProduct(existing.id, productData);
            updated++;
            console.log(`✏️ Updated: ${scraped.name}`);
          } else {
            await dbService.createProduct(productData);
            imported++;
            console.log(`✅ Imported: ${scraped.name}`);
          }
        } catch (error) {
          console.error(`❌ Error processing ${scraped.name}:`, error);
          errors++;
        }
      }

      this.lastRun = new Date();
      console.log(
        `✨ Ingestion complete: ${imported} imported, ${updated} updated, ${errors} errors`
      );

      return { success: true, imported, updated, errors };
    } catch (error) {
      console.error('❌ Ingestion failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun
    };
  }
}

export const productIngestionService = new ProductIngestionService();

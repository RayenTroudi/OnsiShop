'use server';

import { DatabaseService } from '@/lib/database';

export async function getProductsByCollection(collection: string) {
  try {
    const db = new DatabaseService();
    const products = await db.getProducts();
    
    // Filter products by category handle
    const filteredProducts = products.filter(product => {
      const category = product.category as any;
      if (category && category.handle === collection) {
        return true;
      }
      // Fallback: match collection name with category name (case insensitive)
      if (category && category.name && category.name.toLowerCase() === collection.toLowerCase()) {
        return true;
      }
      return false;
    });
    
    // Transform to Shopify format
    return filteredProducts.map(product => db.transformToShopifyProduct(product));
  } catch (error) {
    console.error('Error fetching products by collection:', error);
    return [];
  }
}

export async function getNewArrivalsProducts(count: number = 6) {
  try {
    const db = new DatabaseService();
    const products = await db.getProducts();
    
    // Transform all products to Shopify format and sort by creation date
    const transformedProducts = products.map(product => db.transformToShopifyProduct(product));
    
    // Sort by createdAt (newest first) and take the requested count
    return transformedProducts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, count);
  } catch (error) {
    console.error('Error fetching new arrivals products:', error);
    return [];
  }
}

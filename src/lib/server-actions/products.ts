'use server';

import { dbService } from '@/lib/database';

export async function getProductsByCollection(collection: string) {
  try {
    
    const products = await dbService.getProducts();
    
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
    return filteredProducts.map(product => dbService.transformToShopifyProduct(product));
  } catch (error) {
    console.error('Error fetching products by collection:', error);
    return [];
  }
}

export async function getNewArrivalsProducts(count: number = 6) {
  try {
    
    const products = await dbService.getProducts();
    
    // Transform all products to Shopify format and sort by creation date
    const transformedProducts = products.map(product => dbService.transformToShopifyProduct(product));
    
    // Sort by createdAt (newest first) and take the requested count
    return transformedProducts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, count);
  } catch (error) {
    console.error('Error fetching new arrivals products:', error);
    return [];
  }
}

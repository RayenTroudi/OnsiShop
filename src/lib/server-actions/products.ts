'use server';

import { dbService } from '@/lib/appwrite/database';

export async function getProductsByCollection(collection: string) {
  const startTime = Date.now();
  
  try {
    console.log(`🏷️ Fetching products for collection: ${collection}`);
    
    // Use optimized method that filters at database level
    const products = await dbService.getProductsByCategory(collection);
    
    // Transform to Shopify format
    const transformedProducts = products.map(product => dbService.transformToShopifyProduct(product));
    
    const responseTime = Date.now() - startTime;
    console.log(`⚡ Collection products fetched in ${responseTime}ms (${transformedProducts.length} products)`);
    
    return transformedProducts;
  } catch (error) {
    console.error('Error fetching products by collection:', error);
    return [];
  }
}

export async function getNewArrivalsProducts(count: number = 6) {
  const startTime = Date.now();
  
  try {
    console.log(`🆕 Fetching ${count} new arrivals...`);
    
    // Use optimized method that limits at database level
    const products = await dbService.getRecentProducts(count);
    
    // Transform to Shopify format
    const transformedProducts = products.map(product => dbService.transformToShopifyProduct(product));
    
    const responseTime = Date.now() - startTime;
    console.log(`⚡ New arrivals fetched in ${responseTime}ms (${transformedProducts.length} products)`);
    
    return transformedProducts;
  } catch (error) {
    console.error('Error fetching new arrivals products:', error);
    return [];
  }
}

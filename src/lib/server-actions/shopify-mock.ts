'use server';

import { dbService } from '@/lib/appwrite/database';

export async function getShopifyMockData(query: string, variables?: any) {
  
  
  try {
    const adminProducts = await dbService.getProducts();
    const adminCategories = await dbService.getCategories();
    console.log(`Loaded ${adminProducts.length} products and ${adminCategories.length} categories from database`);
    
    if (query.includes('getProducts') || query.includes('products(')) {
      // Convert admin products to Shopify format
      const products = adminProducts.map(product => dbService.transformToShopifyProduct(product));

      return {
        status: 200,
        body: {
          data: {
            products: {
              edges: products.map(product => ({ node: product }))
            }
          }
        }
      };
    }
    
    if (query.includes('getCollectionProducts') || query.includes('collection(')) {
      // Handle collection-specific product queries
      const collectionHandle = variables?.handle;
      let filteredProducts = adminProducts;
      
      if (collectionHandle) {
        // Find products that belong to this collection/category
        filteredProducts = adminProducts.filter(product => {
          const category = product.category as any;
          if (category && category.handle === collectionHandle) {
            return true;
          }
          // Fallback: match collection name with category name (case insensitive)
          if (category && category.name && category.name.toLowerCase() === collectionHandle.toLowerCase()) {
            return true;
          }
          return false;
        });
      }
      
      // Convert to Shopify format
      const products = filteredProducts.map(product => dbService.transformToShopifyProduct(product));
      
      return {
        status: 200,
        body: {
          data: {
            collection: {
              products: {
                edges: products.map(product => ({ node: product }))
              }
            }
          }
        }
      };
    }
    
    if (query.includes('getMenu') || query.includes('menu(')) {
      // Convert categories to menu format
      const menuItems = adminCategories.map(category => ({
        title: (category as any).name || category.id,
        url: `/search/${(category as any).handle || category.id}`,
        items: [] // Add empty items array to match expected format
      }));
      
      return {
        status: 200,
        body: {
          data: {
            menu: {
              items: menuItems
            }
          }
        }
      };
    }
    
    // Default empty response for unhandled queries
    return {
      status: 200,
      body: {
        data: {}
      }
    };
  } catch (error) {
    console.error('Error loading admin data from database:', error);
    return {
      status: 200,
      body: {
        data: {}
      }
    };
  }
}

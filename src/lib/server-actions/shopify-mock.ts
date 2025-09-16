'use server';

import { DatabaseService } from '@/lib/database';

export async function getShopifyMockData(query: string, variables?: any) {
  const db = new DatabaseService();
  
  try {
    const adminProducts = await db.getProducts();
    const adminCategories = await db.getCategories();
    console.log(`Loaded ${adminProducts.length} products and ${adminCategories.length} categories from database`);
    
    if (query.includes('getProducts') || query.includes('products(')) {
      // Convert admin products to Shopify format
      const products = adminProducts.map(product => db.transformToShopifyProduct(product));

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
          if (product.category && product.category.handle === collectionHandle) {
            return true;
          }
          // Fallback: match collection name with category name (case insensitive)
          if (product.category && product.category.name.toLowerCase() === collectionHandle.toLowerCase()) {
            return true;
          }
          return false;
        });
      }
      
      // Convert to Shopify format
      const products = filteredProducts.map(product => db.transformToShopifyProduct(product));
      
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
        title: category.name,
        url: `/search/${category.handle}`,
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

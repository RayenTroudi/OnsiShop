// Server-side admin data handler for Next.js

// In-memory storage for server-side demo mode
let serverProducts: any[] = [];
let serverCategories: any[] = [];

// Initialize with sample data
function initializeServerData() {
  if (serverCategories.length === 0) {
    serverCategories = [
      {
        id: 'clothing_cat_1',
        name: 'Clothing',
        handle: 'clothing',
        description: 'All clothing items',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'accessories_cat_1', 
        name: 'Accessories',
        handle: 'accessories',
        description: 'Fashion accessories',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  if (serverProducts.length === 0) {
    serverProducts = [
      {
        id: 'sample_product_1',
        handle: 'sample-t-shirt',
        title: 'Sample T-Shirt',
        description: 'A comfortable cotton t-shirt perfect for everyday wear.',
        price: 29.99,
        category: 'clothing',
        images: ['https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=T-Shirt'],
        variants: [{
          id: 'variant_1',
          title: 'Medium / Black',
          price: 29.99,
          availableForSale: true,
          selectedOptions: [
            { name: 'Size', value: 'Medium' },
            { name: 'Color', value: 'Black' }
          ]
        }],
        tags: ['cotton', 'casual', 'comfortable'],
        availableForSale: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'sample_product_2',
        handle: 'denim-jacket',
        title: 'Classic Denim Jacket',
        description: 'A timeless denim jacket that never goes out of style.',
        price: 89.99,
        compareAtPrice: 119.99,
        category: 'clothing',
        images: ['https://via.placeholder.com/400x400/1E40AF/FFFFFF?text=Denim+Jacket'],
        variants: [{
          id: 'variant_2',
          title: 'Large / Blue',
          price: 89.99,
          availableForSale: true,
          selectedOptions: [
            { name: 'Size', value: 'Large' },
            { name: 'Color', value: 'Blue' }
          ]
        }],
        tags: ['denim', 'jacket', 'classic'],
        availableForSale: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}

export function getServerProducts() {
  initializeServerData();
  return serverProducts;
}

export function getServerCategories() {
  initializeServerData();
  return serverCategories;
}

export function addServerProduct(product: any) {
  initializeServerData();
  const newProduct = {
    ...product,
    id: 'server_product_' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  serverProducts.push(newProduct);
  return newProduct;
}

export function updateServerProduct(id: string, updates: any) {
  initializeServerData();
  const index = serverProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    serverProducts[index] = {
      ...serverProducts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return serverProducts[index];
  }
  return null;
}

export function deleteServerProduct(id: string) {
  initializeServerData();
  const index = serverProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    serverProducts.splice(index, 1);
    return true;
  }
  return false;
}

export function addServerCategory(category: any) {
  initializeServerData();
  const newCategory = {
    ...category,
    id: 'server_category_' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  serverCategories.push(newCategory);
  return newCategory;
}

export function updateServerCategory(id: string, updates: any) {
  initializeServerData();
  const index = serverCategories.findIndex(c => c.id === id);
  if (index !== -1) {
    serverCategories[index] = {
      ...serverCategories[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return serverCategories[index];
  }
  return null;
}

export function deleteServerCategory(id: string) {
  initializeServerData();
  const index = serverCategories.findIndex(c => c.id === id);
  if (index !== -1) {
    serverCategories.splice(index, 1);
    return true;
  }
  return false;
}

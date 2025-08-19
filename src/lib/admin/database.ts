// Local database simulation using localStorage for admin data management
export interface AdminProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  images: string[];
  variants: ProductVariant[];
  tags: string[];
  availableForSale: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  image?: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  handle: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// Database class for managing admin data
export class AdminDatabase {
  private static instance: AdminDatabase;
  
  static getInstance(): AdminDatabase {
    if (!AdminDatabase.instance) {
      AdminDatabase.instance = new AdminDatabase();
    }
    return AdminDatabase.instance;
  }

  // Products management
  getProducts(): AdminProduct[] {
    if (typeof window === 'undefined') return [];
    const products = localStorage.getItem('admin_products');
    return products ? JSON.parse(products) : [];
  }

  saveProducts(products: AdminProduct[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('admin_products', JSON.stringify(products));
  }

  addProduct(product: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>): AdminProduct {
    const products = this.getProducts();
    const newProduct: AdminProduct = {
      ...product,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<AdminProduct>): AdminProduct | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    const currentProduct = products[index];
    if (!currentProduct) return null;
    
    products[index] = {
      ...currentProduct,
      ...updates,
      id: currentProduct.id,
      updatedAt: new Date().toISOString(),
    } as AdminProduct;
    this.saveProducts(products);
    return products[index]!;
  }

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    if (filteredProducts.length === products.length) return false;
    this.saveProducts(filteredProducts);
    return true;
  }

  getProduct(id: string): AdminProduct | null {
    const products = this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  // Categories management
  getCategories(): AdminCategory[] {
    if (typeof window === 'undefined') return [];
    const categories = localStorage.getItem('admin_categories');
    return categories ? JSON.parse(categories) : [];
  }

  saveCategories(categories: AdminCategory[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('admin_categories', JSON.stringify(categories));
  }

  addCategory(category: Omit<AdminCategory, 'id' | 'createdAt' | 'updatedAt'>): AdminCategory {
    const categories = this.getCategories();
    const newCategory: AdminCategory = {
      ...category,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<AdminCategory>): AdminCategory | null {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    const currentCategory = categories[index];
    if (!currentCategory) return null;
    
    categories[index] = {
      ...currentCategory,
      ...updates,
      id: currentCategory.id,
      updatedAt: new Date().toISOString(),
    } as AdminCategory;
    this.saveCategories(categories);
    return categories[index]!;
  }

  deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const filteredCategories = categories.filter(c => c.id !== id);
    if (filteredCategories.length === categories.length) return false;
    this.saveCategories(filteredCategories);
    return true;
  }

  getCategory(id: string): AdminCategory | null {
    const categories = this.getCategories();
    return categories.find(c => c.id === id) || null;
  }

  // Utility methods
  private generateId(): string {
    return 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Initialize with sample data if empty
  initializeSampleData(): void {
    if (this.getProducts().length === 0) {
      this.addCategory({
        name: 'Clothing',
        handle: 'clothing',
        description: 'All clothing items'
      });

      this.addCategory({
        name: 'Accessories',
        handle: 'accessories',
        description: 'Fashion accessories'
      });

      this.addProduct({
        handle: 'sample-t-shirt',
        title: 'Sample T-Shirt',
        description: 'A comfortable cotton t-shirt',
        price: 29.99,
        category: 'clothing',
        images: ['/images/placeholder-product.jpg'],
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
        tags: ['cotton', 'casual'],
        availableForSale: true
      });
    }
  }
}

export const db = AdminDatabase.getInstance();

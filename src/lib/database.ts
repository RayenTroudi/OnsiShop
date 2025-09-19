import type * as MongoTypes from '@/types/mongodb';
import { Collections, getDatabase, isValidObjectId, toObjectId } from './mongodb';

// MongoDB Database service for products and categories
export class DatabaseService {
  
  // Category methods
  async getCategories() {
    const db = await getDatabase();
    const categories = await db.collection(Collections.CATEGORIES)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Convert ObjectId to string for each category
    return categories.map(category => ({
      ...category,
      id: category._id?.toString(),
      _id: category._id?.toString()
    }));
  }

  async getCategoryById(id: string) {
    if (!isValidObjectId(id)) return null;
    
    const db = await getDatabase();
    const category = await db.collection(Collections.CATEGORIES)
      .findOne({ _id: toObjectId(id) });
    
    if (!category) return null;
    
    return {
      ...category,
      id: category._id?.toString(),
      _id: category._id?.toString()
    };
  }

  async getCategoryByHandle(handle: string) {
    const db = await getDatabase();
    const category = await db.collection(Collections.CATEGORIES)
      .findOne({ handle });
    
    if (!category) return null;
    
    return {
      ...category,
      id: category._id?.toString(),
      _id: category._id?.toString()
    };
  }

  async createCategory(data: {
    name: string;
    handle: string;
    description?: string;
  }) {
    const db = await getDatabase();
    const now = new Date();
    
    const category = {
      ...data,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await db.collection(Collections.CATEGORIES)
      .insertOne(category);
    
    return {
      ...category,
      _id: result.insertedId.toString(),
      id: result.insertedId.toString()
    };
  }

  async updateCategory(id: string, data: {
    name?: string;
    handle?: string;
    description?: string;
  }) {
    if (!isValidObjectId(id)) return null;
    
    const db = await getDatabase();
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    const result = await db.collection(Collections.CATEGORIES)
      .findOneAndUpdate(
        { _id: toObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
    
    if (!result || !result.value) return null;
    
    return {
      ...result.value,
      id: result.value._id?.toString(),
      _id: result.value._id?.toString()
    };
  }

  async deleteCategory(id: string) {
    if (!isValidObjectId(id)) return null;
    
    const db = await getDatabase();
    const result = await db.collection(Collections.CATEGORIES)
      .findOneAndDelete({ _id: toObjectId(id) });
    
    if (!result || !result.value) return null;
    
    return {
      ...result.value,
      id: result.value._id?.toString(),
      _id: result.value._id?.toString()
    };
  }

  // Product methods
  async getProducts() {
    const db = await getDatabase();
    const products = await db.collection(Collections.PRODUCTS)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Populate category data for each product
    const productsWithCategory = await Promise.all(
      products.map(async (product) => {
        let category = null;
        if (product.categoryId && isValidObjectId(product.categoryId)) {
          category = await this.getCategoryById(product.categoryId);
        }
        
        return {
          ...product,
          id: product._id?.toString(),
          _id: product._id?.toString(),
          category
        };
      })
    );
    
    return productsWithCategory;
  }

  async getProductById(id: string) {
    if (!isValidObjectId(id)) return null;
    
    const db = await getDatabase();
    const product = await db.collection(Collections.PRODUCTS)
      .findOne({ _id: toObjectId(id) });
    
    if (!product) return null;
    
    // Populate category data
    let category = null;
    if (product.categoryId && isValidObjectId(product.categoryId)) {
      category = await this.getCategoryById(product.categoryId);
    }
    
    return {
      ...product,
      id: product._id?.toString(),
      _id: product._id?.toString(),
      category
    };
  }

  async getProductByHandle(handle: string) {
    const db = await getDatabase();
    const product = await db.collection(Collections.PRODUCTS)
      .findOne({ handle });
    
    if (!product) return null;
    
    // Populate category data
    let category = null;
    if (product.categoryId && isValidObjectId(product.categoryId)) {
      category = await this.getCategoryById(product.categoryId);
    }
    
    return {
      ...product,
      id: product._id?.toString(),
      _id: product._id?.toString(),
      category
    };
  }

  async getProductsByCategory(categoryHandle: string) {
    const db = await getDatabase();
    
    // First find the category
    const category = await this.getCategoryByHandle(categoryHandle);
    if (!category) return [];
    
    // Then find products in that category
    const products = await db.collection(Collections.PRODUCTS)
      .find({ categoryId: category.id })
      .toArray();
    
    return products.map(product => ({
      ...product,
      id: product._id?.toString(),
      _id: product._id?.toString(),
      category
    }));
  }

  async createProduct(data: {
    handle: string;
    title: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    availableForSale?: boolean;
    categoryId?: string;
    tags?: string[];
    images?: string[];
    variants?: any[];
  }) {
    const db = await getDatabase();
    const now = new Date();
    
    // Prepare data for MongoDB (store arrays as arrays, not JSON strings)
    const product = {
      name: data.title, // Set name to title for compatibility
      handle: data.handle,
      title: data.title,
      description: data.description,
      price: data.price,
      stock: 0, // Default stock
      compareAtPrice: data.compareAtPrice,
      availableForSale: data.availableForSale ?? true,
      categoryId: data.categoryId,
      tags: Array.isArray(data.tags) ? JSON.stringify(data.tags) : (data.tags ? JSON.stringify([data.tags]) : undefined),
      images: Array.isArray(data.images) ? JSON.stringify(data.images) : (data.images ? JSON.stringify([data.images]) : undefined),
      variants: Array.isArray(data.variants) ? JSON.stringify(data.variants) : (data.variants ? JSON.stringify([data.variants]) : undefined),
      createdAt: now,
      updatedAt: now
    };
    
    const result = await db.collection(Collections.PRODUCTS)
      .insertOne(product);
    
    // Populate category data
    let category = null;
    if (data.categoryId && isValidObjectId(data.categoryId)) {
      category = await this.getCategoryById(data.categoryId);
    }
    
    return {
      ...product,
      _id: result.insertedId.toString(),
      id: result.insertedId.toString(),
      category
    };
  }

  async updateProduct(id: string, data: {
    handle?: string;
    title?: string;
    description?: string;
    price?: number;
    compareAtPrice?: number;
    availableForSale?: boolean;
    categoryId?: string;
    tags?: string[];
    images?: string[];
    variants?: any[];
  }) {
    if (!isValidObjectId(id)) return null;
    
    const db = await getDatabase();
    const updateData: any = {
      ...data,
      updatedAt: new Date()
    };
    
    // Handle array fields - convert to JSON strings to match existing format
    if (data.tags !== undefined) {
      updateData.tags = data.tags ? (Array.isArray(data.tags) ? JSON.stringify(data.tags) : JSON.stringify([data.tags])) : undefined;
    }
    if (data.images !== undefined) {
      updateData.images = data.images ? (Array.isArray(data.images) ? JSON.stringify(data.images) : JSON.stringify([data.images])) : undefined;
    }
    if (data.variants !== undefined) {
      updateData.variants = data.variants ? (Array.isArray(data.variants) ? JSON.stringify(data.variants) : JSON.stringify([data.variants])) : undefined;
    }
    
    // Also update name field if title is provided
    if (data.title) {
      updateData.name = data.title;
    }
    
    const result = await db.collection(Collections.PRODUCTS)
      .findOneAndUpdate(
        { _id: toObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
    
    if (!result || !result.value) return null;
    
    // Populate category data
    let category = null;
    if (result.value.categoryId && isValidObjectId(result.value.categoryId)) {
      category = await this.getCategoryById(result.value.categoryId);
    }
    
    return {
      ...result.value,
      id: result.value._id?.toString(),
      _id: result.value._id?.toString(),
      category
    };
  }

  async deleteProduct(id: string) {
    if (!isValidObjectId(id)) return null;
    
    const db = await getDatabase();
    const result = await db.collection(Collections.PRODUCTS)
      .findOneAndDelete({ _id: toObjectId(id) });
    
    if (!result || !result.value) return null;
    
    return {
      ...result.value,
      id: result.value._id?.toString(),
      _id: result.value._id?.toString()
    };
  }

  // Utility methods
  async searchProducts(query: string) {
    const db = await getDatabase();
    const products = await db.collection(Collections.PRODUCTS)
      .find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      })
      .toArray();
    
    // Populate category data for each product
    const productsWithCategory = await Promise.all(
      products.map(async (product) => {
        let category = null;
        if (product.categoryId && isValidObjectId(product.categoryId)) {
          category = await this.getCategoryById(product.categoryId);
        }
        
        return {
          ...product,
          id: product._id?.toString(),
          _id: product._id?.toString(),
          category
        };
      })
    );
    
    return productsWithCategory;
  }

  // MongoDB Operations for other collections
  async getUserById(id: string) {
    if (!isValidObjectId(id)) return null;
    const db = await getDatabase();
    const user = await db.collection(Collections.USERS).findOne({ _id: toObjectId(id) });
    if (!user) return null;
    return { ...user, id: user._id?.toString(), _id: user._id?.toString() };
  }

  async getUserByEmail(email: string) {
    const db = await getDatabase();
    const user = await db.collection(Collections.USERS).findOne({ email });
    if (!user) return null;
    return { ...user, id: user._id?.toString(), _id: user._id?.toString() };
  }

  async createUser(data: MongoTypes.CreateDocument<MongoTypes.User>) {
    const db = await getDatabase();
    const now = new Date();
    const user = { ...data, createdAt: now, updatedAt: now };
    const result = await db.collection(Collections.USERS).insertOne(user);
    return { ...user, _id: result.insertedId.toString(), id: result.insertedId.toString() };
  }

  async updateUser(id: string, data: Partial<MongoTypes.User>) {
    if (!isValidObjectId(id)) return null;
    const db = await getDatabase();
    const result = await db.collection(Collections.USERS).findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!result || !result.value) return null;
    return { ...result.value, id: result.value._id?.toString(), _id: result.value._id?.toString() };
  }

  async deleteUser(id: string) {
    if (!isValidObjectId(id)) return null;
    const db = await getDatabase();
    const result = await db.collection(Collections.USERS).findOneAndDelete({ _id: toObjectId(id) });
    if (!result || !result.value) return null;
    return { ...result.value, id: result.value._id?.toString(), _id: result.value._id?.toString() };
  }

  async getSiteContentByKey(key: string) {
    const db = await getDatabase();
    const content = await db.collection(Collections.SITE_CONTENT).findOne({ key });
    if (!content) return null;
    return { ...content, id: content._id?.toString(), _id: content._id?.toString() };
  }

  async getAllSiteContent() {
    const db = await getDatabase();
    const contents = await db.collection(Collections.SITE_CONTENT).find({}).toArray();
    return contents.map(content => ({ ...content, id: content._id?.toString(), _id: content._id?.toString() }));
  }

  async createSiteContent(data: MongoTypes.CreateDocument<MongoTypes.SiteContent>) {
    const db = await getDatabase();
    const now = new Date();
    const content = { ...data, createdAt: now, updatedAt: now };
    const result = await db.collection(Collections.SITE_CONTENT).insertOne(content);
    return { ...content, _id: result.insertedId.toString(), id: result.insertedId.toString() };
  }

  async updateSiteContentByKey(key: string, value: string) {
    const db = await getDatabase();
    const result = await db.collection(Collections.SITE_CONTENT).findOneAndUpdate(
      { key },
      { $set: { value, updatedAt: new Date() } },
      { returnDocument: 'after', upsert: true }
    );
    if (!result || !result.value) return null;
    return { ...result.value, id: result.value._id?.toString(), _id: result.value._id?.toString() };
  }

  // Cart operations
  async getCartByUserId(userId: string) {
    const db = await getDatabase();
    const cart = await db.collection(Collections.CARTS).findOne({ userId });
    if (!cart) return null;
    return { ...cart, id: cart._id?.toString(), _id: cart._id?.toString() };
  }

  async createCart(data: MongoTypes.CreateDocument<MongoTypes.Cart>) {
    const db = await getDatabase();
    const now = new Date();
    const cart = { ...data, createdAt: now, updatedAt: now };
    const result = await db.collection(Collections.CARTS).insertOne(cart);
    return { ...cart, _id: result.insertedId.toString(), id: result.insertedId.toString() };
  }

  async getCartItems(cartId: string) {
    const db = await getDatabase();
    const items = await db.collection(Collections.CART_ITEMS).find({ cartId }).toArray();
    return items.map(item => ({ ...item, id: item._id?.toString(), _id: item._id?.toString() }));
  }

  async createCartItem(data: MongoTypes.CreateDocument<MongoTypes.CartItem>) {
    const db = await getDatabase();
    const now = new Date();
    const item = { ...data, createdAt: now, updatedAt: now };
    const result = await db.collection(Collections.CART_ITEMS).insertOne(item);
    return { ...item, _id: result.insertedId.toString(), id: result.insertedId.toString() };
  }

  async deleteCartItem(cartId: string, productId: string, variantId?: string) {
    const db = await getDatabase();
    const filter: any = { cartId, productId };
    if (variantId) filter.variantId = variantId;
    
    const result = await db.collection(Collections.CART_ITEMS).findOneAndDelete(filter);
    if (!result || !result.value) return null;
    return { ...result.value, id: result.value._id?.toString(), _id: result.value._id?.toString() };
  }

  // Orders
  async createOrder(data: MongoTypes.CreateDocument<MongoTypes.Order>) {
    const db = await getDatabase();
    const now = new Date();
    const order = { ...data, createdAt: now, updatedAt: now };
    const result = await db.collection(Collections.ORDERS).insertOne(order);
    return { ...order, _id: result.insertedId.toString(), id: result.insertedId.toString() };
  }

  // Transform database product to Shopify format
  transformToShopifyProduct(product: any) {
    let tags = [];
    let images = [];
    let variants = [];
    
    // Safely parse tags - handle both string and array formats
    try {
      if (product.tags) {
        if (typeof product.tags === 'string') {
          tags = JSON.parse(product.tags);
        } else if (Array.isArray(product.tags)) {
          tags = product.tags;
        }
      }
      if (!Array.isArray(tags)) tags = [];
    } catch (e) {
      console.warn('Failed to parse tags for product:', product.id, e);
      tags = [];
    }
    
    // Safely parse images - handle both string and array formats
    try {
      if (product.images) {
        if (typeof product.images === 'string') {
          const parsedImages = JSON.parse(product.images);
          images = Array.isArray(parsedImages) ? parsedImages : [];
        } else if (Array.isArray(product.images)) {
          images = product.images;
        }
      }
    } catch (e) {
      console.warn('Failed to parse images for product:', product.id, e);
      images = [];
    }
    
    // Safely parse variants - handle both string and array formats
    try {
      if (product.variants) {
        if (typeof product.variants === 'string') {
          const parsedVariants = JSON.parse(product.variants);
          variants = Array.isArray(parsedVariants) ? parsedVariants : [];
        } else if (Array.isArray(product.variants)) {
          variants = product.variants;
        }
      }
    } catch (e) {
      console.warn('Failed to parse variants for product:', product.id, e);
      variants = [];
    }

    return {
      id: product.id,
      handle: product.handle,
      title: product.title,
      description: product.description || '',
      descriptionHtml: product.description || '',
      availableForSale: product.availableForSale,
      priceRange: {
        minVariantPrice: { 
          amount: product.price.toString(), 
          currencyCode: 'USD' 
        },
        maxVariantPrice: { 
          amount: product.price.toString(), 
          currencyCode: 'USD' 
        }
      },
      compareAtPriceRange: product.compareAtPrice ? {
        minVariantPrice: { 
          amount: product.compareAtPrice.toString(), 
          currencyCode: 'USD' 
        },
        maxVariantPrice: { 
          amount: product.compareAtPrice.toString(), 
          currencyCode: 'USD' 
        }
      } : null,
      featuredImage: images.length > 0 ? {
        url: images[0],
        altText: product.title,
        width: 400,
        height: 400
      } : {
        url: '/images/placeholder-product.svg',
        altText: product.title,
        width: 400,
        height: 400
      },
      images: images
        .filter((image: string) => {
          // Filter out invalid images
          if (!image || typeof image !== 'string') return false;
          
          // Allow data URLs (base64 images) - they don't need file existence check
          if (image.startsWith('data:')) return true;
          
          // For local file uploads, check if file exists
          if (image.startsWith('/uploads/')) {
            try {
              const fs = require('fs');
              const path = require('path');
              const filePath = path.join(process.cwd(), 'public', image);
              return fs.existsSync(filePath);
            } catch (error) {
              console.warn('Error checking file existence for:', image, error);
              return false;
            }
          }
          
          // Allow external URLs (http/https)
          if (image.startsWith('http')) return true;
          
          return false;
        })
        .map((image: string) => ({
          url: image,
          altText: product.title,
          width: 400,
          height: 400
        })),
      variants: variants.map((variant: any) => ({
        id: variant.id,
        title: variant.title,
        availableForSale: variant.availableForSale,
        selectedOptions: variant.selectedOptions || [],
        price: { amount: variant.price?.toString() || '0', currencyCode: 'USD' },
        image: variant.image ? {
          url: variant.image,
          altText: product.title,
          width: 400,
          height: 400
        } : null
      })),
      options: variants.length > 0 ? this.extractOptions(variants) : [],
      tags,
      seo: {
        title: product.title,
        description: product.description
      },
      updatedAt: product.updatedAt.toISOString(),
      createdAt: product.createdAt.toISOString()
    };
  }

  // Extract unique options from variants
  private extractOptions(variants: any[]) {
    const optionsMap = new Map<string, Set<string>>();
    
    variants.forEach(variant => {
      if (variant.selectedOptions) {
        variant.selectedOptions.forEach((option: any) => {
          if (!optionsMap.has(option.name)) {
            optionsMap.set(option.name, new Set<string>());
          }
          optionsMap.get(option.name)!.add(option.value);
        });
      }
    });

    return Array.from(optionsMap.entries()).map(([name, values]) => ({
      id: name.toLowerCase(),
      name,
      values: Array.from(values) as string[]
    }));
  }
}

// Export the database service instance
export const dbService = new DatabaseService();

// Temporary compatibility export to prevent build errors
// This will be removed once all files are migrated
export const prisma = {
  $connect: async () => console.log("Prisma compatibility layer - connect called"),
  $disconnect: async () => console.log("Prisma compatibility layer - disconnect called"),
} as any;
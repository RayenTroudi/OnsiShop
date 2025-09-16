import { PrismaClient } from '@prisma/client';
import { getDatabaseConnection } from './db-connection';

// Use the enhanced connection utility for better PostgreSQL support
export const prisma = getDatabaseConnection();

// Keep the global reference for backward compatibility
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database service for products and categories
export class DatabaseService {
  
  // Category methods
  async getCategories() {
    return await prisma.category.findMany({
      include: {
        products: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getCategoryById(id: string) {
    return await prisma.category.findUnique({
      where: { id },
      include: {
        products: true
      }
    });
  }

  async getCategoryByHandle(handle: string) {
    return await prisma.category.findUnique({
      where: { handle },
      include: {
        products: true
      }
    });
  }

  async createCategory(data: {
    name: string;
    handle: string;
    description?: string;
  }) {
    return await prisma.category.create({
      data
    });
  }

  async updateCategory(id: string, data: {
    name?: string;
    handle?: string;
    description?: string;
  }) {
    return await prisma.category.update({
      where: { id },
      data
    });
  }

  async deleteCategory(id: string) {
    return await prisma.category.delete({
      where: { id }
    });
  }

  // Product methods
  async getProducts() {
    return await prisma.product.findMany({
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getProductById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    });
  }

  async getProductByHandle(handle: string) {
    return await prisma.product.findUnique({
      where: { handle },
      include: {
        category: true
      }
    });
  }

  async getProductsByCategory(categoryHandle: string) {
    return await prisma.product.findMany({
      where: {
        category: {
          handle: categoryHandle
        }
      },
      include: {
        category: true
      }
    });
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
    // Prepare data for PostgreSQL
    const preparedData: any = { ...data };
    
    // Handle JSON fields properly for PostgreSQL
    if (data.tags) {
      preparedData.tags = Array.isArray(data.tags) ? JSON.stringify(data.tags) : data.tags;
    }
    if (data.images) {
      preparedData.images = Array.isArray(data.images) ? JSON.stringify(data.images) : data.images;
    }
    if (data.variants) {
      preparedData.variants = Array.isArray(data.variants) ? JSON.stringify(data.variants) : data.variants;
    }

    return await prisma.product.create({
      data: preparedData,
      include: {
        category: true
      }
    });
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
    // Prepare data for PostgreSQL
    const preparedData: any = { ...data };
    
    // Handle JSON fields properly for PostgreSQL
    if (data.tags !== undefined) {
      preparedData.tags = data.tags ? (Array.isArray(data.tags) ? JSON.stringify(data.tags) : data.tags) : null;
    }
    if (data.images !== undefined) {
      preparedData.images = data.images ? (Array.isArray(data.images) ? JSON.stringify(data.images) : data.images) : null;
    }
    if (data.variants !== undefined) {
      preparedData.variants = data.variants ? (Array.isArray(data.variants) ? JSON.stringify(data.variants) : data.variants) : null;
    }

    return await prisma.product.update({
      where: { id },
      data: preparedData,
      include: {
        category: true
      }
    });
  }

  async deleteProduct(id: string) {
    return await prisma.product.delete({
      where: { id }
    });
  }

  // Utility methods
  async searchProducts(query: string) {
    return await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ]
      },
      include: {
        category: true
      }
    });
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

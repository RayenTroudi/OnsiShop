import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

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
    return await prisma.product.create({
      data: {
        ...data,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        images: data.images ? JSON.stringify(data.images) : null,
        variants: data.variants ? JSON.stringify(data.variants) : null,
      },
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
    return await prisma.product.update({
      where: { id },
      data: {
        ...data,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
        images: data.images ? JSON.stringify(data.images) : undefined,
        variants: data.variants ? JSON.stringify(data.variants) : undefined,
      },
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
    const tags = product.tags ? JSON.parse(product.tags) : [];
    const images = product.images ? JSON.parse(product.images) : [];
    const variants = product.variants ? JSON.parse(product.variants) : [];

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
        url: 'https://via.placeholder.com/400x400/E5E7EB/9CA3AF?text=No+Image',
        altText: product.title,
        width: 400,
        height: 400
      },
      images: images.map((image: string) => ({
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

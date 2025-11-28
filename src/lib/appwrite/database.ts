import { appwriteConfig, COLLECTION_IDS } from './config';
import { ID, Query, serverDatabases } from './server';

const databaseId = appwriteConfig.databaseId;

// Appwrite Database service - replaces MongoDB
export class AppwriteDbService {
  
  // ==================== CATEGORY METHODS ====================
  
  async getCategories() {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.CATEGORIES,
        [Query.orderDesc('createdAt')]
      );
      
      return response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getCategoryById(id: string) {
    try {
      const doc = await serverDatabases.getDocument(
        databaseId,
        COLLECTION_IDS.CATEGORIES,
        id
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      } as any;
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

  async getCategoryByHandle(handle: string) {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.CATEGORIES,
        [Query.equal('handle', handle)]
      );
      
      if (response.documents.length === 0) return null;
      
      const doc = response.documents[0] as any;
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error fetching category by handle:', error);
      return null;
    }
  }

  async createCategory(data: {
    name: string;
    handle: string;
    description?: string;
  }) {
    try {
      const doc = await serverDatabases.createDocument(
        databaseId,
        COLLECTION_IDS.CATEGORIES,
        ID.unique(),
        {
          name: data.name,
          handle: data.handle,
          description: data.description || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      } as any;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(id: string, data: {
    name?: string;
    handle?: string;
    description?: string;
  }) {
    try {
      const doc = await serverDatabases.updateDocument(
        databaseId,
        COLLECTION_IDS.CATEGORIES,
        id,
        {
          ...data,
          updatedAt: new Date().toISOString(),
        }
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      } as any;
    } catch (error) {
      console.error('Error updating category:', error);
      return null;
    }
  }

  async deleteCategory(id: string) {
    try {
      await serverDatabases.deleteDocument(
        databaseId,
        COLLECTION_IDS.CATEGORIES,
        id
      );
      return { id, _id: id };
    } catch (error) {
      console.error('Error deleting category:', error);
      return null;
    }
  }

  // ==================== PRODUCT METHODS ====================
  
  async getProducts() {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.PRODUCTS,
        [Query.limit(100)]
      );
      
      return response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProductById(id: string) {
    try {
      const doc = await serverDatabases.getDocument(
        databaseId,
        COLLECTION_IDS.PRODUCTS,
        id
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      } as any;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async getProductByHandle(handle: string) {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.PRODUCTS,
        [Query.equal('handle', handle)]
      );
      
      if (response.documents.length === 0) return null;
      
      const doc = response.documents[0] as any;
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error fetching product by handle:', error);
      return null;
    }
  }

  async findProductByHandleExcluding(handle: string, excludeId: string) {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.PRODUCTS,
        [Query.equal('handle', handle), Query.notEqual('$id', excludeId)]
      );
      
      if (response.documents.length === 0) return null;
      
      const doc = response.documents[0] as any;
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error finding product by handle:', error);
      return null;
    }
  }

  async getProductsByCategory(categoryHandle: string) {
    try {
      const category = await this.getCategoryByHandle(categoryHandle);
      if (!category) return [];
      
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.PRODUCTS,
        [Query.equal('categoryId', category.id)]
      );
      
      return response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
        category,
      }));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  async getRecentProducts(limit: number = 6) {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.PRODUCTS,
        [Query.equal('availableForSale', true), Query.limit(limit)]
      );
      
      return response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      }));
    } catch (error) {
      console.error('Error fetching recent products:', error);
      return [];
    }
  }

  async getProductsPaginated(options: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  } = {}) {
    try {
      const { page = 1, limit = 10, category, search } = options;
      const offset = (page - 1) * limit;
      
      const queries = [Query.limit(limit), Query.offset(offset)];
      
      if (category) {
        const categoryDoc = await this.getCategoryByHandle(category);
        if (categoryDoc) {
          queries.push(Query.equal('categoryId', categoryDoc.id));
        }
      }
      
      if (search) {
        queries.push(Query.search('title', search));
      }
      
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.PRODUCTS,
        queries
      );
      
      const categoryIds = Array.from(new Set(response.documents.map((p: any) => p.categoryId).filter(Boolean)));
      const categories = await this.getCategoriesByIds(categoryIds);
      const categoryMap = new Map(categories.filter(c => c !== null).map((c: any) => [c.id, c]));
      
      const products = response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
        category: doc.categoryId ? categoryMap.get(doc.categoryId) || null : null,
      }));
      
      return {
        products,
        totalCount: response.total,
        totalPages: Math.ceil(response.total / limit),
        currentPage: options.page || 1,
        hasNextPage: (options.page || 1) < Math.ceil(response.total / limit),
        hasPrevPage: (options.page || 1) > 1,
      };
    } catch (error) {
      console.error('Error fetching paginated products:', error);
      return {
        products: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: options.page || 1,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }
  }

  async createProduct(data: {
    handle: string;
    title: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    availableForSale?: boolean;
    images?: string[];
    stock?: number;
  }) {
    try {
      const doc = await serverDatabases.createDocument(
        databaseId,
        COLLECTION_IDS.PRODUCTS,
        ID.unique(),
        {
          handle: data.handle,
          title: data.title,
          description: data.description || '',
          price: data.price,
          stock: data.stock || 0,
          compareAtPrice: data.compareAtPrice || null,
          availableForSale: data.availableForSale ?? true,
          images: data.images || [],
        }
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      } as any;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, data: {
    handle?: string;
    title?: string;
    description?: string;
    price?: number;
    compareAtPrice?: number;
    availableForSale?: boolean;
    images?: string[];
    stock?: number;
  }) {
    try {
      const doc = await serverDatabases.updateDocument(
        databaseId,
        COLLECTION_IDS.PRODUCTS,
        id,
        data
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      } as any;
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  }

  async deleteProduct(id: string) {
    try {
      await serverDatabases.deleteDocument(
        databaseId,
        COLLECTION_IDS.PRODUCTS,
        id
      );
      return { id, _id: id };
    } catch (error) {
      console.error('Error deleting product:', error);
      return null;
    }
  }

  async searchProducts(query: string) {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.PRODUCTS,
        [Query.search('title', query), Query.limit(50)]
      );
      
      const categoryIds = Array.from(new Set(response.documents.map((p: any) => p.categoryId).filter(Boolean)));
      const categories = await this.getCategoriesByIds(categoryIds);
      const categoryMap = new Map(categories.filter(c => c !== null).map((c: any) => [c.id, c]));
      
      return response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
        category: doc.categoryId ? categoryMap.get(doc.categoryId) || null : null,
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  async countProducts(filter: any = {}) {
    try {
      const queries = [];
      if (filter.availableForSale !== undefined) {
        queries.push(Query.equal('availableForSale', filter.availableForSale));
      }
      
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.PRODUCTS,
        queries
      );
      
      return response.total;
    } catch (error) {
      console.error('Error counting products:', error);
      return 0;
    }
  }

  async countProductsWithFilter(options: any = {}) {
    const filter = options.where || {};
    return await this.countProducts(filter);
  }

  // ==================== USER METHODS ====================
  
  async getUserById(id: string) {
    try {
      const doc = await serverDatabases.getDocument(
        databaseId,
        COLLECTION_IDS.USERS,
        id
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      } as any;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async getUserByEmail(email: string) {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.USERS,
        [Query.equal('email', email)]
      );
      
      if (response.documents.length === 0) return null;
      
      const doc = response.documents[0] as any;
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  async createUser(data: any) {
    try {
      const doc = await serverDatabases.createDocument(
        databaseId,
        COLLECTION_IDS.USERS,
        ID.unique(),
        {
          accountId: data.accountId,
          email: data.email,
          name: data.name,
          role: data.role || 'user',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        }
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      } as any;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, data: any) {
    try {
      const doc = await serverDatabases.updateDocument(
        databaseId,
        COLLECTION_IDS.USERS,
        id,
        {
          ...data,
          updatedAt: new Date().toISOString(),
        }
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      } as any;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async deleteUser(id: string) {
    try {
      await serverDatabases.deleteDocument(
        databaseId,
        COLLECTION_IDS.USERS,
        id
      );
      return { id, _id: id };
    } catch (error) {
      console.error('Error deleting user:', error);
      return null;
    }
  }

  // ==================== CART METHODS ====================
  
  async getCartByUserId(userId: string) {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.CARTS,
        [Query.equal('userId', userId)]
      );
      
      if (response.documents.length === 0) return null;
      
      const doc = response.documents[0] as any;
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error fetching cart:', error);
      return null;
    }
  }

  async createCart(data: any) {
    try {
      const doc = await serverDatabases.createDocument(
        databaseId,
        COLLECTION_IDS.CARTS,
        ID.unique(),
        {
          userId: data.userId || '',
          sessionId: data.sessionId || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error creating cart:', error);
      throw error;
    }
  }

  async getCartItems(cartId: string) {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.CART_ITEMS,
        [Query.equal('cartId', cartId)]
      );
      
      return response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      }));
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return [];
    }
  }

  async createCartItem(data: any) {
    try {
      const doc = await serverDatabases.createDocument(
        databaseId,
        COLLECTION_IDS.CART_ITEMS,
        ID.unique(),
        {
          cartId: data.cartId,
          productId: data.productId,
          quantity: data.quantity,
          variantId: data.variantId || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error creating cart item:', error);
      throw error;
    }
  }

  async deleteCartItem(cartId: string, productId: string, variantId?: string) {
    try {
      const queries = [
        Query.equal('cartId', cartId),
        Query.equal('productId', productId),
      ];
      
      if (variantId) {
        queries.push(Query.equal('variantId', variantId));
      }
      
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.CART_ITEMS,
        queries
      );
      
      if (response.documents.length > 0) {
        const docId = response.documents[0]!.$id;
        await serverDatabases.deleteDocument(
          databaseId,
          COLLECTION_IDS.CART_ITEMS,
          docId
        );
        return { id: docId };
      }
      
      return null;
    } catch (error) {
      console.error('Error deleting cart item:', error);
      return null;
    }
  }

  async clearCartByUserId(userId: string) {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.CART_ITEMS,
        [Query.equal('userId', userId)]
      );
      
      for (const doc of response.documents) {
        await serverDatabases.deleteDocument(
          databaseId,
          COLLECTION_IDS.CART_ITEMS,
          doc.$id
        );
      }
      
      return { deletedCount: response.documents.length };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { deletedCount: 0 };
    }
  }

  async getCartItemById(id: string) {
    try {
      const doc = await serverDatabases.getDocument(
        databaseId,
        COLLECTION_IDS.CART_ITEMS,
        id
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error fetching cart item:', error);
      return null;
    }
  }

  async updateCartItem(id: string, data: any) {
    try {
      const doc = await serverDatabases.updateDocument(
        databaseId,
        COLLECTION_IDS.CART_ITEMS,
        id,
        {
          ...data,
          updatedAt: new Date().toISOString(),
        }
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error updating cart item:', error);
      return null;
    }
  }

  async clearCart(cartId: string) {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.CART_ITEMS,
        [Query.equal('cartId', cartId)]
      );
      
      for (const doc of response.documents) {
        await serverDatabases.deleteDocument(
          databaseId,
          COLLECTION_IDS.CART_ITEMS,
          doc.$id
        );
      }
      
      return { deletedCount: response.documents.length };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { deletedCount: 0 };
    }
  }

  // ==================== ORDER METHODS ====================
  
  async createOrder(data: any) {
    try {
      const doc = await serverDatabases.createDocument(
        databaseId,
        COLLECTION_IDS.ORDERS,
        ID.unique(),
        {
          userId: data.userId,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          shippingAddress: data.shippingAddress,
          status: data.status || 'pending',
          totalAmount: data.totalAmount,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async findManyOrders(options: any = {}) {
    try {
      const filter = options.where || {};
      const queries = [];
      
      if (filter.userId) {
        queries.push(Query.equal('userId', filter.userId));
      }
      
      if (options.orderBy?.createdAt === 'desc') {
        queries.push(Query.orderDesc('createdAt'));
      }
      
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.ORDERS,
        queries
      );
      
      return response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async findFirstOrder(options: any) {
    try {
      const filter = options.where || {};
      const queries = [];
      
      if (filter.id) {
        return await this.getOrderById(filter.id);
      }
      
      if (filter.userId) {
        queries.push(Query.equal('userId', filter.userId));
      }
      
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.ORDERS,
        [...queries, Query.limit(1)]
      );
      
      if (response.documents.length === 0) return null;
      
      const doc = response.documents[0] as any;
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error fetching first order:', error);
      return null;
    }
  }

  async updateOrder(options: any) {
    try {
      const { where, data } = options;
      const filter = where;
      
      if (filter.id) {
        const doc = await serverDatabases.updateDocument(
          databaseId,
          COLLECTION_IDS.ORDERS,
          filter.id,
          {
            ...data,
            updatedAt: new Date().toISOString(),
          }
        );
        
        return {
          ...doc,
          id: doc.$id,
          _id: doc.$id,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error updating order:', error);
      return null;
    }
  }

  async getOrderById(id: string) {
    try {
      const doc = await serverDatabases.getDocument(
        databaseId,
        COLLECTION_IDS.ORDERS,
        id
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  async getOrdersByUserId(userId: string) {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.ORDERS,
        [Query.equal('userId', userId), Query.orderDesc('createdAt')]
      );
      
      return response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      }));
    } catch (error) {
      console.error('Error fetching orders by user:', error);
      return [];
    }
  }

  async updateOrderById(id: string, data: any) {
    try {
      const doc = await serverDatabases.updateDocument(
        databaseId,
        COLLECTION_IDS.ORDERS,
        id,
        {
          ...data,
          updatedAt: new Date().toISOString(),
        }
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error updating order:', error);
      return null;
    }
  }

  // ==================== ORDER ITEM METHODS ====================
  
  async createOrderItem(data: any) {
    try {
      const doc = await serverDatabases.createDocument(
        databaseId,
        COLLECTION_IDS.ORDER_ITEMS,
        ID.unique(),
        {
          orderId: data.orderId,
          productId: data.productId,
          quantity: data.quantity,
          price: data.price,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error creating order item:', error);
      throw error;
    }
  }

  async getOrderItems(orderId: string) {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.ORDER_ITEMS,
        [Query.equal('orderId', orderId)]
      );
      
      return response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      }));
    } catch (error) {
      console.error('Error fetching order items:', error);
      return [];
    }
  }

  // ==================== SITE CONTENT METHODS ====================
  
  async getSiteContentByKey(key: string) {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.SITE_CONTENT,
        [Query.equal('key', key)]
      );
      
      if (response.documents.length === 0) return null;
      
      const doc = response.documents[0] as any;
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error fetching site content:', error);
      return null;
    }
  }

  async getAllSiteContent() {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.SITE_CONTENT
      );
      
      return response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      }));
    } catch (error) {
      console.error('Error fetching all site content:', error);
      return [];
    }
  }

  async createSiteContent(data: any) {
    try {
      const doc = await serverDatabases.createDocument(
        databaseId,
        COLLECTION_IDS.SITE_CONTENT,
        ID.unique(),
        {
          key: data.key,
          value: data.value,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error creating site content:', error);
      throw error;
    }
  }

  async updateSiteContentByKey(key: string, value: string) {
    try {
      const existing = await this.getSiteContentByKey(key);
      
      if (existing) {
        const doc = await serverDatabases.updateDocument(
          databaseId,
          COLLECTION_IDS.SITE_CONTENT,
          existing.id,
          {
            value,
            updatedAt: new Date().toISOString(),
          }
        );
        
        return {
          ...doc,
          id: doc.$id,
          _id: doc.$id,
        };
      } else {
        return await this.createSiteContent({ key, value });
      }
    } catch (error) {
      console.error('Error updating site content:', error);
      return null;
    }
  }

  async upsertSiteContent(key: string, value: string) {
    return await this.updateSiteContentByKey(key, value);
  }

  async deleteSiteContent(key: string) {
    try {
      const existing = await this.getSiteContentByKey(key);
      if (existing) {
        await serverDatabases.deleteDocument(
          databaseId,
          COLLECTION_IDS.SITE_CONTENT,
          existing.id
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting site content:', error);
      return false;
    }
  }

  async deleteSiteContentById(id: string) {
    try {
      await serverDatabases.deleteDocument(
        databaseId,
        COLLECTION_IDS.SITE_CONTENT,
        id
      );
      return true;
    } catch (error) {
      console.error('Error deleting site content by id:', error);
      return false;
    }
  }

  async updateSiteContentById(id: string, data: { key?: string; value?: string }) {
    try {
      const doc = await serverDatabases.updateDocument(
        databaseId,
        COLLECTION_IDS.SITE_CONTENT,
        id,
        {
          ...data,
          updatedAt: new Date().toISOString(),
        }
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error updating site content by id:', error);
      return null;
    }
  }

  // ==================== COMMENT METHODS ====================
  
  async findManyComments(options: any = {}) {
    try {
      const filter = options.where || {};
      const queries = [];
      
      if (filter.productId) {
        queries.push(Query.equal('productId', filter.productId));
      }
      
      if (options.orderBy?.createdAt === 'desc') {
        queries.push(Query.orderDesc('createdAt'));
      }
      
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.COMMENTS,
        queries
      );
      
      return response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  async createComment(data: any) {
    try {
      const doc = await serverDatabases.createDocument(
        databaseId,
        COLLECTION_IDS.COMMENTS,
        ID.unique(),
        {
          productId: data.productId,
          userId: data.userId,
          text: data.text,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  // ==================== RATING METHODS ====================
  
  async findManyRatings(options: any = {}) {
    try {
      const filter = options.where || {};
      const queries = [];
      
      if (filter.productId) {
        queries.push(Query.equal('productId', filter.productId));
      }
      
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.RATINGS,
        queries
      );
      
      return response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      }));
    } catch (error) {
      console.error('Error fetching ratings:', error);
      return [];
    }
  }

  async getRatingsByProductId(productId: string) {
    return await this.findManyRatings({ where: { productId } });
  }

  async createRating(data: any) {
    try {
      const doc = await serverDatabases.createDocument(
        databaseId,
        COLLECTION_IDS.RATINGS,
        ID.unique(),
        {
          productId: data.productId,
          userId: data.userId,
          stars: data.stars,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error creating rating:', error);
      throw error;
    }
  }

  async upsertRating(options: any) {
    try {
      const { where, update, create } = options;
      
      // Try to find existing rating
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.RATINGS,
        [
          Query.equal('productId', where.productId),
          Query.equal('userId', where.userId),
        ]
      );
      
      if (response.documents.length > 0) {
        // Update existing
        const doc = await serverDatabases.updateDocument(
          databaseId,
          COLLECTION_IDS.RATINGS,
          response.documents[0]!.$id,
          {
            ...update,
            updatedAt: new Date().toISOString(),
          }
        );
        
        return {
          ...doc,
          id: doc.$id,
          _id: doc.$id,
        };
      } else {
        // Create new
        return await this.createRating(create);
      }
    } catch (error) {
      console.error('Error upserting rating:', error);
      throw error;
    }
  }

  // ==================== MEDIA ASSET METHODS ====================
  
  async getMediaAssets() {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.MEDIA_ASSETS,
        [Query.orderDesc('createdAt')]
      );
      
      return response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      }));
    } catch (error) {
      console.error('Error fetching media assets:', error);
      return [];
    }
  }

  async createMediaAsset(data: any) {
    try {
      const doc = await serverDatabases.createDocument(
        databaseId,
        COLLECTION_IDS.MEDIA_ASSETS,
        ID.unique(),
        {
          filename: data.filename,
          fileId: data.fileId || '',
          url: data.url,
          alt: data.alt || '',
          type: data.type,
          section: data.section || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      console.log('✅ Media asset created:', { id: doc.$id, filename: data.filename, type: data.type });
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error creating media asset:', error);
      throw error;
    }
  }

  async deleteMediaAssets(filter: any) {
    try {
      const queries = [];
      
      if (filter.section) {
        queries.push(Query.equal('section', filter.section));
      }
      if (filter.type) {
        queries.push(Query.equal('type', filter.type));
      }
      
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.MEDIA_ASSETS,
        queries
      );
      
      let deletedCount = 0;
      for (const doc of response.documents) {
        await serverDatabases.deleteDocument(
          databaseId,
          COLLECTION_IDS.MEDIA_ASSETS,
          doc.$id
        );
        deletedCount++;
      }
      
      console.log(`🗑️ Deleted ${deletedCount} media assets`);
      return { count: deletedCount };
    } catch (error) {
      console.error('Error deleting media assets:', error);
      return { count: 0 };
    }
  }

  async getMediaAssetById(id: string) {
    try {
      const doc = await serverDatabases.getDocument(
        databaseId,
        COLLECTION_IDS.MEDIA_ASSETS,
        id
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error fetching media asset by id:', error);
      return null;
    }
  }

  async deleteMediaAssetById(id: string) {
    try {
      await serverDatabases.deleteDocument(
        databaseId,
        COLLECTION_IDS.MEDIA_ASSETS,
        id
      );
      console.log(`🗑️ Media asset ${id} deleted`);
      return true;
    } catch (error) {
      console.error('Error deleting media asset by id:', error);
      return false;
    }
  }

  // ==================== RESERVATION METHODS ====================
  
  async createReservation(data: any) {
    try {
      const doc = await serverDatabases.createDocument(
        databaseId,
        COLLECTION_IDS.RESERVATIONS,
        ID.unique(),
        {
          userId: data.userId,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          street: data.street,
          city: data.city,
          zipCode: data.zipCode,
          country: data.country,
          notes: data.notes || '',
          status: data.status || 'pending',
          totalAmount: data.totalAmount,
          items: JSON.stringify(data.items || []),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  }

  async findManyReservations(options: any = {}) {
    try {
      const filter = options.where || {};
      const queries = [];
      
      if (filter.userId) {
        queries.push(Query.equal('userId', filter.userId));
      }
      
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.RESERVATIONS,
        queries
      );
      
      return response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      }));
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return [];
    }
  }

  // ==================== HELPER METHODS ====================
  
  private async getCategoriesByIds(ids: string[]) {
    if (ids.length === 0) return [];
    
    try {
      const results = await Promise.all(
        ids.map(id => this.getCategoryById(id).catch(() => null))
      );
      return results.filter(Boolean);
    } catch (error) {
      console.error('Error fetching categories by ids:', error);
      return [];
    }
  }

  // Transform to Shopify format (compatibility)
  transformToShopifyProduct(product: any) {
    let tags = [];
    let images = [];
    let variants = [];
    
    try {
      tags = Array.isArray(product.tags) ? product.tags : [];
    } catch (e) {
      tags = [];
    }
    
    try {
      images = Array.isArray(product.images) ? product.images : [];
    } catch (e) {
      images = [];
    }
    
    try {
      if (product.variants) {
        if (typeof product.variants === 'string') {
          variants = JSON.parse(product.variants);
        } else if (Array.isArray(product.variants)) {
          variants = product.variants;
        }
      }
    } catch (e) {
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
      updatedAt: product.updatedAt,
      createdAt: product.createdAt
    };
  }

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
export const dbService = new AppwriteDbService();

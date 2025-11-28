export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '692700e000132c961806',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '692701a8001283ad4a42',
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '69270279001498a920cf',
};

export const COLLECTION_IDS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  CARTS: 'carts',
  CART_ITEMS: 'cart_items',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  SITE_CONTENT: 'site_content',
  NAVIGATION_ITEMS: 'navigation_items',
  SOCIAL_MEDIA: 'social_media',
  MEDIA_ASSETS: 'media_assets',
  RESERVATIONS: 'reservations',
  COMMENTS: 'comments',
  RATINGS: 'ratings',
  UPLOADS: 'uploads',
} as const;

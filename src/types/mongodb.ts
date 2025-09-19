// MongoDB document types for OnsiShop
// These types represent the structure of documents in MongoDB collections

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id?: string;
  name: string;
  handle: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id?: string;
  name?: string;
  handle: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  compareAtPrice?: number;
  availableForSale: boolean;
  categoryId?: string;
  tags?: string; // JSON string or string[]
  images?: string; // JSON string or string[]
  variants?: string; // JSON string or object[]
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  _id?: string;
  userId?: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  _id?: string;
  cartId: string;
  productId: string;
  quantity: number;
  variantId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id?: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  _id?: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteContent {
  _id?: string;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NavigationItem {
  _id?: string;
  name: string;
  title: string;
  url: string;
  order: number;
  isPublished: boolean;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialMedia {
  _id?: string;
  platform: string;
  title: string;
  url: string;
  iconUrl?: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaAsset {
  _id?: string;
  filename: string;
  url: string;
  alt?: string;
  type: string;
  section?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reservation {
  _id?: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  notes?: string;
  status: string;
  totalAmount: number;
  items: string; // JSON string
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id?: string;
  productId: string;
  userId: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rating {
  _id?: string;
  productId: string;
  userId: string;
  stars: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Translation {
  _id?: string;
  key: string;
  language: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

// Helper type for creating documents without _id
export type CreateDocument<T> = Omit<T, '_id'>;

// Helper type for updating documents
export type UpdateDocument<T> = Partial<Omit<T, '_id' | 'createdAt'>> & { updatedAt: Date };
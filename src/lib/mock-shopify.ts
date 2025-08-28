// Mock data and functions to replace Shopify functionality

import { NextResponse } from 'next/server';
import { Cart, Collection, Menu, Page, Product } from './types';

// Mock menu data
export const getMenu = async (handle: string): Promise<Menu[]> => {
  console.log('Demo mode: Using mock data');
  console.log(`Using mock data for query: 
  query getMenu($handle: String!) {
    menu(handle: $handle) {
      items {
        title
        url
      }
    }
  }`);
  
  // Return default menu structure
  return [
    { title: 'Best Sellers', path: '/search/best-sellers', items: [] },
    { title: 'New Arrivals', path: '/search/new-arrivals', items: [] },
    { title: 'Clothing', path: '/search/clothing', items: [] },
    { title: 'Accessories', path: '/search/accessories', items: [] },
  ];
};

// Mock collections
export const getCollections = async (): Promise<Collection[]> => {
  return [
    {
      handle: 'best-sellers',
      title: 'Best Sellers',
      description: 'Our most popular items',
      seo: { title: 'Best Sellers', description: 'Our most popular items' },
      updatedAt: new Date().toISOString(),
      path: '/search/best-sellers'
    },
    {
      handle: 'new-arrivals',
      title: 'New Arrivals',
      description: 'Latest products',
      seo: { title: 'New Arrivals', description: 'Latest products' },
      updatedAt: new Date().toISOString(),
      path: '/search/new-arrivals'
    }
  ];
};

// Mock product functions
export const getCollectionProducts = async ({ collection, reverse, sortKey }: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> => {
  // Return mock products or fetch from your database
  return [];
};

export const getProductRecommendations = async (productId: string): Promise<Product[]> => {
  // Return mock recommendations
  return [];
};

// Mock cart functions
export const getCart = async (cartId: string): Promise<Cart | null> => {
  // Return mock cart or fetch from your database
  return null;
};

export const createCart = async (): Promise<Cart> => {
  throw new Error('Use database cart system instead');
};

export const addToCart = async (cartId: string, lines: Array<{ merchandiseId: string; quantity: number }>): Promise<Cart> => {
  throw new Error('Use database cart system instead');
};

export const removeFromCart = async (cartId: string, lineIds: string[]): Promise<Cart> => {
  throw new Error('Use database cart system instead');
};

export const updateCart = async (cartId: string, lines: Array<{ id: string; merchandiseId: string; quantity: number }>): Promise<Cart> => {
  throw new Error('Use database cart system instead');
};

// Mock page functions
export const getPage = async (handle: string): Promise<Page | null> => {
  return null;
};

export const getPages = async (): Promise<Page[]> => {
  return [];
};

// Additional missing functions
export const getProducts = async (options?: any): Promise<Product[]> => {
  return [];
};

export const getCollection = async (handle: string): Promise<Collection | null> => {
  return null;
};

// Additional product functions
export const getProduct = async (handle: string): Promise<Product | null> => {
  return null;
};

// Revalidation function (placeholder)
export const revalidate = async (req: Request): Promise<NextResponse> => {
  return NextResponse.json({ revalidated: true });
};

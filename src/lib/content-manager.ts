// Unified Content Management System
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// Default content values with standardized naming
export const DEFAULT_CONTENT_VALUES = {
  // Hero Section
  hero_title: 'Welcome to Our Fashion Store',
  hero_subtitle: 'Discover the Latest Trends',
  hero_description: 'Shop our collection of high-quality clothing for men and women. From casual wear to formal attire, we have everything you need to look your best.',
  hero_button_text: 'Shop Now',
  hero_image_url: '/images/placeholder-product.svg',
  hero_background_image: '/images/placeholder-product.svg',
  hero_background_video: '',
  
  // About Section
  about_title: 'About Our Store',
  about_description: 'We are passionate about bringing you the finest clothing at affordable prices. Our curated collection features the latest trends and timeless classics.',
  about_background_image: '/images/placeholder-product.svg',
  
  // Promotions
  promotion_title: 'Winter Collection Now Available',
  promotion_subtitle: 'Stay cozy and fashionable this winter with our new collection!',
  promotion_button_text: 'View Collection',
  promotion_button_link: '/search/winter-2024',
  promotion_background_image: '/images/placeholder-product.svg',
  
  // Footer
  footer_company_name: 'OnsiShop',
  footer_description: 'Your Fashion Destination',
  
  // Contact
  contact_phone: '+1 (555) 123-4567',
  contact_email: 'contact@onsishop.com',
  contact_address: '123 Fashion Street, Style City, SC 12345'
};

// Content key mapping for section-based uploads
export const SECTION_CONTENT_MAPPING = {
  'hero': 'hero_background_video',
  'hero-background': 'hero_background_video',
  'about': 'about_background_image',
  'promotion': 'promotion_background_image',
  'promotions': 'promotion_background_image',
  'footer': 'footer_background_image'
};

// Normalize content keys (convert dots to underscores for consistency)
export function normalizeContentKey(key: string): string {
  return key.replace(/\./g, '_').toLowerCase();
}

// Get content value with fallback to default
export function getContentValue(content: Record<string, string>, key: string, defaultValue: string = ''): string {
  const normalizedKey = normalizeContentKey(key);
  
  // Try normalized key first
  if (content[normalizedKey]) {
    return content[normalizedKey] || '';
  }
  
  // Try original key
  if (content[key]) {
    return content[key] || '';
  }
  
  // Try with dots (legacy format)
  const dottedKey = key.replace(/_/g, '.');
  if (content[dottedKey]) {
    return content[dottedKey] || '';
  }
  
  // Return default value from defaults or provided default
  return DEFAULT_CONTENT_VALUES[normalizedKey as keyof typeof DEFAULT_CONTENT_VALUES] || defaultValue;
}

// Initialize default content in database
export async function initializeDefaultContent() {
  try {
    const existingContent = await prisma.siteContent.findMany();
    const existingKeys = new Set(existingContent.map(item => item.key));
    
    const toCreate = [];
    
    // Add missing default content
    for (const [key, value] of Object.entries(DEFAULT_CONTENT_VALUES)) {
      const normalizedKey = normalizeContentKey(key);
      if (!existingKeys.has(normalizedKey) && !existingKeys.has(key)) {
        toCreate.push({ key: normalizedKey, value });
      }
    }
    
    if (toCreate.length > 0) {
      await prisma.siteContent.createMany({
        data: toCreate,
        skipDuplicates: true
      });
      console.log(`Initialized ${toCreate.length} default content items`);
    }
    
  } catch (error) {
    console.error('Error initializing default content:', error);
  }
}

// Migrate legacy content keys to new format
export async function migrateLegacyContent() {
  try {
    const allContent = await prisma.siteContent.findMany();
    const updates = [];
    
    for (const item of allContent) {
      const normalizedKey = normalizeContentKey(item.key);
      
      // If the key has dots or mixed case, normalize it
      if (item.key !== normalizedKey) {
        // Check if normalized version already exists
        const existing = allContent.find(c => c.key === normalizedKey);
        
        if (!existing) {
          // Update the key to normalized version
          updates.push(
            prisma.siteContent.update({
              where: { id: item.id },
              data: { key: normalizedKey }
            })
          );
        } else {
          // Normalized version exists, delete the old one
          updates.push(
            prisma.siteContent.delete({
              where: { id: item.id }
            })
          );
        }
      }
    }
    
    if (updates.length > 0) {
      await Promise.all(updates);
      console.log(`Migrated ${updates.length} content keys`);
    }
    
  } catch (error) {
    console.error('Error migrating legacy content:', error);
  }
}

export { prisma };
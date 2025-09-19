// Unified Content Management System
import { prisma } from './database';

// Default content values with standardized naming
export const DEFAULT_CONTENT_VALUES = {
  // Hero Section
  hero_title: 'Welcome to Our Fashion Store',
  hero_subtitle: 'Discover the Latest Trends',
  hero_description: 'Shop our collection of high-quality clothing for men and women. From casual wear to formal attire, we have everything you need to look your best.',
  hero_button_text: 'Shop Now',
  hero_image_url: '',
  hero_background_image: '',
  hero_background_video: '',
  
  // About Section
  about_title: 'About Our Store',
  about_description: 'We are passionate about bringing you the finest clothing at affordable prices. Our curated collection features the latest trends and timeless classics.',
  about_background_image: '',
  
  // Promotions
  promotion_title: 'Winter Collection Now Available',
  promotion_subtitle: 'Stay cozy and fashionable this winter with our new collection!',
  promotion_button_text: 'View Collection',
  promotion_button_link: '/search/winter-2024',
  promotion_background_image: '',
  
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

// Initialize only essential default content in database
export async function initializeDefaultContent() {
  try {
    const existingContent = await prisma.siteContent.findMany();
    const existingKeys = new Set(existingContent.map((item: any) => item.key));
    
    // Only initialize critical content keys, not all defaults
    const essentialKeys = [
      'hero_background_video',
      'hero_title', 
      'hero_subtitle',
      'hero_description'
    ];
    
    // Add only missing essential content
    for (const key of essentialKeys) {
      const normalizedKey = normalizeContentKey(key);
      if (!existingKeys.has(normalizedKey) && !existingKeys.has(key)) {
        const defaultValue = DEFAULT_CONTENT_VALUES[key as keyof typeof DEFAULT_CONTENT_VALUES] || '';
        await prisma.siteContent.create({
          data: { key: normalizedKey, value: defaultValue }
        });
      }
    }
    
    console.log('Initialized essential content items');
    
  } catch (error) {
    console.error('Error initializing default content:', error);
  }
}

// Migrate legacy content keys to new format
export async function migrateLegacyContent() {
  try {
    const allContent = await prisma.siteContent.findMany();
    
    for (const item of allContent as any[]) {
      const normalizedKey = normalizeContentKey(item.key);
      
      // If the key has dots or mixed case, normalize it
      if (item.key !== normalizedKey) {
        // Check if normalized version already exists
        const existing = await prisma.siteContent.findUnique({ 
          where: { key: normalizedKey } 
        });
        
        if (!existing) {
          // Create new normalized entry and remove old one
          await prisma.siteContent.create({
            data: { key: normalizedKey, value: item.value }
          });
        }
        // Note: For now we keep old entries to avoid data loss
        // They can be manually cleaned up later
      }
    }
    
    console.log('Migrated content keys');
    
  } catch (error) {
    console.error('Error migrating legacy content:', error);
  }
}

export { prisma };

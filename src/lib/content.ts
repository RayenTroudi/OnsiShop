// lib/content.ts - Utility functions for fetching site content

/**
 * Fetch site content from the API
 * This function can be used in both server and client components
 */
export async function getSiteContent(): Promise<Record<string, string>> {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/content`, {
      cache: 'no-store', // Always fetch fresh content
    });

    if (!response.ok) {
      console.error('Failed to fetch content:', response.statusText);
      return {};
    }

    const result = await response.json();
    return result.success ? result.data || {} : {};
  } catch (error) {
    console.error('Error fetching content:', error);
    return {};
  }
}

/**
 * Get a specific content value by key with fallback
 */
export function getContentValue(
  content: Record<string, string>, 
  key: string, 
  fallback: string = ''
): string {
  return content[key] || fallback;
}

/**
 * Default content values as fallbacks
 */
export const DEFAULT_CONTENT_VALUES = {
  'hero.title': 'Welcome to Our Clothing Store',
  'hero.subtitle': 'Discover the latest fashion trends and styles',
  'hero.description': 'Shop our collection of high-quality clothing for men and women. From casual wear to formal attire, we have everything you need to look your best.',
  'hero.buttonText': 'Shop Now',
  'hero.backgroundVideo': '/videos/clothing-shoot.mp4',
  'about.title': 'Perfect blend of Japanese and Western fashion',
  'about.description': 'We strive to create pieces that are both unique and timeless and take pride in offering high-quality clothing that is both comfortable and stylish.',
  'about.buttonText': 'About Us',
  'footer.companyName': 'Clothing Store',
  'footer.description': 'Your fashion destination',
  'contact.email': 'contact@clothingstore.com',
  'contact.phone': '+1 (555) 123-4567',
  'contact.address': '123 Fashion Street, Style City, SC 12345'
} as const;

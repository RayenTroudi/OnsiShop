import { DatabaseService } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = new DatabaseService();
    
    // Use searchParams directly instead of new URL(request.url)
    const handle = request.nextUrl.searchParams.get('handle');
    
    if (handle) {
      // Get products for a specific category
      const products = await db.getProductsByCategory(handle);
      return NextResponse.json(products);
    }
    
    // Get all categories (public access)
    const categories = await db.getCategories();
    
    // Return only the essential fields for public use
    const publicCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      handle: category.handle,
      description: category.description
    }));
    
    return NextResponse.json(publicCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

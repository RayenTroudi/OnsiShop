import { prisma } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Use searchParams directly instead of new URL(request.url)
    const handle = request.nextUrl.searchParams.get('handle');
    
    if (handle) {
      // Get products for a specific category
      const products = await prisma.product.findMany({
        where: { categoryId: handle }
      }) as any[];
      return NextResponse.json(products);
    }
    
    // Get all categories (public access)
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    }) as any[];
    
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

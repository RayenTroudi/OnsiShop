import { dbService } from '@/lib/appwrite/database';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Use searchParams directly instead of new URL(request.url)
    const handle = request.nextUrl.searchParams.get('handle');
    
    if (handle) {
      // Get products for a specific category
      const products = await dbService.getProductsByCategory(handle);
      
      const responseData = JSON.stringify(products);
      const etag = `"prod-${handle}-${Buffer.from(responseData).toString('base64').slice(0, 12)}"`;
      
      return new NextResponse(responseData, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=3600', // 10 min cache, 1 hour stale
          'ETag': etag,
          'Last-Modified': new Date().toUTCString(),
          'X-Cache-Version': '1.1.0'
        }
      });
    }
    
    // Get all categories (public access)
    const categories = await dbService.getCategories();
    
    // Return only the essential fields for public use
    const publicCategories = categories.map(category => {
      const cat = category as any;
      return {
        id: cat.id,
        name: cat.name,
        handle: cat.handle,
        description: cat.description
      };
    });
    
    // Generate response with cache headers
    const responseData = JSON.stringify(publicCategories);
    const etag = `"cat-${Buffer.from(responseData).toString('base64').slice(0, 12)}"`;
    
    return new NextResponse(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=1800', // 5 min cache, 30 min stale
        'ETag': etag,
        'Last-Modified': new Date().toUTCString(),
        'X-Cache-Version': '1.1.0'
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    // Revalidate based on the type of change
    if (type === 'category') {
      revalidatePath('/'); // Home page
      revalidatePath('/search/[collection]', 'page'); // Search pages
      revalidatePath('/admin'); // Admin dashboard
      revalidatePath('/admin/categories'); // Admin categories
      revalidateTag('categories'); // All category-related cache
      
      // Also revalidate any page that uses the header
      revalidatePath('/login');
      revalidatePath('/register');
      revalidatePath('/admin/products');
    }
    
    if (type === 'product') {
      revalidatePath('/');
      revalidatePath('/search/[collection]', 'page');
      revalidatePath('/product/[handle]', 'page');
      revalidateTag('products');
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    console.error('Error during revalidation:', error);
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
  }
}

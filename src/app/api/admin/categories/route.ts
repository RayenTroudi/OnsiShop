import { requireAdmin } from '@/lib/appwrite/auth';
import { dbService } from '@/lib/appwrite/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    
    // Use nextUrl.searchParams instead of new URL(request.url)
    const id = request.nextUrl.searchParams.get('id');
    
    if (id) {
      const category = await dbService.getCategoryById(id);
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      return NextResponse.json(category);
    }
    
    const categories = await dbService.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    
    const body = await request.json();
    
    // Generate handle from name if not provided
    if (!body.handle) {
      body.handle = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    const category = await dbService.createCategory(body);
    
    // Trigger revalidation to update the UI immediately
    try {
      await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/admin/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category' })
      });
    } catch (error) {
      console.error('Failed to trigger revalidation:', error);
    }
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }
    
    const category = await dbService.updateCategory(id, updates);
    
    // Trigger revalidation to update the UI immediately
    try {
      await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/admin/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category' })
      });
    } catch (error) {
      console.error('Failed to trigger revalidation:', error);
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    
    // Use nextUrl.searchParams instead of new URL(request.url)
    const id = request.nextUrl.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }
    
    await dbService.deleteCategory(id);
    
    // Trigger revalidation to update the UI immediately
    try {
      await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/admin/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category' })
      });
    } catch (error) {
      console.error('Failed to trigger revalidation:', error);
    }
    
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}

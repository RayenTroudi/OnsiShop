import { requireAdmin } from '@/lib/appwrite/auth';
import { dbService } from '@/lib/appwrite/database';
import { deleteFileByUrl } from '@/lib/appwrite/storage';
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
      const product = await dbService.getProductById(id);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(product);
    }
    
    const products = await dbService.getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    
    const body = await request.json();
    
    // Generate handle from title if not provided
    if (!body.handle) {
      body.handle = body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    // Set default stock if not provided
    if (body.stock === undefined || body.stock === null) {
      body.stock = 100; // Default stock quantity
    }
    
    const product = await dbService.createProduct(body);
    
    // Trigger revalidation to update the UI immediately
    try {
      await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/admin/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'product' })
      });
    } catch (error) {
      console.error('Failed to trigger revalidation:', error);
    }
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    const product = await dbService.updateProduct(id, updates);
    
    // Trigger revalidation to update the UI immediately
    try {
      await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/admin/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'product' })
      });
    } catch (error) {
      console.error('Failed to trigger revalidation:', error);
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
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
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    // Get product to extract image URLs for deletion
    const product = await dbService.getProductById(id);
    
    if (product) {
      // Delete associated images from Appwrite Storage
      const imagesToDelete: string[] = [];
      
      if (product.images && Array.isArray(product.images)) {
        imagesToDelete.push(...product.images);
      } else if (typeof product.images === 'string') {
        try {
          const parsed = JSON.parse(product.images);
          if (Array.isArray(parsed)) {
            imagesToDelete.push(...parsed);
          }
        } catch {
          // Single image URL
          imagesToDelete.push(product.images);
        }
      }
      
      // Delete each image from Appwrite Storage
      for (const imageUrl of imagesToDelete) {
        if (imageUrl && typeof imageUrl === 'string' && (imageUrl.includes('appwrite.io') || imageUrl.includes('/storage/buckets/'))) {
          try {
            await deleteFileByUrl(imageUrl);
            console.log(`Deleted image from Appwrite: ${imageUrl}`);
          } catch (error) {
            console.error(`Failed to delete image from Appwrite: ${imageUrl}`, error);
            // Continue with deletion even if file deletion fails
          }
        }
      }
    }
    
    await dbService.deleteProduct(id);
    
    // Trigger revalidation to update the UI immediately
    try {
      await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/admin/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'product' })
      });
    } catch (error) {
      console.error('Failed to trigger revalidation:', error);
    }
    
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

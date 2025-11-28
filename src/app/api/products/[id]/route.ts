import { requireAdmin } from '@/lib/appwrite/auth';
import { dbService } from '@/lib/appwrite/database';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await dbService.getProductById(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Fetch ratings separately
    const ratings = await dbService.findManyRatings({
      where: { productId: params.id }
    });
    
    // Calculate average rating
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum: number, rating: any) => sum + rating.stars, 0) / ratings.length
      : null;
    
    // Transform to Shopify format with proper image structure
    const transformedProduct = dbService.transformToShopifyProduct(product);
    
    const productWithRating = {
      ...transformedProduct,
      avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    };

    return NextResponse.json(productWithRating);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a product (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const user = await requireAdmin();

    if (!user) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, title, description, price, image, categoryId } = body;

    // Check if product exists
    const existingProduct = await dbService.getProductById(id);

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!name || !title || price === undefined) {
      return NextResponse.json(
        { error: 'Name, title, and price are required fields' },
        { status: 400 }
      );
    }

    // Generate new handle if name changed
    let handle = (existingProduct as any).handle;
    if (name !== (existingProduct as any).name) {
      handle = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if new handle already exists (for other products)
      const handleExists = await dbService.findProductByHandleExcluding(handle, id);

      if (handleExists) {
        handle = `${handle}-${Date.now()}`;
      }
    }

    // Update the product
    const updatedProduct = await dbService.updateProduct(id, {
      handle,
      title,
      description: description || '',
      price: parseFloat(price),
      categoryId: categoryId || null,
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await requireAdmin();

    if (!user) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if product exists
    const existingProduct = await dbService.getProductById(id);

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete the product (this will cascade delete related comments and ratings)
    await dbService.deleteProduct(id);

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

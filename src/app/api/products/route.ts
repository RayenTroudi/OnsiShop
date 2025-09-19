import { dbService } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || '';
    const collection = searchParams.get('collection') || '';
    const search = searchParams.get('search') || '';
    
    const offset = (page - 1) * limit;

    let products: any[] = [];
    let totalCount = 0;

    if (search) {
      // Search products
      const searchResults = await dbService.searchProducts(search);
      products = searchResults.slice(offset, offset + limit);
      totalCount = searchResults.length;
    } else if (category || collection) {
      // Get products by category/collection
      const categoryHandle = category || collection;
      const categoryProducts = await dbService.getProductsByCategory(categoryHandle);
      products = categoryProducts.slice(offset, offset + limit);
      totalCount = categoryProducts.length;
    } else {
      // Get all products
      const allProducts = await dbService.getProducts();
      products = allProducts.slice(offset, offset + limit);
      totalCount = allProducts.length;
    }

    // Transform to Shopify format
    const productsWithRatings = products.map((product: any) => {
      // Transform to Shopify format with proper image structure
      const transformedProduct = dbService.transformToShopifyProduct(product);
      
      return {
        ...transformedProduct,
        avgRating: null, // TODO: Implement ratings when needed
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      products: productsWithRatings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { cookies } = await import('next/headers');
    const jwt = await import('jsonwebtoken');
    
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await dbService.getUserById(decoded.userId);

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, title, description, price, image, categoryId } = body;

    // Validate required fields
    if (!name || !title || !price) {
      return NextResponse.json(
        { error: 'Name, title, and price are required fields' },
        { status: 400 }
      );
    }

    // Generate handle from name
    const handle = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if handle already exists
    const existingProduct = await dbService.getProductByHandle(handle);

    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this name already exists' },
        { status: 400 }
      );
    }

    // Create the product
    const product = await dbService.createProduct({
      handle,
      title,
      description: description || '',
      price: parseFloat(price),
      availableForSale: true,
      categoryId: categoryId || null,
      images: image ? [image] : [],
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

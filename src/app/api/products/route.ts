import { withConnectionMonitoring } from '@/lib/connectionMonitor';
import { dbService } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/products - Get all products (optimized)
export async function GET(request: NextRequest) {
  return withConnectionMonitoring(async () => {
    const startTime = Date.now();
    
    try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || '';
    const collection = searchParams.get('collection') || '';
    const search = searchParams.get('search') || '';
    
    console.log(`🔍 Products API: page=${page}, limit=${limit}, category=${category || collection}, search=${search}`);

    // Use optimized paginated method
    const result = await dbService.getProductsPaginated({
      page,
      limit,
      category: category || collection,
      search
    });

    // Transform to Shopify format
    const productsWithRatings = result.products.map((product: any) => {
      const transformedProduct = dbService.transformToShopifyProduct(product);
      return {
        ...transformedProduct,
        avgRating: null, // TODO: Implement ratings when needed
      };
    });

    const responseTime = Date.now() - startTime;
    console.log(`⚡ Products API completed in ${responseTime}ms (${result.products.length}/${result.totalCount} products)`);

    // Add caching headers for better performance
    const response = NextResponse.json({
      products: productsWithRatings,
      pagination: {
        page: result.currentPage,
        limit,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });

    // Cache for 2 minutes in browser, 10 minutes in CDN
    response.headers.set('Cache-Control', 'public, max-age=120, s-maxage=600');
    
    return response;
    } catch (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
  }, 'GET /api/products');
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

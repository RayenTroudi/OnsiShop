import { DatabaseService, prisma } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

const db = new DatabaseService();

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
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (category) {
      where.category = {
        handle: category,
      };
    }

    if (collection) {
      where.category = {
        handle: collection,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sort] = order;

    // Fetch products with category information
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              handle: true,
            },
          },
          ratings: {
            select: {
              stars: true,
            },
          },
          _count: {
            select: {
              ratings: true,
              comments: true,
            },
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate average ratings and transform to Shopify format
    const productsWithRatings = products.map((product) => {
      const ratings = product.ratings;
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating.stars, 0) / ratings.length
        : null;

      const { ratings: _, ...productData } = product;
      
      // Transform to Shopify format with proper image structure
      const transformedProduct = db.transformToShopifyProduct(productData);
      
      return {
        ...transformedProduct,
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
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
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

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
    const existingProduct = await prisma.product.findUnique({
      where: { handle },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this name already exists' },
        { status: 400 }
      );
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        name,
        title,
        handle,
        description: description || '',
        price: parseFloat(price),
        image: image || null,
        categoryId: categoryId || null,
        availableForSale: true,
        stock: 10, // Default stock
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            handle: true,
          },
        },
      },
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

import { DatabaseService } from '@/lib/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = new DatabaseService();
    const categories = await db.getCategories();
    const products = await db.getProducts();
    
    return NextResponse.json({
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        handle: cat.handle,
        description: cat.description,
        productCount: cat.products ? cat.products.length : 0
      })),
      products: products.map(prod => ({
        id: prod.id,
        title: prod.title,
        handle: prod.handle,
        categoryName: prod.category?.name || 'No category'
      })),
      summary: {
        totalCategories: categories.length,
        totalProducts: products.length
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

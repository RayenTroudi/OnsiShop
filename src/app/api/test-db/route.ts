import { prisma } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      PRISMA_DATABASE_URL: process.env.PRISMA_DATABASE_URL ? 'Set' : 'Not set',
      POSTGRES_URL: process.env.POSTGRES_URL ? 'Set' : 'Not set'
    });

    // Test database connection
    await prisma.$connect();
    console.log('Prisma connected successfully');
    
    // Test a simple query
    const categoryCount = await prisma.category.count();
    const productCount = await prisma.product.count();
    const translationCount = await prisma.translation.count();
    
    return NextResponse.json({
      status: 'Database connection successful',
      environment: process.env.NODE_ENV,
      counts: {
        categories: categoryCount,
        products: productCount,
        translations: translationCount
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        status: 'Database connection failed',
        environment: process.env.NODE_ENV,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
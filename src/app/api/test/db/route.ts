// Test API route to check database connectivity
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Test basic queries
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    const siteContentCount = await prisma.siteContent.count();
    const translationCount = await prisma.translation.count();
    
    // Test specific data
    const categories = await prisma.category.findMany({
      take: 3
    });
    
    const translations = await prisma.translation.findMany({
      take: 5
    });
    
    const siteContent = await prisma.siteContent.findMany({
      take: 5
    });
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        counts: {
          users: userCount,
          categories: categoryCount,
          siteContent: siteContentCount,
          translations: translationCount
        },
        samples: {
          categories: categories,
          translations: translations,
          siteContent: siteContent
        }
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not Set',
        POSTGRES_URL: process.env.POSTGRES_URL ? 'Set (hidden)' : 'Not Set'
      }
    });
    
  } catch (error) {
    console.error('Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not Set',
        POSTGRES_URL: process.env.POSTGRES_URL ? 'Set (hidden)' : 'Not Set'
      }
    }, { status: 500 });
  }
}
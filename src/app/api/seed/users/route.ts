import { dbService } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

async function seedUsers() {
  try {
    console.log('🌱 Starting user seeding...');

    // Check if users already exist
    const adminUser = await dbService.getUserByEmail('admin@onsishop.com');
    const normalUser = await dbService.getUserByEmail('user@onsishop.com');

    if (adminUser && normalUser) {
      return {
        success: true,
        message: 'Users already exist - seeding skipped',
        data: {
          admin: { email: adminUser.email, id: adminUser.id },
          user: { email: normalUser.email, id: normalUser.id }
        }
      };
    }

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12);
    const userPassword = await bcrypt.hash('user123', 12);

    const results: any = { created: [] };

    // Create admin user if doesn't exist
    if (!adminUser) {
      const createdAdmin = await dbService.createUser({
        email: 'admin@onsishop.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      results.created.push({
        type: 'admin',
        id: createdAdmin.id,
        email: createdAdmin.email,
        name: createdAdmin.name,
        role: createdAdmin.role
      });
    }

    // Create normal user if doesn't exist
    if (!normalUser) {
      const createdUser = await dbService.createUser({
        email: 'user@onsishop.com',
        password: userPassword,
        name: 'Regular User',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      results.created.push({
        type: 'user',
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role
      });
    }

    return {
      success: true,
      message: 'User seeding completed successfully!',
      data: results,
      credentials: {
        admin: {
          email: 'admin@onsishop.com',
          password: 'admin123'
        },
        user: {
          email: 'user@onsishop.com',
          password: 'user123'
        }
      }
    };

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await seedUsers();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed users', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Allow GET requests as well for easy testing
  return POST(request);
}
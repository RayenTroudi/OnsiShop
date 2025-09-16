import { PrismaClient } from '@prisma/client';

// Database connection utility specifically for PostgreSQL in production
let cachedPrisma: PrismaClient;

export function getDatabaseConnection(): PrismaClient {
  if (cachedPrisma) {
    return cachedPrisma;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('🔌 Initializing database connection...');

  cachedPrisma = new PrismaClient({
    log: isProduction ? ['error'] : ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    errorFormat: 'pretty',
    // PostgreSQL specific configuration
    ...(isProduction && {
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    }),
  });

  // Handle connection errors (removed due to TypeScript compatibility)

  // Ensure proper connection handling
  if (isProduction) {
    // Test connection on startup in production
    cachedPrisma.$connect().catch((error) => {
      console.error('Failed to connect to database:', error);
      throw error;
    });
  }

  return cachedPrisma;
}

// Graceful shutdown
export async function closeDatabaseConnection() {
  if (cachedPrisma) {
    await cachedPrisma.$disconnect();
  }
}

// Connection health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const prisma = getDatabaseConnection();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Transaction helper with better error handling
export async function withTransaction<T>(
  callback: (prisma: any) => Promise<T>
): Promise<T> {
  const prisma = getDatabaseConnection();
  
  try {
    return await prisma.$transaction(callback);
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}
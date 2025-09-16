# PostgreSQL Deployment Fix Guide

This guide addresses the data update issues between local SQLite and production PostgreSQL environments.

## Issues Fixed

1. **Migration Lock File**: Updated from SQLite to PostgreSQL provider
2. **Case Sensitivity**: Added proper case-insensitive search handling for PostgreSQL
3. **JSON Field Handling**: Improved JSON field parsing for PostgreSQL compatibility
4. **Connection Management**: Enhanced database connection handling for production
5. **Build Configuration**: Updated Vercel build commands for PostgreSQL

## Files Modified

### Core Database Files
- `prisma/migrations/migration_lock.toml` - Updated to use PostgreSQL provider
- `prisma/schema.prisma` - Added PostgreSQL relation mode
- `src/lib/database.ts` - Enhanced JSON handling and connection management
- `src/lib/db-connection.ts` - New file for improved database connections

### API Routes Updated
- `src/app/api/products/route.ts` - Fixed search case sensitivity
- `src/app/api/products/list/route.ts` - Fixed search case sensitivity
- `src/app/api/products/[id]/route.ts` - Improved error handling

### Build Configuration
- `vercel.json` - Updated build commands and environment variables
- `package.json` - Added PostgreSQL fix scripts

### New Utilities
- `scripts/fix-postgres-data.ts` - Data migration utility
- `scripts/fix-postgres-migration.ts` - Schema validation utility

## Deployment Steps

### 1. Push Changes to Repository
```bash
git add .
git commit -m "Fix PostgreSQL compatibility issues"
git push origin main
```

### 2. Vercel Environment Variables
Ensure these are set in your Vercel dashboard:
- `DATABASE_URL` - Your PostgreSQL connection string
- `POSTGRES_URL` - Direct PostgreSQL URL (for migrations)
- `JWT_SECRET` - Your JWT secret key

### 3. Deploy and Run Fixes
After deployment, run the data fix script if needed:
```bash
# In Vercel dashboard or via API
npm run db:fix-postgres
```

### 4. Verify Database
Check that your data is properly updated by testing:
- Product searches work correctly
- JSON fields (tags, images, variants) parse properly
- Case-insensitive searches function as expected

## Key Improvements

### JSON Field Handling
- Now handles both string and array formats
- Proper error handling for invalid JSON
- PostgreSQL-compatible parsing

### Search Functionality
- Case-insensitive search for all text fields
- Includes tags in search results
- Compatible with PostgreSQL text matching

### Connection Management
- Improved connection pooling
- Better error handling
- Health checks for database connectivity

### Data Integrity
- Unique constraint handling
- Duplicate detection and fixing
- JSON field validation

## Troubleshooting

### Common Issues

1. **Connection Timeouts**
   - Check DATABASE_URL format
   - Verify PostgreSQL instance is running
   - Check network connectivity

2. **JSON Parsing Errors**
   - Run `npm run db:fix-postgres` to fix existing data
   - Check product data for invalid JSON

3. **Search Not Working**
   - Verify case-insensitive mode is supported
   - Check PostgreSQL version compatibility

4. **Migration Issues**
   - Ensure migration_lock.toml uses "postgresql"
   - Run migrations manually if needed

### Monitoring

Monitor these aspects after deployment:
- API response times
- Database connection health
- Error rates in logs
- Search functionality

## Performance Notes

- PostgreSQL is more strict than SQLite
- JSON operations may be slower initially
- Connection pooling improves performance
- Indexes may need optimization for large datasets

The fixes ensure your OnsiShop application works consistently between local development and production deployment on Vercel with PostgreSQL.
# Environment Variables for Vercel PostgreSQL Setup

## Correct Configuration

Based on your provided URLs, here's how you should configure your environment variables:

### In Vercel Dashboard (Production)
Set these environment variables in your Vercel project settings:

```bash
# Main database connection (use Prisma Accelerate for better performance)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19wRkZjb002WXlFSV91QUtlQWRZd24iLCJhcGlfa2V5IjoiMDFLNTk3NUsxNk43QkI5NFNTMVRIUkhOM0YiLCJ0ZW5hbnRfaWQiOiIxYzc4MTFkMjkyYjY0ODY4ZDVkMzJiNzQzMDRiNjhkZWQxNDY5NjlhYWY0NzU1OGU1OTE2ZmMzYTY5OWEwZWU4IiwiaW50ZXJuYWxfc2VjcmV0IjoiMTAwYTBlZmYtZmY0NC00MWM4LWI0NDYtOWI4ZjQzOTNjNDM4In0.pVIgpkBRLUT2feeFbV56wPVzZaAC8QxDR0OSzb_5gVA"

# Direct database connection (for migrations and schema operations)
POSTGRES_URL="postgres://1c7811d292b64868d5d32b74304b68ded146969aaf47558e5916fc3a699a0ee8:sk_pFFcoM6YyEI_uAKeAdYwn@db.prisma.io:5432/postgres?sslmode=require"

# Your JWT secret (set this to a secure random string)
JWT_SECRET="your-secure-jwt-secret-here"

# Node environment
NODE_ENV="production"
```

### For Local Development (.env.local)
Create or update your local `.env.local` file:

```bash
# For local development, use the direct connection
DATABASE_URL="postgres://1c7811d292b64868d5d32b74304b68ded146969aaf47558e5916fc3a699a0ee8:sk_pFFcoM6YyEI_uAKeAdYwn@db.prisma.io:5432/postgres?sslmode=require"
POSTGRES_URL="postgres://1c7811d292b64868d5d32b74304b68ded146969aaf47558e5916fc3a699a0ee8:sk_pFFcoM6YyEI_uAKeAdYwn@db.prisma.io:5432/postgres?sslmode=require"
JWT_SECRET="your-secure-jwt-secret-here"
NODE_ENV="development"
```

## Key Points

1. **DATABASE_URL**: Use Prisma Accelerate URL in production for better performance
2. **POSTGRES_URL**: Use direct PostgreSQL URL for migrations and schema operations
3. **Remove**: Delete the `PRISMA_DATABASE_URL` variable - it's not needed
4. **JWT_SECRET**: Make sure this is set to the same value in both environments

## Steps to Apply

1. **Update Vercel Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Update/add the variables above

2. **Update Local Environment**:
   - Update your `.env.local` file with the correct variables
   - Make sure `.env.local` is in your `.gitignore`

3. **Redeploy**:
   - Push your code changes
   - Redeploy your Vercel project
   - Run database migrations if needed

4. **Test the Connection**:
   - Visit your deployed site
   - Check that data operations work correctly
   - Monitor logs for any connection issues

## Troubleshooting

If you still have issues:

1. **Check Connection**: Use the database test endpoint at `/api/test/db`
2. **Verify Migrations**: Make sure all migrations are applied
3. **Check Logs**: Monitor Vercel function logs for database errors
4. **Run Data Fix**: Execute the PostgreSQL data fix script if needed

The Prisma Accelerate connection should provide better performance and connection pooling for your production environment.
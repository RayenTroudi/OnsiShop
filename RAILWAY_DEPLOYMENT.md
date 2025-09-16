# Railway Deployment Environment Variables

This document outlines the environment variables needed for deploying OnsiShop to Railway.

## Required Environment Variables

### Database Configuration
```
DATABASE_URL=file:./prisma/dev.db
```
For Railway, this will be automatically managed by the platform's persistent storage.

### Next.js Configuration
```
NODE_ENV=production
NEXTAUTH_URL=https://your-app-name.railway.app
BUILD_ID=latest
```

### Authentication & Security
```
NEXTAUTH_SECRET=your-nextauth-secret-key-here
JWT_SECRET=your-jwt-secret-key-here
```

### Optional Email Configuration (if using contact forms)
```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

## Setting up Environment Variables in Railway

1. **Via Railway Dashboard:**
   - Go to your project dashboard
   - Click on the "Variables" tab
   - Add each environment variable one by one

2. **Via Railway CLI:**
   ```bash
   railway variables set DATABASE_URL="file:./prisma/dev.db"
   railway variables set NODE_ENV="production"
   railway variables set NEXTAUTH_URL="https://your-app-name.railway.app"
   railway variables set NEXTAUTH_SECRET="your-nextauth-secret-key-here"
   railway variables set JWT_SECRET="your-jwt-secret-key-here"
   ```

## Important Notes

1. **Database URL**: Railway will automatically create a persistent volume for SQLite. The database file will be stored in `/app/prisma/dev.db` within the container.

2. **NEXTAUTH_URL**: Replace `your-app-name` with your actual Railway app name. This will be available after your first deployment.

3. **Secrets**: Generate strong, unique secrets for `NEXTAUTH_SECRET` and `JWT_SECRET`. You can use:
   ```bash
   openssl rand -base64 32
   ```

4. **Auto-Deploy**: Once environment variables are set, Railway will automatically trigger a new deployment.

## Deployment Steps

1. Connect your GitHub repository to Railway
2. Set all required environment variables
3. Railway will automatically:
   - Install dependencies
   - Generate Prisma client
   - Push database schema
   - Seed initial data
   - Build and deploy the application

## Database Persistence

Railway provides persistent storage for your SQLite database. The database file will persist across deployments and container restarts, ensuring your data is not lost.

## Troubleshooting

If deployment fails:

1. Check the build logs in Railway dashboard
2. Ensure all required environment variables are set
3. Verify that `DATABASE_URL` points to the correct file path
4. Make sure `NEXTAUTH_URL` matches your deployed app URL

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `NEXTAUTH_URL` with your Railway app URL
- [ ] Generate and set secure `NEXTAUTH_SECRET`
- [ ] Generate and set secure `JWT_SECRET`
- [ ] Verify `DATABASE_URL` is set correctly
- [ ] Test the deployment after setting variables
- [ ] Verify database seeding completed successfully
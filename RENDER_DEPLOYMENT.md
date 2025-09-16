# Render Deployment Guide for OnsiShop

This guide walks you through deploying your OnsiShop e-commerce application to Render.

## Prerequisites

- A GitHub repository with your OnsiShop code
- A [Render](https://render.com) account
- Your project should be ready with all dependencies installed

## Deployment Steps

### 1. Connect Your Repository

1. Log in to your Render dashboard
2. Click "New +" and select "Web Service"
3. Connect your GitHub account and select your OnsiShop repository
4. Choose the branch you want to deploy (usually `main`)

### 2. Configure Your Service

Render will automatically detect your Node.js application. Verify these settings:

- **Name**: `onsishop` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `npm run render:build`
- **Start Command**: `npm run render:start`
- **Plan**: Start with the free tier, upgrade as needed

### 3. Set Environment Variables

In the Render dashboard, add these environment variables:

#### Required Variables
```
NODE_ENV=production
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_URL=https://your-app-name.onrender.com
NEXTAUTH_SECRET=your-generated-secret-here
JWT_SECRET=your-generated-secret-here
```

#### Optional Email Variables (for contact forms)
```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### 4. Configure Persistent Storage

Since OnsiShop uses SQLite, you need persistent storage:

1. In your service settings, go to the "Disks" section
2. Add a new disk:
   - **Name**: `onsishop-disk`
   - **Mount Path**: `/opt/render/project/src/prisma`
   - **Size**: 1GB (minimum for free tier)

### 5. Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Generate Prisma client
   - Push database schema
   - Seed initial data
   - Build your Next.js application
   - Start the server

## Important Configuration Details

### Database Persistence
- Your SQLite database will be stored on the persistent disk
- Data will survive deployments and service restarts
- The database file is located at `/opt/render/project/src/prisma/dev.db`

### Build Process
The `render:build` script handles:
1. Prisma client generation
2. Database schema push
3. Next.js build optimization
4. Static asset generation

### Environment Variables Details

#### NEXTAUTH_URL
- Replace `your-app-name` with your actual Render service name
- This will be available after your first deployment
- Format: `https://your-service-name.onrender.com`

#### Secrets Generation
Generate secure secrets using:
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET  
openssl rand -base64 32
```

## Post-Deployment Setup

### 1. Verify Database
After deployment, check that your database was properly initialized:
- Admin panel should be accessible at `/admin`
- Products, categories, and content should be visible
- Translation system should work

### 2. Admin Access
- Default admin credentials are in your seed data
- Change default passwords immediately after deployment
- Test content management features

### 3. Domain Configuration
- Your app will be available at `https://your-service-name.onrender.com`
- You can add a custom domain in Render settings
- Update `NEXTAUTH_URL` if you add a custom domain

## Troubleshooting

### Build Failures
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Database Issues
- Ensure persistent disk is properly mounted
- Check that `DATABASE_URL` points to the correct path
- Verify Prisma schema is valid

### Environment Variables
- Double-check all required variables are set
- Ensure secrets are properly generated
- Verify URLs don't have trailing slashes

## Performance Optimization

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down may be slow (cold start)
- 750 hours/month of runtime

### Recommended Upgrades
- **Starter Plan**: Faster builds, no spin-down
- **Standard Plan**: More resources, better performance
- **Custom Domain**: Professional appearance

## Maintenance

### Updates
- Push changes to your GitHub repository
- Render automatically deploys from your connected branch
- Monitor deployment logs for any issues

### Database Backups
- Use the built-in backup scripts in your project
- Download backups regularly
- Consider external backup solutions for production

### Monitoring
- Check Render metrics for performance
- Monitor error logs
- Set up alerts for downtime

## Security Checklist

- [ ] Strong, unique secrets for `NEXTAUTH_SECRET` and `JWT_SECRET`
- [ ] `NODE_ENV` set to `production`
- [ ] Default admin passwords changed
- [ ] Environment variables properly configured
- [ ] Database file permissions secured
- [ ] HTTPS enabled (automatic with Render)

## Support

If you encounter issues:
1. Check Render documentation
2. Review build and runtime logs
3. Verify environment variables
4. Check GitHub repository settings
5. Contact Render support if needed

Your OnsiShop e-commerce application is now ready for production on Render!
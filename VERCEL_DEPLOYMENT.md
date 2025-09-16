# Vercel Deployment Guide for OnsiShop

This guide walks you through deploying your OnsiShop e-commerce application to Vercel with PostgreSQL.

## 🚀 **Step-by-Step Deployment Process**

### **Step 1: Set up Vercel Postgres Database**

1. **Install Vercel CLI** (already done):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Create Vercel Postgres Database**:
   ```bash
   vercel postgres create
   ```
   - Choose a name for your database (e.g., `onsishop-db`)
   - Select your preferred region (e.g., `iad1` for US East)

4. **Link your project**:
   ```bash
   vercel link
   ```

5. **Pull environment variables**:
   ```bash
   vercel env pull .env.local
   ```

### **Step 2: Configure Environment Variables**

Add these variables in your **Vercel Dashboard** (Project Settings → Environment Variables):

#### **Required Variables:**
```env
# Database (Automatically set by Vercel Postgres)
DATABASE_URL=your-postgres-connection-string
POSTGRES_PRISMA_URL=your-prisma-connection-string
POSTGRES_URL_NON_POOLING=your-non-pooling-connection-string

# Authentication
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-32-character-secret-key-here
JWT_SECRET=your-32-character-jwt-secret-here

# Environment
NODE_ENV=production
```

#### **Generate Secrets:**
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32
```

### **Step 3: Deploy to Vercel**

#### **Method 1: GitHub Integration (Recommended)**

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment with PostgreSQL"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js configuration

3. **Configure Build Settings**:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

#### **Method 2: Vercel CLI**

```bash
# Deploy to production
vercel --prod
```

### **Step 4: Post-Deployment Setup**

1. **Verify Database Connection**:
   - Check your Vercel deployment logs
   - Ensure database migration script ran successfully

2. **Access Admin Panel**:
   - Go to `https://your-app-name.vercel.app/admin`
   - Login with: `admin@onsishop.com` / `admin123`
   - **Change the password immediately!**

3. **Test Core Features**:
   - Browse products and categories
   - Test cart functionality
   - Verify admin content management
   - Check translation system

### **Step 5: Database Management**

#### **View Database**:
```bash
# Open Prisma Studio for your Vercel database
npx prisma studio
```

#### **Manual Migration** (if needed):
```bash
# Run database migration manually
vercel env pull .env.local
npx tsx scripts/vercel-migrate.ts
```

#### **Add More Data**:
```bash
# Run additional seeding scripts
npm run db:seed-all
```

## 📋 **Deployment Configuration Files**

### **vercel.json** ✅
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"]
}
```

### **next.config.js** ✅
```javascript
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"]
  },
  // ... other configurations
}
```

### **prisma/schema.prisma** ✅
```prisma
datasource db {
  provider = "postgresql"  // ✅ Updated from sqlite
  url      = env("DATABASE_URL")
}
```

## 🔧 **Troubleshooting**

### **Build Errors**

1. **Prisma Client Issues**:
   ```bash
   # Regenerate Prisma client
   npx prisma generate
   ```

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` is set correctly
   - Check Vercel Postgres dashboard for connection details

3. **Environment Variables**:
   - Ensure all required variables are set in Vercel dashboard
   - Redeploy after adding new environment variables

### **Runtime Errors**

1. **Database Not Found**:
   ```bash
   # Push database schema
   npx prisma db push
   ```

2. **Seeding Issues**:
   ```bash
   # Run migration script manually
   npx tsx scripts/vercel-migrate.ts
   ```

## 🎯 **Performance Optimization**

### **Database Optimization**:
- Use connection pooling (enabled by default with Vercel Postgres)
- Implement proper database indexing
- Use Prisma's query optimization features

### **Vercel Features**:
- **Edge Functions**: For faster API responses
- **Image Optimization**: Automatic with Next.js
- **CDN**: Global content delivery
- **Analytics**: Monitor performance

## 📊 **Monitoring & Maintenance**

### **Vercel Dashboard**:
- Monitor deployment logs
- Check function performance
- View analytics and insights

### **Database Monitoring**:
- Monitor connection usage
- Check query performance
- Backup important data regularly

## 🔒 **Security Checklist**

- [ ] Strong, unique secrets for `NEXTAUTH_SECRET` and `JWT_SECRET`
- [ ] Default admin password changed
- [ ] Environment variables properly configured
- [ ] Database connection secured with SSL
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Admin routes properly protected

## 🎉 **You're All Set!**

Your OnsiShop is now deployed on Vercel with:
✅ PostgreSQL database  
✅ Automatic deployments  
✅ Global CDN  
✅ SSL/HTTPS  
✅ Admin panel  
✅ Dynamic content management  
✅ Multi-language support  

**Admin Access**: `https://your-app-name.vercel.app/admin`  
**Credentials**: `admin@onsishop.com` / `admin123` (change immediately!)

## 🆘 **Need Help?**

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

Your OnsiShop e-commerce application is now live and ready for customers! 🛍️
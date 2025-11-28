# Admin User Test Guide

## Admin User Credentials
- **Email**: admin@onsishop.com
- **Password**: Admin123!@#
- **Role**: admin
- **Account ID**: 6929b586003751ef22c0

## Testing Steps

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test Admin Login
1. Navigate to: http://localhost:3000/login
2. Enter credentials:
   - Email: admin@onsishop.com
   - Password: Admin123!@#
3. Click "Login"
4. You should be redirected to the homepage or dashboard

### 3. Test Hero Video Management
1. Navigate to: http://localhost:3000/admin/hero-video
2. You should see the hero video management interface
3. Try uploading a new video or changing the current video
4. Verify the changes are reflected on the homepage

### 4. Verify Admin Access
The following routes should be accessible:
- http://localhost:3000/admin - Admin dashboard
- http://localhost:3000/admin/products - Product management
- http://localhost:3000/admin/categories - Category management  
- http://localhost:3000/admin/content - Content management
- http://localhost:3000/admin/hero-video - Hero video management

### 5. API Endpoints to Test
You can use curl or Postman to test the API:

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@onsishop.com","password":"Admin123!@#"}'
```

#### Get Current Hero Video (Public)
```bash
curl http://localhost:3000/api/admin/hero-video
```

#### Update Hero Video (Requires Admin - after login)
```bash
curl -X POST http://localhost:3000/api/admin/hero-video \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie-here" \
  -d '{"videoUrl":"https://example.com/video.mp4"}'
```

## Troubleshooting

### If login fails:
1. Check that the Appwrite account exists: Run `node scripts/appwrite/list-users.ts`
2. Verify the user document: Check the users collection in Appwrite console
3. Ensure accountId matches between Appwrite account and user document

### If admin access is denied:
1. Verify the user role is 'admin' in the database
2. Check browser console for auth errors
3. Clear cookies and try logging in again

## Security Notes
⚠️ **IMPORTANT**: Change the default password after first login!

The default password `Admin123!@#` should only be used for initial testing.

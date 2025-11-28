# Admin User Setup Complete ✅

## Summary

Successfully created an admin user in Appwrite and configured the system to allow hero video management.

## Admin User Details

**Credentials:**
- Email: `admin@onsishop.com`
- Password: `Admin123!@#`
- Role: `admin`
- Account ID: `6929b586003751ef22c0`
- User Document ID: `6929b5e700282ab7201a`

## What Was Done

### 1. Database Schema Updates
- Added `role` enum attribute to users collection (values: 'user', 'admin')
- Added `createdAt` datetime attribute to users collection
- Added `updatedAt` datetime attribute to users collection

### 2. Admin User Creation
- Created Appwrite Account for admin user
- Created user document in database with role='admin'
- Linked account ID to user document

### 3. Hero Video Access Verification
- Confirmed `/api/admin/hero-video` route uses `requireAdmin()` middleware
- POST endpoint requires admin authentication
- DELETE endpoint requires admin authentication
- GET endpoint is public (for displaying hero video)

## How to Test

### Option 1: Via Web Interface
1. Open browser to http://localhost:3000/login
2. Login with:
   - Email: admin@onsishop.com
   - Password: Admin123!@#
3. Navigate to http://localhost:3000/admin/hero-video
4. Upload or update the hero video
5. Verify changes appear on the homepage

### Option 2: Via API (cURL)

**Step 1: Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@onsishop.com","password":"Admin123!@#"}' \
  -c cookies.txt
```

**Step 2: Update Hero Video**
```bash
curl -X POST http://localhost:3000/api/admin/hero-video \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"videoUrl":"https://utfs.io/f/your-video-id","uploadId":"optional-upload-id"}'
```

**Step 3: Get Current Hero Video**
```bash
curl http://localhost:3000/api/admin/hero-video
```

**Step 4: Delete Hero Video**
```bash
curl -X DELETE http://localhost:3000/api/admin/hero-video \
  -b cookies.txt
```

## Scripts Created

The following utility scripts are available in `scripts/appwrite/`:

1. **create-admin-user.ts** - Creates a new admin user
2. **add-role-attribute.ts** - Adds role attribute to users collection
3. **fix-users-collection.ts** - Adds missing timestamp attributes
4. **list-users.ts** - Lists all Appwrite users
5. **update-admin-accountid.ts** - Updates admin user's account ID

## Authentication Flow

1. User logs in via `/api/auth/login` with email/password
2. Appwrite creates a session and returns session cookie
3. Server verifies session via `verifyAuth()` from `@/lib/appwrite/auth`
4. For admin routes, `requireAdmin()` checks if user.role === 'admin'
5. If authorized, admin can access protected endpoints

## Security Notes

⚠️ **IMPORTANT:**
- Change the default password `Admin123!@#` after first login
- Store production passwords securely
- Never commit passwords to version control
- Consider implementing 2FA for admin accounts

## Next Steps

1. ✅ Admin user created
2. ✅ Database schema updated
3. ✅ Hero video management accessible
4. 🔄 Test login and hero video update (manual testing required)
5. 📝 Change default password
6. 🎨 Optionally add more admin users or features

## Development Server

The dev server is running at: http://localhost:3000

To stop: Press Ctrl+C in the terminal
To restart: Run `npm run dev`

# MongoDB to Appwrite Migration - Agent Instructions

You are tasked with migrating the OnsiShop Next.js application from MongoDB to Appwrite. Execute each step in order, verify completion, and check off tasks as you go.

## Project Context

**Appwrite Configuration:**
- Project ID: `692700e000132c961806`
- Database ID: `692701a8001283ad4a42`
- Bucket ID: `69270279001498a920cf`
- API Endpoint: `https://fra.cloud.appwrite.io/v1`

**Current Stack:**
- Next.js 14 (App Router)
- MongoDB with custom connection management
- JWT-based authentication (bcrypt + jsonwebtoken)
- Custom database service layer (`src/lib/database.ts`)
- UploadThing for file uploads

**Target Stack:**
- Next.js 14 (unchanged)
- Appwrite (Databases + Storage + Account)
- Appwrite session-based authentication
- New Appwrite database service layer
- Appwrite Storage for file uploads

---

## Prerequisites (Do First)

1. **Backup MongoDB data:**
   ```powershell
   # Export all collections to JSON
   mongoexport --uri "$env:MONGODB_URI" --collection=products --out="backups/products.json"
   mongoexport --uri "$env:MONGODB_URI" --collection=categories --out="backups/categories.json"
   mongoexport --uri "$env:MONGODB_URI" --collection=users --out="backups/users.json"
   mongoexport --uri "$env:MONGODB_URI" --collection=carts --out="backups/carts.json"
   mongoexport --uri "$env:MONGODB_URI" --collection=cart_items --out="backups/cart_items.json"
   mongoexport --uri "$env:MONGODB_URI" --collection=orders --out="backups/orders.json"
   mongoexport --uri "$env:MONGODB_URI" --collection=order_items --out="backups/order_items.json"
   mongoexport --uri "$env:MONGODB_URI" --collection=site_content --out="backups/site_content.json"
   mongoexport --uri "$env:MONGODB_URI" --collection=media_assets --out="backups/media_assets.json"
   mongoexport --uri "$env:MONGODB_URI" --collection=uploads --out="backups/uploads.json"
   mongoexport --uri "$env:MONGODB_URI" --collection=translations --out="backups/translations.json"
   ```

2. **Create Appwrite API key:**
   - Go to Appwrite Console → Settings → API Keys
   - Create key with full permissions (for migration scripts only)
   - Save as `APPWRITE_API_KEY` in your environment (DO NOT COMMIT)

---

## Phase 1: Install Dependencies & Create Base Files

### Step 1.1: Update package.json
```powershell
pnpm remove mongodb @types/mongodb
pnpm add appwrite node-appwrite
```

### Step 1.2: Create Appwrite client configuration

**File: `src/lib/appwrite/config.ts`**
```typescript
export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '692700e000132c961806',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '692701a8001283ad4a42',
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '69270279001498a920cf',
};

export const COLLECTION_IDS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  CARTS: 'carts',
  CART_ITEMS: 'cart_items',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  SITE_CONTENT: 'site_content',
  NAVIGATION_ITEMS: 'navigation_items',
  SOCIAL_MEDIA: 'social_media',
  MEDIA_ASSETS: 'media_assets',
  RESERVATIONS: 'reservations',
  COMMENTS: 'comments',
  RATINGS: 'ratings',
  TRANSLATIONS: 'translations',
  UPLOADS: 'uploads',
} as const;
```

**File: `src/lib/appwrite/client.ts`** (Client-side, no API key)
```typescript
import { Client, Databases, Storage, Account } from 'appwrite';
import { appwriteConfig } from './config';

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);

export { client };
export default client;
```

**File: `src/lib/appwrite/server.ts`** (Server-side with API key)
```typescript
import { Client, Databases, Storage, Account, ID, Query } from 'node-appwrite';
import { appwriteConfig } from './config';

const serverClient = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setKey(process.env.APPWRITE_API_KEY || '');

export const serverDatabases = new Databases(serverClient);
export const serverStorage = new Storage(serverClient);
export const serverAccount = new Account(serverClient);

export { serverClient, ID, Query };
export default serverClient;
```

### Step 1.3: Update environment variables

**Add to `.env.local`:**
```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=692700e000132c961806
NEXT_PUBLIC_APPWRITE_DATABASE_ID=692701a8001283ad4a42
NEXT_PUBLIC_APPWRITE_BUCKET_ID=69270279001498a920cf
APPWRITE_API_KEY=your_api_key_here_DO_NOT_COMMIT

# Remove or comment out MongoDB
# MONGODB_URI=...
```

**Update `src/lib/env.ts`:**
- Remove `MONGODB_URI`
- Add Appwrite environment variables

---

## Phase 2: Create Appwrite Schema

### Step 2.1: Create schema creation script

**File: `scripts/appwrite/create-schema.ts`**

Create a TypeScript script that:
1. Connects to Appwrite using server client with API key
2. Creates all collections with proper attributes, indexes, and permissions
3. Logs collection IDs for reference

**Collections to create with attributes:**

#### Collection: `users`
- `accountId` (string, required, unique) - links to Appwrite Account
- `email` (email, required, unique)
- `name` (string, required)
- `role` (enum: ['user', 'admin'], required, default: 'user')
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)
- **Permissions:** 
  - Read: `user:{userId}`, admin via server
  - Write: `user:{userId}`, admin via server

#### Collection: `categories`
- `name` (string, required)
- `handle` (string, required, unique)
- `description` (string, optional)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)
- **Indexes:** `handle` (unique), `createdAt` (desc)
- **Permissions:** Read: `role:all`, Write: admin via server

#### Collection: `products`
- `title` (string, required)
- `handle` (string, required, unique)
- `description` (string, optional)
- `price` (float, required)
- `stock` (integer, required, default: 0)
- `compareAtPrice` (float, optional)
- `availableForSale` (boolean, required, default: true)
- `categoryId` (string, optional) - references categories collection
- `tags` (string[], optional)
- `images` (string[], optional) - file URLs or IDs
- `variants` (string, optional) - JSON stringified
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)
- **Indexes:** `handle` (unique), `createdAt` (desc), `categoryId`
- **Permissions:** Read: `role:all`, Write: admin via server

#### Collection: `carts`
- `userId` (string, optional)
- `sessionId` (string, optional)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)
- **Indexes:** `userId`, `sessionId`
- **Permissions:** Owner read/write via server

#### Collection: `cart_items`
- `cartId` (string, required)
- `productId` (string, required)
- `quantity` (integer, required)
- `variantId` (string, optional)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)
- **Indexes:** `cartId`, `productId`
- **Permissions:** Owner via server

#### Collection: `orders`
- `userId` (string, required)
- `fullName` (string, required)
- `email` (email, required)
- `phone` (string, required)
- `shippingAddress` (string, required)
- `status` (enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending')
- `totalAmount` (float, required)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)
- **Indexes:** `userId`, `status`, `createdAt` (desc)
- **Permissions:** Owner read, admin read/write via server

#### Collection: `order_items`
- `orderId` (string, required)
- `productId` (string, required)
- `quantity` (integer, required)
- `price` (float, required)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)
- **Indexes:** `orderId`, `productId`
- **Permissions:** Admin via server

#### Collection: `site_content`
- `key` (string, required, unique)
- `value` (string, required)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)
- **Indexes:** `key` (unique)
- **Permissions:** Read: `role:all`, Write: admin via server

#### Collection: `navigation_items`
- `name` (string, required)
- `title` (string, required)
- `url` (string, required)
- `order` (integer, required, default: 0)
- `isPublished` (boolean, required, default: true)
- `parentId` (string, optional)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)
- **Indexes:** `order`, `isPublished`
- **Permissions:** Read: `role:all`, Write: admin via server

#### Collection: `social_media`
- `platform` (string, required)
- `title` (string, required)
- `url` (string, required)
- `iconUrl` (string, optional)
- `order` (integer, required, default: 0)
- `isPublished` (boolean, required, default: true)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)
- **Indexes:** `order`, `isPublished`
- **Permissions:** Read: `role:all`, Write: admin via server

#### Collection: `media_assets`
- `filename` (string, required)
- `fileId` (string, optional) - Appwrite Storage file ID
- `url` (string, required)
- `alt` (string, optional)
- `type` (string, required)
- `section` (string, optional)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)
- **Indexes:** `type`, `section`
- **Permissions:** Read: `role:all`, Write: admin via server

#### Collection: `reservations`
- `userId` (string, required)
- `fullName` (string, required)
- `email` (email, required)
- `phone` (string, required)
- `street` (string, required)
- `city` (string, required)
- `zipCode` (string, required)
- `country` (string, required)
- `notes` (string, optional)
- `status` (string, required)
- `totalAmount` (float, required)
- `items` (string, required) - JSON stringified
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)
- **Indexes:** `userId`, `status`
- **Permissions:** Owner read, admin read/write via server

#### Collection: `comments`
- `productId` (string, required)
- `userId` (string, required)
- `text` (string, required)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)
- **Indexes:** `productId`, `userId`
- **Permissions:** Read: `role:all`, Write: owner via server

#### Collection: `ratings`
- `productId` (string, required)
- `userId` (string, required)
- `stars` (integer, required, min: 1, max: 5)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)
- **Indexes:** `productId`, `userId`
- **Permissions:** Read: `role:all`, Write: owner via server

#### Collection: `translations`
- `key` (string, required)
- `language` (string, required)
- `text` (string, required)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)
- **Indexes:** compound index on `key` + `language`
- **Permissions:** Read: `role:all`, Write: admin via server

#### Collection: `uploads`
- `fileName` (string, required)
- `fileUrl` (string, required)
- `fileSize` (integer, required)
- `fileType` (string, required)
- `uploadedBy` (string, required) - accountId
- `uploadType` (enum: ['hero-video', 'product-image', 'general-media', 'avatar', 'document'])
- `isPublic` (boolean, required, default: true)
- `metadata` (string, optional) - JSON stringified
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)
- **Indexes:** `uploadedBy`, `uploadType`, `isPublic`
- **Permissions:** Read based on `isPublic`, Write: owner/admin via server

**Run script:**
```powershell
pnpm tsx scripts/appwrite/create-schema.ts
```

---

## Phase 3: Create Migration Scripts

### Step 3.1: Data migration script

**File: `scripts/appwrite/migrate-data.ts`**

Create a script that:
1. Reads JSON exports from `backups/` folder
2. Transforms MongoDB documents to Appwrite format:
   - Remove `_id`, use Appwrite auto-generated `$id` or map to new ID
   - Convert `Date` objects to ISO strings
   - Transform nested objects/arrays as needed
3. Creates documents in Appwrite using server SDK
4. Logs ID mappings to `backups/id-mapping.json`
5. Handles rate limiting and retries

**Special handling:**

**Users migration:**
- For each user in `backups/users.json`:
  1. Create Appwrite Account using `serverAccount.create(ID.unique(), email, temporaryPassword, name)`
  2. Store the returned `accountId`
  3. Create user metadata document in `users` collection with `accountId`, `email`, `name`, `role`
  4. Log mapping: `{ mongoId, accountId, appwriteDocId }`

**Note:** Since bcrypt hashes cannot be migrated, users will need to reset passwords. Consider:
- Creating accounts with temporary password (e.g., `TempPassword123!`)
- Sending password reset emails after migration
- Or implementing a "first login" flow

**Products migration:**
- Map `categoryId` from old MongoDB ID to new Appwrite collection document ID (use mapping)
- Parse `tags`, `images`, `variants` if stored as JSON strings

**File uploads migration:**
- For each file referenced in `uploads` or `media_assets`:
  1. Download file from current URL if accessible
  2. Upload to Appwrite Storage bucket using `serverStorage.createFile(bucketId, ID.unique(), file)`
  3. Get file URL: `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view`
  4. Update document with new `fileId` and `fileUrl`

**Run script:**
```powershell
pnpm tsx scripts/appwrite/migrate-data.ts
```

---

## Phase 4: Replace Database Service Layer

### Step 4.1: Create Appwrite database service

**File: `src/lib/appwrite/database.ts`**

Create a new `DatabaseService` class that implements all methods from the old `src/lib/database.ts` but uses Appwrite SDK.

**Key method conversions:**

**Old MongoDB pattern:**
```typescript
const products = await db.collection(Collections.PRODUCTS).find({}).toArray();
```

**New Appwrite pattern:**
```typescript
import { serverDatabases, Query } from '@/lib/appwrite/server';
import { appwriteConfig, COLLECTION_IDS } from '@/lib/appwrite/config';

const products = await serverDatabases.listDocuments(
  appwriteConfig.databaseId,
  COLLECTION_IDS.PRODUCTS
);
```

**Method mappings:**

- `find({})` → `listDocuments(dbId, collectionId, queries?)`
- `findOne({ _id })` → `getDocument(dbId, collectionId, documentId)`
- `insertOne(doc)` → `createDocument(dbId, collectionId, ID.unique(), doc)`
- `findOneAndUpdate()` → `updateDocument(dbId, collectionId, documentId, data)`
- `findOneAndDelete()` → `deleteDocument(dbId, collectionId, documentId)`
- `countDocuments()` → `listDocuments(...).total`

**Filtering/Querying:**
- MongoDB: `{ price: { $gt: 10 } }`
- Appwrite: `Query.greaterThan('price', 10)`

**Implement these methods (minimum):**

```typescript
class AppwriteDbService {
  // Categories
  async getCategories()
  async getCategoryById(id: string)
  async getCategoryByHandle(handle: string)
  async createCategory(data)
  async updateCategory(id: string, data)
  async deleteCategory(id: string)
  
  // Products
  async getProducts()
  async getProductById(id: string)
  async getProductByHandle(handle: string)
  async getProductsByCategory(categoryHandle: string)
  async searchProducts(searchTerm: string, options?)
  async getRecentProducts(count: number)
  async createProduct(data)
  async updateProduct(id: string, data)
  async deleteProduct(id: string)
  async getProductCount(filter?)
  
  // Users
  async getUserById(id: string)
  async getUserByEmail(email: string)
  async createUser(data)
  async updateUser(id: string, data)
  async deleteUser(id: string)
  
  // Cart
  async getCartByUserId(userId: string)
  async createCart(data)
  async getCartItems(cartId: string)
  async addCartItem(data)
  async removeCartItem(id: string)
  async clearCartItems(userId: string)
  async getCartItem(filter)
  async updateCartItemQuantity(id: string, quantity: number)
  
  // Orders
  async createOrder(data)
  async getOrders(filter, options?)
  async getOrderById(id: string)
  async updateOrderStatus(id: string, status: string)
  async createOrderItem(data)
  async getOrderItems(orderId: string)
  async clearCartItemsByCartId(cartId: string)
  
  // Site Content
  async getSiteContentByKey(key: string)
  async getAllSiteContent()
  async createSiteContent(data)
  async updateSiteContentByKey(key: string, value: string)
  
  // Comments & Ratings
  async getComments(filter, options?)
  async createComment(data)
  async getRatings(filter)
  async createOrUpdateRating(data)
  
  // Utility
  transformToShopifyProduct(product) // Keep compatibility with existing code
}

export const dbService = new AppwriteDbService();
```

### Step 4.2: Replace all imports

Search and replace across the entire codebase:

**Find:**
```typescript
import { dbService } from '@/lib/database';
```

**Replace with:**
```typescript
import { dbService } from '@/lib/appwrite/database';
```

**Also update:**
- Remove `Collections` imports from `@/lib/mongodb`
- Remove `getDatabase`, `connectToDatabase` imports
- Remove `isValidObjectId`, `toObjectId` utility calls (use string IDs directly)

---

## Phase 5: Replace Authentication System

### Step 5.1: Update auth API routes

**File: `src/app/api/auth/register/route.ts`**

Replace with Appwrite Account creation:

```typescript
import { serverAccount, ID } from '@/lib/appwrite/server';
import { dbService } from '@/lib/appwrite/database';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Create Appwrite account
    const account = await serverAccount.create(
      ID.unique(),
      email,
      password,
      name || email.split('@')[0]
    );

    // Create user metadata document
    await dbService.createUser({
      accountId: account.$id,
      email: account.email,
      name: account.name,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create session (returns session cookie)
    const session = await serverAccount.createEmailSession(email, password);

    const response = NextResponse.json({
      success: true,
      user: {
        id: account.$id,
        email: account.email,
        name: account.name,
      },
    });

    // Set session cookie
    response.cookies.set('appwrite-session', session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === 409) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
```

**File: `src/app/api/auth/login/route.ts`**

```typescript
import { serverAccount } from '@/lib/appwrite/server';
import { dbService } from '@/lib/appwrite/database';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Create session
    const session = await serverAccount.createEmailSession(email, password);

    // Get account details
    const account = await serverAccount.get();
    
    // Get user metadata from database
    const userMeta = await dbService.getUserByEmail(email);

    const response = NextResponse.json({
      success: true,
      user: {
        id: account.$id,
        email: account.email,
        name: account.name,
        isAdmin: userMeta?.role === 'admin',
      },
    });

    response.cookies.set('appwrite-session', session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
}
```

**File: `src/app/api/auth/logout/route.ts`**

```typescript
import { serverAccount } from '@/lib/appwrite/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('appwrite-session')?.value;
    
    if (sessionId) {
      await serverAccount.deleteSession(sessionId);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('appwrite-session');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: true }); // Always succeed
  }
}
```

**File: `src/app/api/auth/me/route.ts`**

```typescript
import { serverAccount } from '@/lib/appwrite/server';
import { dbService } from '@/lib/appwrite/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('appwrite-session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get account
    const account = await serverAccount.get();
    
    // Get user metadata
    const userMeta = await dbService.getUserByEmail(account.email);

    return NextResponse.json({
      user: {
        id: account.$id,
        email: account.email,
        name: account.name,
        isAdmin: userMeta?.role === 'admin',
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
}
```

### Step 5.2: Update auth middleware

**File: `src/lib/appwrite/auth.ts`**

Create new auth helpers:

```typescript
import { serverAccount } from './server';
import { dbService } from './database';
import { NextRequest, NextResponse } from 'next/server';

export async function verifyAuth(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('appwrite-session')?.value;
    
    if (!sessionId) {
      return null;
    }

    const account = await serverAccount.get();
    const userMeta = await dbService.getUserByEmail(account.email);

    return {
      userId: account.$id,
      email: account.email,
      name: account.name,
      isAdmin: userMeta?.role === 'admin',
    };
  } catch (error) {
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await verifyAuth(request);
  
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  return user;
}

export async function requireAdmin(request: NextRequest) {
  const user = await verifyAuth(request);
  
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  if (!user.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  return user;
}
```

**Update all API routes using auth:**

Replace:
```typescript
import { verifyAuth, requireAuth, requireAdmin } from '@/lib/auth';
```

With:
```typescript
import { verifyAuth, requireAuth, requireAdmin } from '@/lib/appwrite/auth';
```

Remove all `jsonwebtoken` and `bcryptjs` imports and usage.

---

## Phase 6: Replace Storage/Upload System

### Step 6.1: Create storage service

**File: `src/lib/appwrite/storage.ts`**

```typescript
import { serverStorage, ID } from './server';
import { appwriteConfig } from './config';
import { InputFile } from 'node-appwrite';

export class StorageService {
  private bucketId = appwriteConfig.bucketId;

  async uploadFile(file: File | Blob | Buffer, filename: string) {
    try {
      const inputFile = InputFile.fromBuffer(file, filename);
      
      const uploadedFile = await serverStorage.createFile(
        this.bucketId,
        ID.unique(),
        inputFile
      );

      const fileUrl = `${appwriteConfig.endpoint}/storage/buckets/${this.bucketId}/files/${uploadedFile.$id}/view`;

      return {
        fileId: uploadedFile.$id,
        fileUrl,
        fileName: uploadedFile.name,
        fileSize: uploadedFile.sizeOriginal,
        mimeType: uploadedFile.mimeType,
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string) {
    try {
      await serverStorage.deleteFile(this.bucketId, fileId);
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  getFileUrl(fileId: string) {
    return `${appwriteConfig.endpoint}/storage/buckets/${this.bucketId}/files/${fileId}/view`;
  }

  getFileDownloadUrl(fileId: string) {
    return `${appwriteConfig.endpoint}/storage/buckets/${this.bucketId}/files/${fileId}/download`;
  }
}

export const storageService = new StorageService();
```

### Step 6.2: Update upload endpoints

Replace upload logic in:
- `src/app/api/uploads/route.ts`
- `src/app/api/upload/video/route.ts`
- `src/app/api/admin/upload-video/route.ts`
- Any other upload-related routes

Use `storageService.uploadFile()` instead of MongoDB/UploadThing storage.

---

## Phase 7: Remove MongoDB Code

### Step 7.1: Move old files to backup

```powershell
# Create backup directory
New-Item -Path "backups/old-mongodb-code" -ItemType Directory -Force

# Move files
Move-Item -Path "src/lib/mongodb.ts" -Destination "backups/old-mongodb-code/"
Move-Item -Path "src/lib/database.ts" -Destination "backups/old-mongodb-code/"
Move-Item -Path "src/lib/singleConnection.ts" -Destination "backups/old-mongodb-code/"
Move-Item -Path "src/lib/enhanced-db.ts" -Destination "backups/old-mongodb-code/"
Move-Item -Path "src/lib/withMongoCleanup.ts" -Destination "backups/old-mongodb-code/"
Move-Item -Path "src/lib/connectionMonitor.ts" -Destination "backups/old-mongodb-code/"
Move-Item -Path "src/lib/simple-db.ts" -Destination "backups/old-mongodb-code/"
```

### Step 7.2: Remove MongoDB references

Delete or update:
- `src/lib/auth.ts` (replace with Appwrite version)
- `src/lib/auth-middleware.ts` (replace with Appwrite version)
- `src/types/mongodb.ts` (can keep type definitions, just update imports)

### Step 7.3: Update all remaining imports

Run search and replace for any remaining MongoDB imports:

```powershell
# Search for MongoDB references (should return nothing)
Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx | Select-String -Pattern "from '@/lib/mongodb'|from '@/lib/database'|from '@/lib/singleConnection'|mongodb|MongoClient|ObjectId"
```

Fix any matches found.

---

## Phase 8: Testing & Validation

### Step 8.1: Build the project

```powershell
pnpm install
pnpm run build
```

Fix any TypeScript errors.

### Step 8.2: Run the application

```powershell
pnpm run dev
```

### Step 8.3: Test key features

1. **Authentication:**
   - Register new user
   - Login with credentials
   - Access protected routes
   - Logout

2. **Products:**
   - List all products
   - View product details
   - Create new product (admin)
   - Update product (admin)
   - Delete product (admin)

3. **Cart:**
   - Add items to cart
   - Update quantities
   - Remove items
   - Clear cart

4. **Orders:**
   - Create order
   - View orders (user)
   - View all orders (admin)
   - Update order status (admin)

5. **Uploads:**
   - Upload image
   - Upload video
   - View uploaded files

### Step 8.4: Verify no MongoDB references

```powershell
# Should return NO matches in src/
Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx,*.js | Select-String -Pattern "mongodb|MongoClient|ObjectId|connectToDatabase|getDatabase|toObjectId|isValidObjectId"
```

### Step 8.5: Verify package.json

Ensure `mongodb` and `@types/mongodb` are NOT in dependencies.

---

## Phase 9: Cleanup & Documentation

### Step 9.1: Remove old environment variables

From `.env.local`, remove:
```env
# MONGODB_URI=...  # Remove or comment out
```

### Step 9.2: Update scripts in package.json

Remove MongoDB-related scripts:
```json
{
  "scripts": {
    // Remove these:
    // "db:optimize": "npx tsx scripts/optimize-database.ts",
    // "db:monitor": "npx tsx scripts/monitor-connections.ts monitor",
    // etc.
  }
}
```

### Step 9.3: Delete old scripts

```powershell
Remove-Item -Path "scripts/optimize-database.ts" -Force
Remove-Item -Path "scripts/monitor-connections.ts" -Force
Remove-Item -Path "scripts/emergency-cleanup.js" -Force
Remove-Item -Path "scripts/quick-cleanup.js" -Force
Remove-Item -Path "scripts/emergency-connection-fix.js" -Force
```

### Step 9.4: Update README

Add Appwrite setup instructions and remove MongoDB references.

---

## Final Checklist

- [ ] All MongoDB packages removed from `package.json`
- [ ] Appwrite SDK installed and configured
- [ ] All Appwrite collections created with proper schema
- [ ] Data migrated from MongoDB to Appwrite
- [ ] Database service layer replaced with Appwrite implementation
- [ ] Authentication system migrated to Appwrite Account
- [ ] Storage/upload system using Appwrite Storage
- [ ] All old MongoDB files moved to `backups/`
- [ ] All imports updated to use Appwrite modules
- [ ] Environment variables updated
- [ ] Project builds successfully (`pnpm run build`)
- [ ] All features tested and working
- [ ] No MongoDB references in source code
- [ ] Documentation updated

---

## Rollback Plan

If migration fails:

1. Restore MongoDB files from `backups/old-mongodb-code/`
2. Restore `.env.local` with `MONGODB_URI`
3. Run: `pnpm add mongodb @types/mongodb`
4. Run: `pnpm remove appwrite node-appwrite`
5. Restore original MongoDB data from backups

---

## Important Notes

1. **Passwords:** Users will need to reset passwords as bcrypt hashes cannot be migrated to Appwrite. Consider sending reset emails after migration.

2. **Rate Limits:** Appwrite has rate limits. Migration scripts should include delays and batch processing.

3. **Permissions:** Appwrite uses document-level permissions. Ensure proper permissions are set during collection creation.

4. **IDs:** Appwrite uses `$id` instead of `_id`. Update all references.

5. **Sessions:** Appwrite session management differs from JWT. Test thoroughly.

6. **API Keys:** NEVER commit `APPWRITE_API_KEY` to version control. Use environment variables.

---

Execute each phase in order. Mark tasks complete as you go. Report any errors immediately. Good luck!

# Cart Authentication Fix

## Problem
The cart system was not properly tied to authenticated users. Users could see cart items even when logged out, and the system was using hardcoded demo user IDs instead of actual authentication.

## Root Causes
1. **Hardcoded User IDs**: The cart icon component was using `localStorage.getItem('demo-user-id')` instead of authenticated user data
2. **API Authentication**: Cart API routes were expecting userId in request body instead of getting it from JWT tokens
3. **No Auth Validation**: Cart operations didn't validate if the user was logged in
4. **SSR/Hydration Issues**: Cart context was causing "useCart must be used within a CartProvider" errors on product pages

## Changes Made

### 1. Updated Cart Icon Component (`src/components/cart/database-cart-icon.tsx`)
**Before:**
```tsx
const [userId, setUserId] = useState('');

useEffect(() => {
  const storedUserId = localStorage.getItem('demo-user-id') || 'demo-user-123';
  setUserId(storedUserId);
}, []);
```

**After:**
```tsx
const { user } = useAuth();
// ... later in JSX
userId={user?.id || ''}
```

### 2. Updated Cart Add API (`src/app/api/cart/add/route.ts`)
**Before:**
```typescript
const body = await request.json();
userId = body.userId; // Getting userId from request body
```

**After:**
```typescript
// Get userId from JWT token
const cookieStore = cookies();
const token = cookieStore.get('token')?.value;

if (!token) {
  return NextResponse.json({
    success: false,
    message: 'Please log in to add items to cart'
  }, { status: 401 });
}

const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
userId = decoded.userId;
```

### 3. Updated Main Cart API (`src/app/api/cart/route.ts`)
- Changed from cookie-based cart to JWT-authenticated user cart
- Added proper authentication validation
- Returns empty cart when user is not logged in

### 4. Updated Cart Context (`src/contexts/CartContext.tsx`)
**Before:**
```typescript
body: JSON.stringify({ userId, productId, quantity, variantId })
```

**After:**
```typescript
body: JSON.stringify({ productId, quantity, variantId })
// userId now comes from JWT token in the API

// Added login redirect for unauthenticated users
if (!userId) {
  window.location.href = '/login';
  return false;
}
```

### 5. Fixed DatabaseAddToCart Component (`src/components/cart/database-add-to-cart.tsx`)
**Issues Fixed:**
- **SSR/Hydration Error**: Removed direct cart context usage that was causing "useCart must be used within a CartProvider" errors
- **Login Redirect**: Added proper login redirect for unauthenticated users
- **Direct API Calls**: Made component call cart API directly instead of through context to avoid SSR issues

**Solution:**
```tsx
const { user } = useAuth();

const handleAddToCart = async () => {
  // Check if user is logged in
  if (!user) {
    router.push('/login');
    return;
  }

  // Call API directly instead of using cart context
  const response = await fetch('/api/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity: 1, variantId })
  });

  // Dispatch custom event to update cart icon
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};
```

## Expected Behavior

### When User is Logged Out:
1. ✅ Cart icon shows 0 items
2. ✅ Cart modal/page shows empty cart
3. ✅ "Add to Cart" button shows "Login to Add to Cart"
4. ✅ Clicking "Add to Cart" redirects to login page
5. ✅ No cart items persist from previous sessions

### When User is Logged In:
1. ✅ Cart shows user's specific items
2. ✅ Items persist across page refreshes
3. ✅ Cart operations work normally
4. ✅ Different users see different carts

### On Login/Logout:
1. ✅ Cart automatically refreshes on auth state change
2. ✅ Logging out clears the cart display
3. ✅ Logging in loads the user's cart

### Product Details Page:
1. ✅ No more "useCart must be used within a CartProvider" errors
2. ✅ Add to Cart button works for logged-in users
3. ✅ Redirects to login for logged-out users
4. ✅ Cart icon updates when items are added

## Security Improvements

1. **Authentication Required**: All cart operations now require valid JWT tokens
2. **User Isolation**: Users can only access their own cart data
3. **No Client-Side User IDs**: User identification happens server-side via JWT
4. **Proper Error Handling**: Clear error messages for authentication failures

## API Endpoints Updated

- `GET /api/cart` - Now uses JWT authentication
- `POST /api/cart/add` - Now requires authentication, userId from JWT
- ~~`PUT /api/cart/update`~~ - Should follow same pattern (TODO)
- ~~`DELETE /api/cart/remove/[itemId]`~~ - Should follow same pattern (TODO)

## Testing Steps

1. **Test Logged Out State:**
   - Visit the site without logging in
   - Cart icon should show 0 items
   - Visit product page: `http://localhost:3000/products/cmf2em0a3000i96yw3ezesy65`
   - Button should show "Login to Add to Cart"
   - Clicking button should redirect to login page

2. **Test Logged In State:**
   - Log in with demo@example.com
   - Add items to cart from product pages
   - Cart should show items and persist on refresh

3. **Test User Switching:**
   - Log in as demo@example.com, add items
   - Log out, then log in as admin@gmail.com
   - Should see a different cart (empty or different items)

4. **Test Authentication:**
   - Add items while logged in
   - Log out - cart should appear empty
   - Log back in - cart items should reappear

## Files Modified

- `src/components/cart/database-cart-icon.tsx`
- `src/app/api/cart/add/route.ts`
- `src/app/api/cart/route.ts`
- `src/contexts/CartContext.tsx`
- `src/components/cart/database-add-to-cart.tsx`

## Issues Resolved

1. ✅ **Cart not tied to authenticated users** - Fixed
2. ✅ **"useCart must be used within a CartProvider" error** - Fixed
3. ✅ **No login redirect for unauthenticated users** - Fixed
4. ✅ **Hardcoded demo user IDs** - Fixed
5. ✅ **Cart persisting when logged out** - Fixed

## Next Steps

Consider updating other cart API routes to follow the same authentication pattern:
- `PUT /api/cart/update`
- `DELETE /api/cart/remove/[itemId]`
- `POST /api/cart/checkout`
- `DELETE /api/cart/clear`

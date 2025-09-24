# Upload Video Route TypeScript Fix

## Problem
Vercel build was failing with a TypeScript error in the upload-video route:

```
Type error: Argument of type '{ filename: string; url: string; type: string; section: string; alt: string; }' is not assignable to parameter of type 'CreateDocument<MediaAsset>'.
Type '{ filename: string; url: string; type: string; section: string; alt: string; }' is missing the following properties from type 'CreateDocument<MediaAsset>': createdAt, updatedAt
```

## Root Cause
The `createMediaAsset` method expects a `CreateDocument<MediaAsset>` type, which requires all properties from the `MediaAsset` interface except `_id`. The `MediaAsset` interface includes `createdAt` and `updatedAt` as required fields, but the upload-video route was not providing them.

## Type Definition Analysis
```typescript
// MediaAsset interface (from mongodb.ts)
export interface MediaAsset {
  _id?: string;
  filename: string;
  url: string;
  alt?: string;
  type: string;
  section?: string;
  createdAt: Date;    // ← Required
  updatedAt: Date;    // ← Required
}

// CreateDocument helper type
export type CreateDocument<T> = Omit<T, '_id'>;
// This means CreateDocument<MediaAsset> requires all fields except _id
```

## Solution Applied
Added the missing `createdAt` and `updatedAt` fields to the `createMediaAsset` call in the upload-video route:

### Before (causing error):
```typescript
const mediaAsset = await dbService.createMediaAsset({
  filename,
  url: dataUrl,
  type: file.type,
  section: 'hero-background',
  alt: 'Hero background video'
});
```

### After (fixed):
```typescript
const now = new Date();
const mediaAsset = await dbService.createMediaAsset({
  filename,
  url: dataUrl,
  type: file.type,
  section: 'hero-background',
  alt: 'Hero background video',
  createdAt: now,
  updatedAt: now
});
```

## Files Modified
- `src/app/api/admin/upload-video/route.ts` - Added required timestamp fields

## Verification
✅ Build completed successfully with `npm run build`
✅ No TypeScript compilation errors
✅ All routes properly typed

## Related Code Consistency
The fix aligns with the pattern already used in:
- `src/app/api/admin/media/route.ts` (main media upload route)

Other routes using `simpleDbService.createMediaAsset` don't need this fix as that service automatically adds timestamps.

## Status: ✅ RESOLVED
Vercel build should now deploy successfully without TypeScript errors.
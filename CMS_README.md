# Content Management System (CMS)

## Overview

This project includes a powerful Content Management System (CMS) that allows administrators to manage website content without touching code. The system includes:

- **Database-backed content storage** using Prisma and SQLite
- **REST API endpoints** for content CRUD operations  
- **Admin dashboard** for content management
- **Dynamic frontend integration** that fetches content in real-time

## Features

### 📋 Content Management
- Create, read, update, and delete content items
- Organize content by categories (hero, about, footer, contact, etc.)
- Bulk content operations
- Real-time content preview

### 🎨 Admin Dashboard
- Intuitive tabbed interface
- Content organized by sections
- Add new content items dynamically
- Content statistics and overview

### 🔗 API Integration
- RESTful API endpoints
- Automatic cache revalidation
- Error handling and validation
- Type-safe operations

## Getting Started

### 1. Database Setup

The content system uses a `SiteContent` model in Prisma:

```prisma
model SiteContent {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. API Endpoints

#### GET /api/content
Fetch all content items
```json
{
  "success": true,
  "data": {
    "hero.title": "Welcome to Our Store",
    "hero.subtitle": "Discover amazing products"
  },
  "items": [...]
}
```

#### POST /api/content
Create or update multiple content items
```json
{
  "content": {
    "hero.title": "New Title",
    "hero.subtitle": "New Subtitle"
  }
}
```

#### GET /api/content/[key]
Fetch a single content item by key

#### PUT /api/content/[key]
Update or create a single content item

### 3. Admin Dashboard

Access the content management dashboard at:
```
http://localhost:3000/admin/content
```

Features:
- **All Content**: View and edit all content items
- **Hero Section**: Manage homepage hero content
- **About**: Edit about section content
- **Footer**: Update footer information
- **Contact**: Manage contact details
- **Add New**: Create custom content items

### 4. Frontend Integration

Content is automatically fetched and displayed on the frontend:

```tsx
import { getSiteContent, getContentValue } from '@/lib/content';

const MyComponent = async () => {
  const content = await getSiteContent();
  const title = getContentValue(content, 'hero.title', 'Default Title');
  
  return <h1>{title}</h1>;
};
```

## Content Structure

### Default Content Keys

The system comes with predefined content keys:

#### Hero Section
- `hero.title` - Main headline
- `hero.subtitle` - Secondary headline
- `hero.description` - Description text
- `hero.buttonText` - Call-to-action button text

#### About Section
- `about.title` - About section title
- `about.description` - About section content
- `about.buttonText` - About button text

#### Footer
- `footer.companyName` - Company name
- `footer.description` - Company tagline

#### Contact
- `contact.email` - Contact email
- `contact.phone` - Phone number
- `contact.address` - Physical address

### Adding Custom Content

You can add any custom content using dot notation:
- `product.featured.title`
- `promotion.banner.text`
- `social.instagram.handle`

## Cache Management

The system automatically revalidates relevant pages when content is updated:

```typescript
// Automatic cache revalidation
revalidatePath('/');
revalidatePath('/admin/content');
```

## Security

- Admin routes should be protected with authentication
- Content validation and sanitization
- Rate limiting for API endpoints
- Input validation for all content operations

## Troubleshooting

### Content Not Updating
1. Check if the API endpoints are working
2. Verify cache revalidation is working
3. Ensure the Prisma client is properly generated

### Database Issues
1. Run `npx prisma db push` to sync schema
2. Run `npx prisma generate` to update client
3. Check database connection

### Admin Dashboard Access
1. Ensure you're accessing `/admin/content`
2. Check for console errors
3. Verify API endpoints are responding

## Development

### Adding New Content Types

1. Add new content keys to `DEFAULT_CONTENT_VALUES`
2. Create new tabs in the admin dashboard
3. Update frontend components to use new content

### Extending the API

Add new endpoints in `/api/content/` for specific content operations:
- Bulk operations
- Content validation
- Content history/versioning

## Best Practices

1. **Use descriptive keys**: `hero.main.title` vs `title1`
2. **Group related content**: Use prefixes like `hero.`, `footer.`
3. **Provide fallbacks**: Always include default values
4. **Validate content**: Check for required fields
5. **Test thoroughly**: Verify content updates reflect properly

## Support

For issues or questions about the CMS system:
1. Check the API endpoints in the browser
2. Review the console for errors
3. Verify database connectivity
4. Check Prisma schema and client generation

# Translation System Documentation

## Overview

This is a complete translation system for your Next.js application with support for French (default), English, and Arabic languages. The system includes database storage, API endpoints, React hooks, and an admin interface for managing translations.

## Features

- **Multi-language Support**: French (default), English, Arabic
- **Fallback System**: Automatically falls back to French if translation is missing
- **Database Storage**: Uses Prisma with MySQL/SQLite for storing translations
- **Type Safety**: Full TypeScript support
- **Admin Interface**: Web-based translation management
- **Caching**: Client-side caching of translations
- **Persistence**: Language selection persists in localStorage

## Database Schema

```prisma
model Translation {
  id        String   @id @default(cuid())
  key       String
  language  String
  text      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([key, language])
  @@index([language])
  @@index([key])
}
```

## API Endpoints

### GET /api/translations?language={lang}
Fetches all translations for a specific language with French fallbacks.

**Example:**
```bash
curl "http://localhost:3000/api/translations?language=en"
```

**Response:**
```json
{
  "welcome_message": "Welcome to our shop!",
  "nav_home": "Home",
  "nav_products": "Products"
}
```

### POST /api/translations
Creates or updates a single translation.

**Body:**
```json
{
  "key": "welcome_message",
  "language": "en",
  "text": "Welcome to our shop!"
}
```

### PUT /api/translations
Batch creates or updates multiple translations.

**Body:**
```json
{
  "translations": [
    {
      "key": "welcome_message",
      "language": "en",
      "text": "Welcome!"
    },
    {
      "key": "welcome_message",
      "language": "fr",
      "text": "Bienvenue!"
    }
  ]
}
```

### DELETE /api/translations?key={key}&language={lang}
Deletes translations. If language is omitted, deletes all translations for the key.

## Frontend Usage

### Basic Usage

```tsx
import { useTranslation } from '@/contexts/TranslationContext';

function MyComponent() {
  const { t, language, setLanguage, isLoading } = useTranslation();

  return (
    <div>
      <h1>{t('welcome_message')}</h1>
      <p>Current language: {language}</p>
      <button onClick={() => setLanguage('en')}>English</button>
      <button onClick={() => setLanguage('fr')}>Français</button>
      <button onClick={() => setLanguage('ar')}>العربية</button>
    </div>
  );
}
```

### Language Selector Component

```tsx
import LanguageSelector from '@/components/LanguageSelector';

function Header() {
  return (
    <div>
      <LanguageSelector showName={true} />
    </div>
  );
}
```

### Using Specific Language Hook

```tsx
import { useTranslationWithLanguage } from '@/contexts/TranslationContext';

function AdminComponent() {
  const { t, isLoading } = useTranslationWithLanguage('en');
  
  return <div>{t('admin_dashboard')}</div>;
}
```

## Setup Instructions

### 1. Database Migration
The Translation model is already added to your Prisma schema. Run:
```bash
npm run db:push
```

### 2. Seed Sample Translations
```bash
npm run db:seed-translations
```

### 3. Translation Provider Setup
The TranslationProvider is already added to your ClientProviders component, wrapping your entire app.

## Managing Translations

### Admin Interface
Visit `/admin/translations` to:
- View all translations
- Add new translation keys
- Edit existing translations
- Delete translations
- Bulk operations

### Programmatic Management

```tsx
// Add a new translation
const response = await fetch('/api/translations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'new_message',
    language: 'en',
    text: 'Hello World'
  })
});

// Batch update
const response = await fetch('/api/translations', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    translations: [
      { key: 'msg1', language: 'en', text: 'Message 1' },
      { key: 'msg1', language: 'fr', text: 'Message 1' },
      { key: 'msg1', language: 'ar', text: 'رسالة 1' }
    ]
  })
});
```

## Best Practices

### 1. Translation Key Naming
Use descriptive, hierarchical keys:
```
nav_home
nav_products
product_add_to_cart
form_email
msg_welcome
error_network
```

### 2. Fallback Strategy
Always provide French translations as they serve as fallbacks:
```tsx
// Good: Will show French if English is missing
t('welcome_message')

// Avoid: Hardcoded fallbacks
t('welcome_message') || 'Welcome'
```

### 3. Pluralization
For complex pluralization, use separate keys:
```
item_count_zero
item_count_one
item_count_many
```

### 4. Context-Specific Translations
Use prefixes to avoid conflicts:
```
nav_search      // Search in navigation
form_search     // Search in forms
button_search   // Search button text
```

## Testing

### Demo Page
Visit `/translation-demo` to see the translation system in action with:
- Language switching
- Live translation updates
- Fallback demonstrations
- Various UI components

### Manual Testing
1. Switch languages using the language selector
2. Verify translations load correctly
3. Test fallback to French for missing translations
4. Test admin interface for CRUD operations

## File Structure

```
src/
├── types/
│   └── translation.ts              # TypeScript types
├── contexts/
│   └── TranslationContext.tsx      # React context and hooks
├── components/
│   ├── LanguageSelector.tsx        # Language selector component
│   └── admin/
│       └── TranslationAdmin.tsx    # Admin interface
├── app/
│   ├── api/
│   │   └── translations/
│   │       └── route.ts            # API endpoints
│   ├── admin/
│   │   └── translations/
│   │       └── page.tsx            # Admin page
│   └── translation-demo/
│       └── page.tsx                # Demo page
└── scripts/
    └── seed-translations.ts        # Seeding script
```

## Available Translation Keys

The system includes 47 pre-seeded translation keys across categories:
- Navigation (8 keys)
- Common actions (7 keys)
- Product-related (7 keys)
- Cart functionality (6 keys)
- Form fields (7 keys)
- Messages (5 keys)
- Footer (7 keys)

## RTL Support

Arabic language support includes:
- Proper `dir="rtl"` attributes in form inputs
- Text direction handling
- Font support (ensure Arabic fonts are available)

## Performance Considerations

- Translations are cached in React state
- Language preference persists in localStorage
- API calls are made only when language changes
- Batch operations for efficient updates

## Troubleshooting

### Common Issues

1. **Translations not loading**: Check if Prisma client is regenerated after schema changes
2. **Missing fallbacks**: Ensure French translations exist for all keys
3. **API errors**: Verify database connection and schema is up to date
4. **Type errors**: Run `npm run db:generate` to update Prisma types

### Debug Mode
Enable debug logging by adding to your environment:
```
NEXT_PUBLIC_DEBUG_TRANSLATIONS=true
```

## Contributing

When adding new features:
1. Add translation keys to the seeding script
2. Update TypeScript types if needed
3. Test with all three languages
4. Ensure fallback behavior works correctly
5. Update documentation

---

**Next Steps:**
1. Visit `/translation-demo` to see the system in action
2. Go to `/admin/translations` to manage translations
3. Start using `t('key')` in your components
4. Add more translation keys as needed for your application

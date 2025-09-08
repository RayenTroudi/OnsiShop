import type { Language } from '@/types/translation';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// Create a single Prisma client instance
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') as Language;

    console.log(`🔍 Translation API called for language: ${language}`);

    if (!language) {
      return NextResponse.json(
        { error: 'Language parameter is required' },
        { status: 400 }
      );
    }

    // Validate language
    if (!['fr', 'en', 'ar'].includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Must be fr, en, or ar' },
        { status: 400 }
      );
    }

    console.log(`📊 Querying database for language: ${language}`);

    // Use Prisma to get translations for the requested language
    const translations = await (prisma as any).Translation.findMany({
      where: {
        language: language
      },
      select: {
        key: true,
        text: true
      }
    });

    console.log(`📊 Found ${translations.length} translations for language: ${language}`);

    // Convert to key-value pairs
    const translationsMap: Record<string, string> = {};
    translations.forEach((translation: { key: string; text: string }) => {
      translationsMap[translation.key] = translation.text;
    });

    console.log(`📊 Returning ${Object.keys(translationsMap).length} translations as map`);

    return NextResponse.json(translationsMap);
  } catch (error) {
    console.error('❌ Error fetching translations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, language, text } = body;

    if (!key || !language || !text) {
      return NextResponse.json(
        { error: 'Key, language, and text are required' },
        { status: 400 }
      );
    }

    // Validate language
    if (!['fr', 'en', 'ar'].includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Must be fr, en, or ar' },
        { status: 400 }
      );
    }

    // Use Prisma upsert
    const result = await (prisma as any).Translation.upsert({
      where: {
        key_language: {
          key: key,
          language: language
        }
      },
      update: {
        text: text
      },
      create: {
        key: key,
        language: language,
        text: text
      }
    });

    return NextResponse.json({ 
      success: true, 
      key, 
      language, 
      text,
      action: result.createdAt === result.updatedAt ? 'created' : 'updated'
    });
  } catch (error) {
    console.error('Error saving translation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { translations } = body as { translations: Array<{ key: string; language: Language; text: string }> };

    if (!translations || !Array.isArray(translations)) {
      return NextResponse.json(
        { error: 'Translations array is required' },
        { status: 400 }
      );
    }

    // Batch update/create translations using raw SQL
    const results = [];
    
    for (const { key, language, text } of translations) {
      // Check if exists
      const existing = await prisma.$queryRaw`
        SELECT id FROM Translation 
        WHERE key = ${key} AND language = ${language}
      ` as Array<{ id: string }>;

      if (existing.length > 0) {
        // Update existing
        await prisma.$executeRaw`
          UPDATE Translation 
          SET text = ${text}, updatedAt = datetime('now') 
          WHERE key = ${key} AND language = ${language}
        `;
        results.push({ key, language, action: 'updated' });
      } else {
        // Create new
        await prisma.$executeRaw`
          INSERT INTO Translation (id, key, language, text, createdAt, updatedAt) 
          VALUES (lower(hex(randomblob(12))), ${key}, ${language}, ${text}, datetime('now'), datetime('now'))
        `;
        results.push({ key, language, action: 'created' });
      }
    }

    return NextResponse.json({ 
      message: 'Translations updated successfully',
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error batch updating translations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const language = searchParams.get('language') as Language;

    if (!key) {
      return NextResponse.json(
        { error: 'Key parameter is required' },
        { status: 400 }
      );
    }

    let result;
    if (language) {
      // Delete specific language
      result = await prisma.$executeRaw`
        DELETE FROM Translation 
        WHERE key = ${key} AND language = ${language}
      `;
    } else {
      // Delete all languages for this key
      result = await prisma.$executeRaw`
        DELETE FROM Translation 
        WHERE key = ${key}
      `;
    }

    return NextResponse.json({ 
      message: 'Translation(s) deleted successfully',
      count: result,
      key,
      language: language || 'all'
    });
  } catch (error) {
    console.error('Error deleting translation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

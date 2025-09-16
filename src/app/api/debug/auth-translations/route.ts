import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'en';

    console.log(`🔍 Debug API called for language: ${language}`);

    // Get specific auth translations that were reported as not working
    const authKeys = [
      'auth_sign_in',
      'common_or', 
      'auth_create_new_account',
      'auth_demo_credentials',
      'auth_admin',
      'auth_user',
      'auth_email_address',
      'auth_password',
      'auth_back_to_store'
    ];

    const translations = await prisma.translation.findMany({
      where: {
        language: language,
        key: {
          in: authKeys
        }
      },
      select: {
        key: true,
        text: true,
        language: true
      }
    });

    console.log(`📊 Found ${translations.length} auth translations for language: ${language}`);

    // Also get total count for context
    const totalCount = await prisma.translation.count({
      where: { language: language }
    });

    // Convert to key-value pairs
    const translationsMap: Record<string, string> = {};
    translations.forEach((translation) => {
      translationsMap[translation.key] = translation.text;
    });

    console.log(`📊 Returning ${Object.keys(translationsMap).length} auth translations as map`);

    return NextResponse.json({
      success: true,
      language: language,
      authTranslations: translationsMap,
      foundCount: translations.length,
      expectedCount: authKeys.length,
      totalTranslationsForLanguage: totalCount,
      missingKeys: authKeys.filter(key => !translationsMap[key]),
      requestedKeys: authKeys
    });
  } catch (error) {
    console.error('❌ Error in debug auth translations API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
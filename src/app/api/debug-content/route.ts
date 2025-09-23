// Debug endpoint to check what content is being returned
import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Debug: Fetching content from database...');
    const { db } = await connectToDatabase();
    
    const content = await db.collection('content').find({}).toArray();
    
    console.log('📋 Debug: Raw content from DB:', content);
    
    // Transform to the format expected by the frontend
    const formattedContent: Record<string, string> = {};
    content.forEach((item: any) => {
      if (item.key && item.value) {
        formattedContent[item.key] = item.value;
        console.log(`🔑 ${item.key}: ${typeof item.value === 'string' ? item.value.substring(0, 100) + (item.value.length > 100 ? '...' : '') : item.value}`);
      }
    });
    
    return NextResponse.json({
      success: true,
      data: formattedContent,
      raw: content
    });
  } catch (error) {
    console.error('❌ Debug: Error fetching content:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
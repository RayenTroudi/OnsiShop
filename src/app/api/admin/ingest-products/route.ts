import { requireAdmin } from '@/lib/appwrite/auth';
import { productIngestionService } from '@/lib/services/product-ingestion';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const result = await productIngestionService.ingestProducts();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Ingestion error:', error);
    return NextResponse.json({ error: error.message || 'Ingestion failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireAdmin();

    const status = productIngestionService.getStatus();

    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

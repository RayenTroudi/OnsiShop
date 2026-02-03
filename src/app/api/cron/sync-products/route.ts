import { productIngestionService } from '@/lib/services/product-ingestion';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await productIngestionService.ingestProducts();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Cron sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

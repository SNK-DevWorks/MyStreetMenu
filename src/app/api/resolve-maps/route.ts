import { NextRequest, NextResponse } from 'next/server';
import { resolveLocationInput } from '@/lib/resolve-maps';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ address: null }, { status: 400 });
  }

  const result = await resolveLocationInput(url);
  return NextResponse.json({ address: result.address || null, mapUrl: result.mapUrl });
}

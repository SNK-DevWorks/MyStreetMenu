import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Shop slug parameter is required' }, { status: 400 });
  }

  // Redirect to public menu page
  const menuUrl = new URL(`/menu/${slug}`, request.url);
  return NextResponse.redirect(menuUrl);
}

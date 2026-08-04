import { NextRequest, NextResponse } from 'next/server';
import { likeService } from '@/services/like.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get('shopId');

    if (!shopId) {
      return NextResponse.json({ error: 'shopId is required' }, { status: 400 });
    }

    // Extract visitorId securely from msm_vid cookie (or query fallback)
    const visitorId = req.cookies.get('msm_vid')?.value || searchParams.get('visitorId');

    const snapshot = await likeService.getPublicSocialSnapshot({
      shopId,
      visitorId,
    });

    return NextResponse.json(snapshot);
  } catch (error) {
    console.error('[API /api/menu/social GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch social snapshot' }, { status: 500 });
  }
}

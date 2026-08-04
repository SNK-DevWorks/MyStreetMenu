import { NextRequest, NextResponse } from 'next/server';
import { likeService } from '@/services/like.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shopId, itemId } = body;

    if (!shopId || !itemId) {
      return NextResponse.json(
        { error: 'shopId and itemId are required' },
        { status: 400 }
      );
    }

    // Extract visitorId securely from msm_vid cookie (or body fallback if cookies blocked)
    const visitorId = req.cookies.get('msm_vid')?.value || body.visitorId;

    if (!visitorId) {
      return NextResponse.json(
        { error: 'visitorId could not be determined' },
        { status: 400 }
      );
    }

    const result = await likeService.likeMenuItem({
      shopId,
      itemId,
      visitorId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/menu/like POST Error]:', error);
    return NextResponse.json(
      { error: 'Failed to process like action' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { shopId, itemId } = body;

    if (!shopId || !itemId) {
      return NextResponse.json(
        { error: 'shopId and itemId are required' },
        { status: 400 }
      );
    }

    // Extract visitorId securely from msm_vid cookie (or body fallback if cookies blocked)
    const visitorId = req.cookies.get('msm_vid')?.value || body.visitorId;

    if (!visitorId) {
      return NextResponse.json(
        { error: 'visitorId could not be determined' },
        { status: 400 }
      );
    }

    const result = await likeService.unlikeMenuItem({
      shopId,
      itemId,
      visitorId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/menu/like DELETE Error]:', error);
    return NextResponse.json(
      { error: 'Failed to process unlike action' },
      { status: 500 }
    );
  }
}

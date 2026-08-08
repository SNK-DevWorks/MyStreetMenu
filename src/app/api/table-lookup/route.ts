import { NextRequest, NextResponse } from 'next/server';
import { tableRepository } from '@/repositories';

/**
 * GET /api/table-lookup?shopId={shopId}&t={tableUuid}
 *
 * Public-safe endpoint: resolves a table UUID → { label } for a given shop.
 * Used by the public menu cart to pre-fill & lock the Table Number field when
 * a customer arrives via a table-specific QR code.
 *
 * Returns 200 { label } on success, 404 if the table is not found/inactive.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const shopId = searchParams.get('shopId');
  const tableUuid = searchParams.get('t');

  if (!shopId || !tableUuid) {
    return NextResponse.json({ error: 'shopId and t are required' }, { status: 400 });
  }

  // Basic UUID format check to avoid unnecessary DB hits
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(tableUuid)) {
    return NextResponse.json({ error: 'Invalid table UUID' }, { status: 400 });
  }

  try {
    const row = await tableRepository.findByIdAndShop(tableUuid, shopId);
    if (!row) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }
    return NextResponse.json({ label: row.label });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

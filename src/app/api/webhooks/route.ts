import { NextResponse } from 'next/server';

export async function POST() {
  // Webhook handler for future external events (e.g., payment gateways, external integrations)
  return NextResponse.json({ received: true });
}

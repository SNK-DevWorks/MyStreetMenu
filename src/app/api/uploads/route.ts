import { NextResponse } from 'next/server';

export async function POST() {
  // File upload handler endpoint for media/images
  return NextResponse.json({ message: 'File upload handler' });
}

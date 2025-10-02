import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    message: 'Test endpoint working',
    deliveryItemId: params.id,
    timestamp: new Date().toISOString(),
  });
}

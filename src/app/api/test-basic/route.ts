import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Basic API test successful',
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(request.headers.entries())
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  
  return NextResponse.json({
    message: 'Basic POST test successful',
    receivedData: body,
    timestamp: new Date().toISOString()
  });
} 
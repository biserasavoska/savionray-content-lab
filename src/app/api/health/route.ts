import { NextResponse } from 'next/server';
import { handleApiError, generateRequestId } from '@/lib/utils/error-handling';

export async function GET() {
  const requestId = generateRequestId()
  
  try {
    // Basic health check
    return NextResponse.json(
      { 
        success: true,
        data: {
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          service: 'savionray-content-lab'
        },
        requestId
      },
      { status: 200 }
    );
  } catch (error) {
    const { status, body } = await handleApiError(error, requestId)
    return NextResponse.json(body, { status })
  }
} 
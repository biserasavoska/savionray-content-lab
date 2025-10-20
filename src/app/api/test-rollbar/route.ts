import { NextRequest, NextResponse } from 'next/server';
import { reportApiError, reportApiWarning, reportApiInfo } from '@/lib/middleware/rollbar-middleware';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('type') || 'info';

  switch (testType) {
    case 'error': {
      // Test server-side error reporting
      const error = new Error('Test server-side error for Rollbar');
      reportApiError(error, {
        endpoint: '/api/test-rollbar',
        method: 'GET',
        additionalData: { testType: 'error' }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Server error reported to Rollbar',
        testType: 'error'
      });
    }

    case 'warning':
      // Test server-side warning reporting
      reportApiWarning('Test server-side warning message', {
        endpoint: '/api/test-rollbar',
        method: 'GET',
        additionalData: { testType: 'warning' }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Server warning sent to Rollbar',
        testType: 'warning'
      });

    case 'info':
    default:
      // Test server-side info reporting
      reportApiInfo('Test server-side info message', {
        endpoint: '/api/test-rollbar',
        method: 'GET',
        additionalData: { testType: 'info' }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Server info sent to Rollbar',
        testType: 'info'
      });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, type = 'info' } = body;

  switch (type) {
    case 'error': {
      const error = new Error(message || 'Test POST error for Rollbar');
      reportApiError(error, {
        endpoint: '/api/test-rollbar',
        method: 'POST',
        additionalData: { body }
      });
      break;
    }

    case 'warning':
      reportApiWarning(message || 'Test POST warning', {
        endpoint: '/api/test-rollbar',
        method: 'POST',
        additionalData: { body }
      });
      break;

    case 'info':
    default:
      reportApiInfo(message || 'Test POST info', {
        endpoint: '/api/test-rollbar',
        method: 'POST',
        additionalData: { body }
      });
      break;
  }

  return NextResponse.json({
    success: true,
    message: `${type} message sent to Rollbar`,
    receivedMessage: message,
    type
  });
}

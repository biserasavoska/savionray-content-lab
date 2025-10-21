import { NextRequest, NextResponse } from 'next/server';
import betterStack from '@/lib/betterstack';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('type') || 'info';

  try {
    switch (testType) {
      case 'error': {
        // Test error logging
        const error = new Error('Test error for Better Stack');
        await betterStack.logError('Test error message', error, {
          endpoint: '/api/test-betterstack',
          method: 'GET',
          testType: 'error'
        });
        
        return NextResponse.json({
          success: true,
          message: 'Error logged to Better Stack',
          testType: 'error'
        });
      }

      case 'warning': {
        // Test warning logging
        await betterStack.logWarning('Test warning message', {
          endpoint: '/api/test-betterstack',
          method: 'GET',
          testType: 'warning'
        });
        
        return NextResponse.json({
          success: true,
          message: 'Warning logged to Better Stack',
          testType: 'warning'
        });
      }

      case 'metric': {
        // Test metric tracking
        await betterStack.trackMetric('test_metric', Math.random() * 100, {
          test_type: 'metric',
          endpoint: '/api/test-betterstack'
        });
        
        return NextResponse.json({
          success: true,
          message: 'Metric sent to Better Stack',
          testType: 'metric'
        });
      }

      case 'user-action': {
        // Test user action tracking
        await betterStack.trackUserAction('test_action', 'test-user-123', 'test-org-456', {
          endpoint: '/api/test-betterstack',
          testData: 'sample data'
        });
        
        return NextResponse.json({
          success: true,
          message: 'User action tracked in Better Stack',
          testType: 'user-action'
        });
      }

      case 'info':
      default: {
        // Test info logging
        await betterStack.logInfo('Test info message', {
          endpoint: '/api/test-betterstack',
          method: 'GET',
          testType: 'info'
        });
        
        return NextResponse.json({
          success: true,
          message: 'Info logged to Better Stack',
          testType: 'info'
        });
      }
    }
  } catch (error) {
    await betterStack.logError('Failed to test Better Stack', error as Error, {
      endpoint: '/api/test-betterstack',
      method: 'GET',
      testType
    });
    
    return NextResponse.json({
      success: false,
      message: 'Failed to test Better Stack',
      error: (error as Error).message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, type = 'info', level = 'info' } = body;

    // Log the custom message
    switch (level) {
      case 'error': {
        const error = new Error(message || 'Test POST error for Better Stack');
        await betterStack.logError(message || 'Test POST error', error, {
          endpoint: '/api/test-betterstack',
          method: 'POST',
          additionalData: body
        });
        break;
      }

      case 'warning': {
        await betterStack.logWarning(message || 'Test POST warning', {
          endpoint: '/api/test-betterstack',
          method: 'POST',
          additionalData: body
        });
        break;
      }

      case 'info':
      default: {
        await betterStack.logInfo(message || 'Test POST info', {
          endpoint: '/api/test-betterstack',
          method: 'POST',
          additionalData: body
        });
        break;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${level} message sent to Better Stack`,
      receivedMessage: message,
      level
    });
  } catch (error) {
    await betterStack.logError('Failed to process Better Stack test request', error as Error, {
      endpoint: '/api/test-betterstack',
      method: 'POST'
    });
    
    return NextResponse.json({
      success: false,
      message: 'Failed to process request',
      error: (error as Error).message
    }, { status: 500 });
  }
}


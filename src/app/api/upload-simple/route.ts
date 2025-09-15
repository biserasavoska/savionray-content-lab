import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Simple upload test - starting...')
    
    // Check environment variables
    const envCheck = {
      AWS_REGION: !!process.env.AWS_REGION,
      AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
      AWS_S3_BUCKET: !!process.env.AWS_S3_BUCKET,
    }
    
    console.log('Environment check:', envCheck)
    
    // Test AWS SDK import
    let s3Client
    try {
      const { S3Client } = await import('@aws-sdk/client-s3')
      s3Client = new S3Client({
        region: process.env.AWS_REGION!,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      })
      console.log('✅ AWS S3Client created successfully')
    } catch (error) {
      console.error('❌ AWS S3Client creation failed:', error)
      return NextResponse.json({ 
        error: 'AWS SDK import failed', 
        details: error.message 
      }, { status: 500 })
    }
    
    // Test basic S3 operation
    try {
      const { ListBucketsCommand } = await import('@aws-sdk/client-s3')
      const command = new ListBucketsCommand({})
      const response = await s3Client.send(command)
      console.log('✅ S3 connection test successful')
      
      return NextResponse.json({
        status: 'success',
        message: 'AWS S3 connection working',
        bucketCount: response.Buckets?.length || 0,
        environment: envCheck
      })
    } catch (error) {
      console.error('❌ S3 connection test failed:', error)
      return NextResponse.json({ 
        error: 'S3 connection failed', 
        details: error.message 
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Simple upload test failed:', error)
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error.message 
    }, { status: 500 })
  }
}

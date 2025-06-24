import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  // Set a secret token for security (change this to something only you know)
  const SECRET = process.env.MIGRATION_SECRET || 'letmein123'
  if (token !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return new Promise((resolve) => {
    exec('npx prisma migrate deploy', (error, stdout, stderr) => {
      if (error) {
        resolve(NextResponse.json({ error: stderr || error.message }, { status: 500 }))
      } else {
        resolve(NextResponse.json({ success: true, output: stdout }))
      }
    })
  })
} 
import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  // Set a secret token for security (change this to something only you know)
  const SECRET = process.env.MIGRATION_SECRET || 'letmein123'
  if (token !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy')
    if (stderr) {
      return NextResponse.json({ error: stderr }, { status: 500 })
    }
    return NextResponse.json({ success: true, output: stdout })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 
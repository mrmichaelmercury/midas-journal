import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { message } = await req.json()

  // Placeholder response — replace with actual Anthropic SDK call
  const response = `I've received your message: "${message}". This is a placeholder response. Connect your Anthropic API key to enable real AI responses.`

  return NextResponse.json({ response })
}

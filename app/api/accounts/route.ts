import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { tradovateAuth, encryptCredentials } from '@/lib/tradovate'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const accounts = await prisma.brokerAccount.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      platform: true,
      nickname: true,
      environment: true,
      status: true,
      lastSyncAt: true,
      tradeCount: true,
      createdAt: true,
    },
  })

  return NextResponse.json(accounts)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const body = await req.json()
  const { platform, username, password, environment } = body

  if (!platform || !username || !password || !environment) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (platform === 'tradovate') {
    let authResult
    try {
      authResult = await tradovateAuth(username, password, environment)
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'Authentication failed' }, { status: 400 })
    }

    const encrypted = encryptCredentials({ username, password })

    const account = await prisma.brokerAccount.create({
      data: {
        userId,
        platform,
        nickname: authResult.name || username,
        credentials: { encrypted },
        environment,
        status: 'connected',
      },
      select: {
        id: true,
        platform: true,
        nickname: true,
        environment: true,
        status: true,
        lastSyncAt: true,
        tradeCount: true,
        createdAt: true,
      },
    })

    return NextResponse.json(account)
  }

  return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 })
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const trades = await prisma.trade.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(trades)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const body = await req.json()

  const trade = await prisma.trade.create({
    data: {
      userId,
      instrument: body.instrument,
      direction: body.direction || 'LONG',
      entryPrice: body.entryPrice || 0,
      exitPrice: body.exitPrice || 0,
      quantity: body.quantity || 1,
      pnl: body.pnl || body.dollarAmount || 0,
      date: new Date(body.date),
      strategy: body.strategy || 'Crazy Horse ORB',
      notes: body.notes,
      tags: body.tags || [],
      screenshots: body.screenshots || [],
      outcome: body.outcome,
      dollarAmount: body.dollarAmount,
      startingBalance: body.startingBalance,
      endingBalance: body.endingBalance,
      emotionBefore: body.emotionBefore,
      emotionDuring: body.emotionDuring,
      emotionAfter: body.emotionAfter,
      committed: body.committed,
    },
  })

  return NextResponse.json(trade)
}

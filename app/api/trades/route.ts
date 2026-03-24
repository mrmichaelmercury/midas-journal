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
      direction: body.direction,
      entryPrice: body.entryPrice,
      exitPrice: body.exitPrice,
      quantity: body.quantity || 1,
      pnl: body.pnl,
      date: new Date(body.date),
      strategy: body.strategy || 'Crazy Horse ORB',
      notes: body.notes,
      tags: body.tags || [],
    },
  })

  return NextResponse.json(trade)
}

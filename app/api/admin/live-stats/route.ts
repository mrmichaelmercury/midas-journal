import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getLiveStats } from '@/lib/extension-stats'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [stats, members, today, monthCount, latest] = await Promise.all([
    getLiveStats(),
    prisma.extensionTrade.findMany({
      distinct: ['memberKey'],
      select: { memberKey: true, memberName: true },
    }),
    prisma.extensionTrade.count({ where: { date: { gte: startOfDay } } }),
    prisma.extensionTrade.count({ where: { date: { gte: startOfMonth } } }),
    prisma.extensionTrade.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
  ])

  return NextResponse.json({
    ...stats,
    uniqueMembers: members.length,
    members,
    tradesToday: today,
    tradesThisMonth: monthCount,
    lastTradeAt: latest?.createdAt ?? null,
  })
}

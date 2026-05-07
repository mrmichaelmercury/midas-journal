import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getLiveStats } from '@/lib/extension-stats'
import AdminDashboardClient from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')
  if ((session.user as any).role !== 'admin') redirect('/dashboard')

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [inviteCodes, stats, liveStats, extensionTrades, allMemberTrades, tradesToday, tradesThisMonth] =
    await Promise.all([
      prisma.inviteCode.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      (async () => {
        const [total, active, newThisMonth] = await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { isActive: true } }),
          prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
        ])
        return { total, active, newThisMonth }
      })(),
      getLiveStats(),
      prisma.extensionTrade.findMany({
        orderBy: { date: 'desc' },
        take: 50,
      }),
      prisma.extensionTrade.findMany({
        select: {
          memberKey: true,
          memberName: true,
          date: true,
          outcome: true,
          dollarAmount: true,
        },
      }),
      prisma.extensionTrade.count({ where: { date: { gte: startOfDay } } }),
      prisma.extensionTrade.count({ where: { date: { gte: startOfMonth } } }),
    ])

  type MemberAgg = {
    memberKey: string
    memberName: string | null
    memberNameDate: Date | null
    tradeCount: number
    wins: number
    losses: number
    totalPnl: number
    lastTradeDate: Date
  }
  const byMember = new Map<string, MemberAgg>()
  for (const t of allMemberTrades) {
    let m = byMember.get(t.memberKey)
    if (!m) {
      m = {
        memberKey: t.memberKey,
        memberName: null,
        memberNameDate: null,
        tradeCount: 0,
        wins: 0,
        losses: 0,
        totalPnl: 0,
        lastTradeDate: t.date,
      }
      byMember.set(t.memberKey, m)
    }
    m.tradeCount += 1
    if (t.outcome === 'WIN') {
      m.wins += 1
      m.totalPnl += t.dollarAmount
    } else {
      m.losses += 1
      m.totalPnl -= t.dollarAmount
    }
    if (t.memberName && (!m.memberNameDate || t.date > m.memberNameDate)) {
      m.memberName = t.memberName
      m.memberNameDate = t.date
    }
    if (t.date > m.lastTradeDate) m.lastTradeDate = t.date
  }
  const extensionUsers = Array.from(byMember.values())
    .map((m) => ({
      memberKey: m.memberKey,
      memberName: m.memberName,
      tradeCount: m.tradeCount,
      lastTradeDate: m.lastTradeDate.toISOString(),
      totalPnl: m.totalPnl,
      winRate: m.tradeCount ? Math.round((m.wins / m.tradeCount) * 100) : 0,
    }))
    .sort((a, b) => (a.lastTradeDate < b.lastTradeDate ? 1 : -1))
  const uniqueMembers = extensionUsers.length

  return (
    <AdminDashboardClient
      initialExtensionUsers={extensionUsers}
      initialInviteCodes={inviteCodes}
      stats={stats}
      liveStats={{
        ...liveStats,
        uniqueMembers,
        tradesToday,
        tradesThisMonth,
      }}
      initialTrades={extensionTrades.map((t) => ({
        id: t.id,
        memberKey: t.memberKey,
        memberName: t.memberName,
        date: t.date.toISOString(),
        instrument: t.instrument,
        outcome: t.outcome,
        dollarAmount: t.dollarAmount,
        source: t.source,
        broker: t.broker,
        createdAt: t.createdAt.toISOString(),
      }))}
    />
  )
}

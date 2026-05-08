import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import AdminDashboardClient from './AdminDashboardClient'
import AdminLogin from './AdminLogin'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const adminCookie = cookieStore.get('admin_auth')?.value
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || adminCookie !== expected) {
    return <AdminLogin />
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [inviteCodes, stats, allTrades] = await Promise.all([
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
    prisma.extensionTrade.findMany({
      orderBy: { date: 'desc' },
      select: {
        id: true,
        memberKey: true,
        memberName: true,
        date: true,
        instrument: true,
        outcome: true,
        dollarAmount: true,
        accountName: true,
        source: true,
        broker: true,
      },
    }),
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
  for (const t of allTrades) {
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

  return (
    <AdminDashboardClient
      initialExtensionUsers={extensionUsers}
      initialInviteCodes={inviteCodes}
      stats={stats}
      initialTrades={allTrades.map((t) => ({
        id: t.id,
        memberKey: t.memberKey,
        memberName: t.memberName,
        date: t.date.toISOString(),
        instrument: t.instrument,
        outcome: t.outcome,
        dollarAmount: t.dollarAmount,
        accountName: t.accountName,
        source: t.source,
        broker: t.broker,
      }))}
    />
  )
}

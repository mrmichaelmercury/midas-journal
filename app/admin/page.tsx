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

  const [users, inviteCodes, stats, liveStats, extensionTrades, uniqueMembers, tradesToday, tradesThisMonth] =
    await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
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
      prisma.extensionTrade
        .findMany({ distinct: ['memberKey'], select: { memberKey: true } })
        .then((m) => m.length),
      prisma.extensionTrade.count({ where: { date: { gte: startOfDay } } }),
      prisma.extensionTrade.count({ where: { date: { gte: startOfMonth } } }),
    ])

  return (
    <AdminDashboardClient
      initialUsers={users}
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

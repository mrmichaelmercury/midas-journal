import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')
  if ((session.user as any).role !== 'admin') redirect('/dashboard')

  const [users, inviteCodes, stats] = await Promise.all([
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
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const [total, active, newThisMonth] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      ])
      return { total, active, newThisMonth }
    })(),
  ])

  return (
    <AdminDashboardClient
      initialUsers={users}
      initialInviteCodes={inviteCodes}
      stats={stats}
    />
  )
}

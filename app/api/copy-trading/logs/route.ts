import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id

  const logs = await prisma.copyTradeLog.findMany({
    where: { userId },
    orderBy: { executedAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({ logs })
}

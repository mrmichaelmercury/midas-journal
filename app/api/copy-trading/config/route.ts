import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id

  const config = await prisma.copyTradingConfig.findUnique({
    where: { userId },
    include: { followers: true },
  })

  if (!config) {
    return NextResponse.json({ masterAccountId: null, isActive: false, followers: [] })
  }

  return NextResponse.json(config)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const body = await req.json()
  const { masterAccountId, isActive, followers } = body

  const config = await prisma.copyTradingConfig.upsert({
    where: { userId },
    create: {
      userId,
      masterAccountId: masterAccountId ?? null,
      isActive: isActive ?? false,
    },
    update: {
      masterAccountId: masterAccountId ?? null,
      isActive: isActive ?? false,
    },
  })

  // Sync followers: delete all then recreate
  if (Array.isArray(followers)) {
    await prisma.copyFollower.deleteMany({ where: { configId: config.id } })
    if (followers.length > 0) {
      await prisma.copyFollower.createMany({
        data: followers.map((f: any) => ({
          configId: config.id,
          accountId: f.accountId,
          isEnabled: f.isEnabled ?? true,
          lotMultiplier: f.lotMultiplier ?? 1.0,
        })),
      })
    }
  }

  const updated = await prisma.copyTradingConfig.findUnique({
    where: { userId },
    include: { followers: true },
  })

  return NextResponse.json(updated)
}

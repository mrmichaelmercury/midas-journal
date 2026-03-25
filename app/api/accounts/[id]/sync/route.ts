import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  tradovateAuth,
  fetchTradovateAccounts,
  fetchTradovateFills,
  decryptCredentials,
  type TradovateEnvironment,
} from '@/lib/tradovate'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const { id } = await params

  const account = await prisma.brokerAccount.findUnique({ where: { id } })
  if (!account || account.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.brokerAccount.update({ where: { id }, data: { status: 'syncing' } })

  try {
    const creds = decryptCredentials((account.credentials as any).encrypted)
    const environment = account.environment as TradovateEnvironment

    const auth = await tradovateAuth(creds.username, creds.password, environment)
    const tvAccounts = await fetchTradovateAccounts(auth.accessToken, environment)
    const firstAccount = tvAccounts[0]

    const fills = await fetchTradovateFills(
      auth.accessToken,
      environment,
      firstAccount?.id
    )

    await prisma.brokerAccount.update({
      where: { id },
      data: {
        status: 'connected',
        lastSyncAt: new Date(),
        tradeCount: fills.length,
      },
    })

    return NextResponse.json({ success: true, tradeCount: fills.length })
  } catch (err: any) {
    await prisma.brokerAccount.update({
      where: { id },
      data: { status: 'error' },
    })
    return NextResponse.json({ error: err.message || 'Sync failed' }, { status: 500 })
  }
}

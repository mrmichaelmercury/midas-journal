import { prisma } from './db'

export type LiveStats = {
  winRate: number
  streak: number
  record: { wins: number; losses: number }
  totalTrades: number
  totalPnl: number
}

export async function getLiveStats(): Promise<LiveStats> {
  const [wins, losses, sumWin, sumLoss, recent] = await Promise.all([
    prisma.extensionTrade.count({ where: { outcome: 'WIN' } }),
    prisma.extensionTrade.count({ where: { outcome: 'LOSS' } }),
    prisma.extensionTrade.aggregate({
      where: { outcome: 'WIN' },
      _sum: { dollarAmount: true },
    }),
    prisma.extensionTrade.aggregate({
      where: { outcome: 'LOSS' },
      _sum: { dollarAmount: true },
    }),
    prisma.extensionTrade.findMany({
      orderBy: { date: 'desc' },
      take: 100,
      select: { outcome: true },
    }),
  ])

  const totalTrades = wins + losses
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0

  // Current win streak across most recent trades.
  let streak = 0
  for (const t of recent) {
    if (t.outcome === 'WIN') streak++
    else break
  }

  const totalPnl = (sumWin._sum.dollarAmount ?? 0) - Math.abs(sumLoss._sum.dollarAmount ?? 0)

  return {
    winRate,
    streak,
    record: { wins, losses },
    totalTrades,
    totalPnl,
  }
}

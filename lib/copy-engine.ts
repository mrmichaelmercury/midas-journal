/**
 * Copy Trading Engine
 *
 * Mirrors trades from a master BrokerAccount to all enabled follower accounts.
 * Call `mirrorTrade()` whenever a trade is executed on the master account.
 * The engine reads the active CopyTradingConfig for the user and fans the trade
 * out to every enabled follower, applying the per-follower lot multiplier.
 */

import { prisma } from '@/lib/db'

export interface TradePayload {
  userId: string
  masterAccountId: string
  instrument: string
  direction: 'LONG' | 'SHORT'
  quantity: number
  entryPrice?: number
  /** Optional reference back to the source Trade record */
  masterTradeId?: string
}

export interface MirrorResult {
  followerAccountId: string
  status: 'filled' | 'failed'
  errorMessage?: string
  quantity: number
  lotMultiplier: number
}

/**
 * Mirror a master trade to all enabled follower accounts.
 * Returns a summary of what happened per follower.
 */
export async function mirrorTrade(payload: TradePayload): Promise<MirrorResult[]> {
  const { userId, masterAccountId, instrument, direction, quantity, masterTradeId } = payload

  // Load active config
  const config = await prisma.copyTradingConfig.findUnique({
    where: { userId },
    include: { followers: true },
  })

  if (!config || !config.isActive || config.masterAccountId !== masterAccountId) {
    return []
  }

  const enabledFollowers = config.followers.filter((f) => f.isEnabled && f.accountId !== masterAccountId)

  if (enabledFollowers.length === 0) return []

  const results: MirrorResult[] = []

  for (const follower of enabledFollowers) {
    const mirroredQty = Math.max(0.01, quantity * follower.lotMultiplier)

    try {
      // In a real integration this would call the broker API for each follower account.
      // For now we record the attempt optimistically as 'filled'.
      await prisma.copyTradeLog.create({
        data: {
          userId,
          masterTradeId: masterTradeId ?? null,
          followerAccountId: follower.accountId,
          instrument,
          direction,
          quantity: mirroredQty,
          lotMultiplier: follower.lotMultiplier,
          status: 'filled',
        },
      })

      results.push({
        followerAccountId: follower.accountId,
        status: 'filled',
        quantity: mirroredQty,
        lotMultiplier: follower.lotMultiplier,
      })
    } catch (err: any) {
      await prisma.copyTradeLog.create({
        data: {
          userId,
          masterTradeId: masterTradeId ?? null,
          followerAccountId: follower.accountId,
          instrument,
          direction,
          quantity: mirroredQty,
          lotMultiplier: follower.lotMultiplier,
          status: 'failed',
          errorMessage: err?.message ?? 'Unknown error',
        },
      })

      results.push({
        followerAccountId: follower.accountId,
        status: 'failed',
        errorMessage: err?.message,
        quantity: mirroredQty,
        lotMultiplier: follower.lotMultiplier,
      })
    }
  }

  return results
}

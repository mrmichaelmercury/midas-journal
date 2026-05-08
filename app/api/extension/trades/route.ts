import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { CORS_HEADERS, corsPreflight } from '@/lib/cors'

export const dynamic = 'force-dynamic'

type IncomingTrade = {
  date?: string
  instrument?: string
  outcome?: string
  dollarAmount?: number
  accountName?: string | null
  direction?: string | null
  entryPrice?: number | null
  exitPrice?: number | null
  quantity?: number | null
  entryTrigger?: string | null
  moodBefore?: string | null
  moodAfter?: string | null
  notes?: string | null
  source?: string | null
  broker?: string | null
  tradeType?: string | null
}

const VALID_TRADE_TYPES = new Set(['live', 'demo', 'backtest'])

export function OPTIONS() {
  return corsPreflight()
}

export async function POST(req: NextRequest) {
  let body: { memberKey?: string; memberName?: string | null; trades?: IncomingTrade[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS_HEADERS })
  }

  const memberKey = body.memberKey?.trim()
  const memberName = body.memberName ?? null
  const trades = Array.isArray(body.trades) ? body.trades : []

  if (!memberKey) {
    return NextResponse.json({ error: 'memberKey required' }, { status: 400, headers: CORS_HEADERS })
  }
  if (!trades.length) {
    return NextResponse.json({ error: 'trades array required' }, { status: 400, headers: CORS_HEADERS })
  }

  const rows = trades
    .map((t) => {
      const date = t.date ? new Date(t.date) : null
      const outcome = typeof t.outcome === 'string' ? t.outcome.toUpperCase() : null
      const dollarAmount = typeof t.dollarAmount === 'number' ? t.dollarAmount : Number(t.dollarAmount)
      if (!date || isNaN(date.getTime())) return null
      if (!t.instrument) return null
      if (outcome !== 'WIN' && outcome !== 'LOSS') return null
      if (!Number.isFinite(dollarAmount)) return null
      const rawTradeType = typeof t.tradeType === 'string' ? t.tradeType.toLowerCase() : null
      const tradeType = rawTradeType && VALID_TRADE_TYPES.has(rawTradeType) ? rawTradeType : 'live'
      return {
        memberKey,
        memberName,
        date,
        instrument: String(t.instrument),
        outcome,
        dollarAmount,
        accountName: t.accountName ?? null,
        direction: t.direction ?? null,
        entryPrice: typeof t.entryPrice === 'number' ? t.entryPrice : null,
        exitPrice: typeof t.exitPrice === 'number' ? t.exitPrice : null,
        quantity: typeof t.quantity === 'number' ? t.quantity : 1,
        entryTrigger: t.entryTrigger ?? null,
        moodBefore: t.moodBefore ?? null,
        moodAfter: t.moodAfter ?? null,
        notes: t.notes ?? null,
        source: t.source ?? 'manual',
        broker: t.broker ?? null,
        tradeType,
      }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)

  if (!rows.length) {
    return NextResponse.json({ error: 'No valid trades in payload' }, { status: 400, headers: CORS_HEADERS })
  }

  // Append-only: extension sends one trade per manual entry, so we insert and
  // dedupe by (memberKey, date, instrument, dollarAmount, outcome) to keep
  // re-syncs idempotent without wiping prior history.
  const existing = await prisma.extensionTrade.findMany({
    where: { memberKey, date: { in: rows.map((r) => r.date) } },
    select: { date: true, instrument: true, outcome: true, dollarAmount: true },
  })
  const dedupeKey = (r: { date: Date; instrument: string; outcome: string; dollarAmount: number }) =>
    `${r.date.getTime()}|${r.instrument}|${r.outcome}|${r.dollarAmount}`
  const seen = new Set(existing.map(dedupeKey))
  const toInsert = rows.filter((r) => !seen.has(dedupeKey(r)))

  const created = toInsert.length
    ? await prisma.extensionTrade.createMany({ data: toInsert })
    : { count: 0 }

  return NextResponse.json(
    {
      ok: true,
      inserted: created.count,
      duplicates: rows.length - toInsert.length,
      skipped: trades.length - rows.length,
    },
    { headers: CORS_HEADERS }
  )
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 200), 1000)
  const offset = Math.max(Number(req.nextUrl.searchParams.get('offset') ?? 0), 0)
  const memberKey = req.nextUrl.searchParams.get('memberKey') || undefined

  const where = memberKey ? { memberKey } : {}
  const [trades, total] = await Promise.all([
    prisma.extensionTrade.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.extensionTrade.count({ where }),
  ])

  return NextResponse.json({ trades, total })
}

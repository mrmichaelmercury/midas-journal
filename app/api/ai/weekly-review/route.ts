import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id

  // Fetch trades from the past 7 days
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const trades = await prisma.trade.findMany({
    where: {
      userId,
      date: { gte: oneWeekAgo },
    },
    orderBy: { date: 'asc' },
  })

  if (trades.length === 0) {
    return NextResponse.json({
      review: "No trades found in the past 7 days. Start logging your trades to get a personalized weekly review!",
      hasData: false,
    })
  }

  // Format trades for Claude
  const tradesSummary = trades.map((t) => {
    const lines = [
      `Date: ${t.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`,
      `Instrument: ${t.instrument}`,
      `Result: ${t.outcome || (t.pnl >= 0 ? 'WIN' : 'LOSS')} — $${Math.abs(t.dollarAmount ?? t.pnl).toFixed(2)}`,
      t.startingBalance ? `Starting Balance: $${t.startingBalance.toFixed(2)}` : null,
      t.endingBalance ? `Ending Balance: $${t.endingBalance.toFixed(2)}` : null,
      t.emotionBefore ? `Emotion Before: ${t.emotionBefore}` : null,
      t.emotionDuring ? `Emotion During: ${t.emotionDuring}` : null,
      t.emotionAfter ? `Emotion After: ${t.emotionAfter}` : null,
      t.committed !== null ? `Committed to plan: ${t.committed ? 'Yes' : 'No'}` : null,
      t.notes ? `Notes: "${t.notes}"` : null,
    ]
    return lines.filter(Boolean).join('\n')
  }).join('\n\n---\n\n')

  const totalPnl = trades.reduce((sum, t) => sum + (t.dollarAmount ? (t.outcome === 'WIN' ? t.dollarAmount : -t.dollarAmount) : t.pnl), 0)
  const wins = trades.filter((t) => (t.outcome === 'WIN') || (!t.outcome && t.pnl > 0))
  const losses = trades.filter((t) => (t.outcome === 'LOSS') || (!t.outcome && t.pnl <= 0))
  const winRate = trades.length > 0 ? Math.round((wins.length / trades.length) * 100) : 0

  const prompt = `You are a trading coach and performance analyst reviewing a trader's week. Your tone is direct, warm, and honest — like a mentor who genuinely cares about their growth.

Here is the trader's data for the past 7 days:

SUMMARY:
- Total Trades: ${trades.length}
- Wins: ${wins.length} | Losses: ${losses.length}
- Win Rate: ${winRate}%
- Total P&L: ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}

INDIVIDUAL TRADE ENTRIES:
${tradesSummary}

Please write a personalized weekly review that:
1. Opens with a 1-2 sentence honest assessment of the week overall
2. Highlights what went well (reference specific trades/days by date when possible)
3. Identifies the most important pattern to work on (be specific — reference emotion data, notes content, or behavioral patterns you see)
4. Notes any emotion-performance correlations (e.g., "On days you felt anxious before, you tended to lose..." or "Your best trades came when you were...")
5. Ends with ONE specific, actionable focus for next week

Keep the entire review under 350 words. Use markdown formatting with headers (##). Be specific and reference their actual data — don't be generic. If they committed to protecting their day after wins/losses, note whether that discipline is showing up.`

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const reviewText = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({
      review: reviewText,
      hasData: true,
      stats: {
        totalTrades: trades.length,
        wins: wins.length,
        losses: losses.length,
        winRate,
        totalPnl,
      },
    })
  } catch (error: any) {
    console.error('Anthropic API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate review. Check your ANTHROPIC_API_KEY.' },
      { status: 500 }
    )
  }
}

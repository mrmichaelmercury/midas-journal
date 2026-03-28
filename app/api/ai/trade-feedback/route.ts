import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const {
    instrument,
    outcome,
    dollarAmount,
    startingBalance,
    endingBalance,
    emotionBefore,
    emotionDuring,
    emotionAfter,
    notes,
    committed,
  } = await req.json()

  if (!outcome || !dollarAmount) {
    return NextResponse.json({ error: 'outcome and dollarAmount are required' }, { status: 400 })
  }

  const tradeDetails = [
    `Instrument: ${instrument}`,
    `Result: ${outcome} — $${Math.abs(dollarAmount).toFixed(2)}`,
    startingBalance ? `Starting Balance: $${startingBalance.toFixed(2)}` : null,
    endingBalance ? `Ending Balance: $${endingBalance.toFixed(2)}` : null,
    `Emotion Before: ${emotionBefore}`,
    `Emotion During: ${emotionDuring}`,
    `Emotion After: ${emotionAfter}`,
    committed !== undefined ? `Committed to plan: ${committed ? 'Yes' : 'No'}` : null,
    notes ? `Trader notes: "${notes}"` : null,
  ].filter(Boolean).join('\n')

  const prompt = `You are the Midas Edge AI trading coach for the Crazy Horse ORB (Opening Range Breakout) strategy community. Your role is to provide honest, direct, and actionable feedback on individual trades. You understand that emotional discipline and consistent execution are the keys to prop firm success.

A trader just logged this trade:

${tradeDetails}

Provide 3-4 sentences of actionable feedback. Be specific to what they shared — reference their emotions, the outcome, their notes if provided, and their commitment. If their emotions suggest they were in a poor state, address it directly. If they won but showed signs of overconfidence, warn them. If they lost but showed good discipline, acknowledge it. Always tie back to the Crazy Horse ORB principles of waiting for clean setups and protecting the account. Be direct, warm, and honest — like a coach who genuinely cares about their growth.`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })

    const feedback = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({ feedback })
  } catch (error: any) {
    console.error('Anthropic API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate feedback. Check your ANTHROPIC_API_KEY.' },
      { status: 500 }
    )
  }
}

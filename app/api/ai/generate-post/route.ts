import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { trade } = await req.json()

  // Placeholder post ideas — replace with Anthropic SDK
  const postIdeas = [
    {
      title: `${trade.pnl > 0 ? '🟢' : '🔴'} ${trade.instrument} ${trade.direction} Trade Recap`,
      preview: `Sharing my ${trade.instrument} ${trade.direction} trade from today using the Crazy Horse ORB strategy...`,
      type: 'recap',
    },
    {
      title: `💡 Lesson Learned: ${trade.instrument} Setup Today`,
      preview: `Every trade is a lesson. Here's what today's ${trade.instrument} trade taught me about the ORB setup...`,
      type: 'educational',
    },
    {
      title: `📊 ${trade.instrument} Analysis: What I Saw Before Entry`,
      preview: `Breaking down my pre-trade analysis for the ${trade.instrument} setup this morning...`,
      type: 'analysis',
    },
  ]

  return NextResponse.json({ postIdeas })
}

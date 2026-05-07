import { NextResponse } from 'next/server'
import { getLiveStats } from '@/lib/extension-stats'
import { CORS_HEADERS, corsPreflight } from '@/lib/cors'

export const dynamic = 'force-dynamic'

export function OPTIONS() {
  return corsPreflight()
}

export async function GET() {
  const stats = await getLiveStats()
  return NextResponse.json(
    {
      winRate: stats.winRate,
      streak: stats.streak,
      record: stats.record,
    },
    { headers: CORS_HEADERS }
  )
}

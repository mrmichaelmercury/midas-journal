'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type ReviewData = {
  review: string
  hasData: boolean
  stats?: {
    totalTrades: number
    wins: number
    losses: number
    winRate: number
    totalPnl: number
  }
}

function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## ')) {
      return (
        <h2 key={i} className="text-lg font-bold text-gray-900 mt-6 mb-2 first:mt-0">
          {line.replace('## ', '')}
        </h2>
      )
    }
    if (line.startsWith('# ')) {
      return (
        <h1 key={i} className="text-xl font-black text-gray-900 mt-6 mb-3 first:mt-0">
          {line.replace('# ', '')}
        </h1>
      )
    }
    if (line.trim() === '') {
      return <div key={i} className="h-2" />
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    return (
      <p key={i} className="text-gray-700 leading-relaxed text-sm">
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={j} className="text-gray-900 font-semibold">
              {part.slice(2, -2)}
            </strong>
          ) : (
            part
          )
        )}
      </p>
    )
  })
}

export default function WeeklyReviewPage() {
  const [data, setData] = useState<ReviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchReview = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/weekly-review')
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to generate review')
      }
      const json = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const isPositive = (data?.stats?.totalPnl ?? 0) >= 0

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          AI Weekly Review
        </h1>
        <p className="text-gray-500 mt-1.5 text-sm">
          Your personalized analysis of the past 7 days — emotions, patterns, and what to focus on next.
        </p>
      </div>

      {/* Generate button */}
      {!data && !loading && (
        <div className="glass rounded-2xl p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-5">
            <Sparkles className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Ready for your review?</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">
            Claude will analyze your trades, emotions, notes, and patterns from the past 7 days and give you honest, specific feedback.
          </p>
          <button
            onClick={fetchReview}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-8 py-3.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Generate My Review
          </button>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass rounded-2xl p-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
            <div className="w-6 h-6 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
          <p className="text-gray-700 text-sm">Analyzing your week...</p>
          <p className="text-gray-400 text-xs mt-1">Reading your emotions, notes, and patterns</p>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-5">
          {/* Stats bar */}
          {data.hasData && data.stats && (
            <div className="grid grid-cols-4 gap-3">
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Trades</div>
                <div className="text-xl font-black text-gray-900">{data.stats.totalTrades}</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Win Rate</div>
                <div className="text-xl font-black text-amber-600">{data.stats.winRate}%</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">W / L</div>
                <div className="text-xl font-black text-gray-900">
                  <span className="text-emerald-600">{data.stats.wins}</span>
                  <span className="text-gray-300 mx-1">/</span>
                  <span className="text-red-500">{data.stats.losses}</span>
                </div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">P&L</div>
                <div className={cn('text-xl font-black', isPositive ? 'text-emerald-600' : 'text-red-500')}>
                  {isPositive ? '+' : ''}${Math.abs(data.stats.totalPnl).toFixed(0)}
                </div>
              </div>
            </div>
          )}

          {/* AI Review */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <span className="font-bold text-gray-900 text-sm">Claude&apos;s Analysis</span>
              </div>
              <button
                onClick={fetchReview}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-600 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
            </div>
            <div className="space-y-0.5">
              {renderMarkdown(data.review)}
            </div>
          </div>

          {!data.hasData && (
            <div className="glass rounded-2xl p-8 text-center">
              <BarChart2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">{data.review}</p>
              <p className="text-gray-400 text-xs mt-2">Log some trades and come back for your review.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

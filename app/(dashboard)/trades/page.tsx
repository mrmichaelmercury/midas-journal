'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import { cn, formatCurrency, formatDate, getPnlColor } from '@/lib/utils'

const mockTrades = [
  { id: '1', instrument: 'NQ', direction: 'LONG', entryPrice: 17850, exitPrice: 17920, pnl: 1400, date: '2024-01-19', strategy: 'Crazy Horse ORB', notes: 'Clean breakout above ORB high. Held for full target.', tags: ['ORB', 'clean-setup'] },
  { id: '2', instrument: 'ES', direction: 'SHORT', entryPrice: 4890, exitPrice: 4896, pnl: -300, date: '2024-01-18', strategy: 'Crazy Horse ORB', notes: 'Fakeout. Stopped out at 1R.', tags: ['ORB', 'stopped-out'] },
  { id: '3', instrument: 'NQ', direction: 'LONG', entryPrice: 17780, exitPrice: 17830, pnl: 1000, date: '2024-01-17', strategy: 'Crazy Horse ORB', notes: 'Good entry. Took partial at 2R.', tags: ['ORB', 'partial'] },
  { id: '4', instrument: 'MNQ', direction: 'SHORT', entryPrice: 17950, exitPrice: 17910, pnl: 400, date: '2024-01-16', strategy: 'Crazy Horse ORB', notes: 'Textbook short below ORB low.', tags: ['ORB'] },
  { id: '5', instrument: 'ES', direction: 'LONG', entryPrice: 4875, exitPrice: 4870, pnl: -250, date: '2024-01-15', strategy: 'Crazy Horse ORB', notes: 'Bad entry. Chased the move.', tags: ['mistake', 'FOMO'] },
]

export default function TradesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = mockTrades.filter((t) => {
    const matchSearch = t.instrument.toLowerCase().includes(search.toLowerCase()) || t.notes.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'wins' && t.pnl > 0) || (filter === 'losses' && t.pnl < 0)
    return matchSearch && matchFilter
  })

  const totalPnl = filtered.reduce((s, t) => s + t.pnl, 0)
  const wins = filtered.filter((t) => t.pnl > 0).length
  const winRate = filtered.length ? ((wins / filtered.length) * 100).toFixed(1) : '0'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Trade Journal</h1>
          <p className="text-gray-500 mt-1">
            {filtered.length} trades ·
            <span className={cn('ml-1 font-semibold', getPnlColor(totalPnl))}>
              {totalPnl > 0 ? '+' : ''}{formatCurrency(totalPnl)}
            </span>
            {' '}· {winRate}% win rate
          </p>
        </div>
        <Link
          href="/trades/new"
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Log Trade
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trades..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-amber-500/40"
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'wins', 'losses'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize',
                filter === f ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-gray-500 border border-white/10 hover:text-gray-300'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Trade list */}
      <div className="space-y-3">
        {filtered.map((trade) => (
          <div key={trade.id} className="glass rounded-2xl p-5 hover:border-white/10 transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex flex-col items-center justify-center',
                  trade.pnl > 0 ? 'bg-emerald-400/10 border border-emerald-400/20' : 'bg-red-400/10 border border-red-400/20'
                )}>
                  {trade.direction === 'LONG' ? (
                    <TrendingUp className={cn('w-5 h-5', trade.pnl > 0 ? 'text-emerald-400' : 'text-red-400')} />
                  ) : (
                    <TrendingDown className={cn('w-5 h-5', trade.pnl > 0 ? 'text-emerald-400' : 'text-red-400')} />
                  )}
                  <span className={cn('text-xs font-bold mt-0.5', trade.pnl > 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {trade.direction}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-lg">{trade.instrument}</span>
                    <span className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full">
                      {trade.strategy}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    Entry: {trade.entryPrice} → Exit: {trade.exitPrice} · {formatDate(trade.date)}
                  </div>
                  {trade.notes && (
                    <p className="text-xs text-gray-500 mt-1.5 max-w-md">{trade.notes}</p>
                  )}
                  <div className="flex gap-1.5 mt-2">
                    {trade.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-amber-500/10 text-amber-400/70 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className={cn('text-2xl font-black', getPnlColor(trade.pnl))}>
                  {trade.pnl > 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                </div>
                <button className="flex items-center gap-1.5 text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg hover:bg-purple-500/20 transition-all opacity-0 group-hover:opacity-100">
                  <Sparkles className="w-3 h-3" />
                  Generate Post
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown, Plus, ChevronDown, ChevronUp, BadgeCheck, PenLine } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

interface TradeDetail {
  id: string
  instrument: string
  direction: 'LONG' | 'SHORT'
  outcome: 'WIN' | 'LOSS'
  pnl: number
  time: string
  notes?: string
  emotionBefore?: string
  emotionDuring?: string
  emotionAfter?: string
  synced: boolean
}

interface DayData {
  pnl: number
  trades: number
  tradeDetails?: TradeDetail[]
  notes?: string
  committed?: boolean
  emotionBefore?: string
  emotionDuring?: string
  emotionAfter?: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockDayData: Record<string, DayData> = {
  '2024-01-01': {
    pnl: 840, trades: 2,
    notes: 'Solid morning session. Stayed disciplined with my plan.',
    committed: true,
    emotionBefore: 'confident', emotionDuring: 'calm', emotionAfter: 'satisfied',
    tradeDetails: [
      { id: '1', instrument: 'ES', direction: 'LONG', outcome: 'WIN', pnl: 625, time: '09:32', notes: 'Clean breakout above VWAP. Took full profit at target.', synced: true },
      { id: '2', instrument: 'NQ', direction: 'LONG', outcome: 'WIN', pnl: 215, time: '10:15', notes: 'Continuation play.', synced: true },
    ],
  },
  '2024-01-02': {
    pnl: -320, trades: 1,
    notes: 'Chased a trade I should have avoided. Need to be more patient.',
    committed: false,
    emotionBefore: 'anxious', emotionDuring: 'fearful', emotionAfter: 'frustrated',
    tradeDetails: [
      { id: '3', instrument: 'ES', direction: 'SHORT', outcome: 'LOSS', pnl: -320, time: '14:05', notes: 'Entered late on a breakdown. Should have waited for retest.', synced: true },
    ],
  },
  '2024-01-03': {
    pnl: 1240, trades: 3,
    notes: 'Best day of the week. All three setups were textbook.',
    committed: true,
    emotionBefore: 'confident', emotionDuring: 'focused', emotionAfter: 'satisfied',
    tradeDetails: [
      { id: '4', instrument: 'ES', direction: 'LONG', outcome: 'WIN', pnl: 540, time: '09:45', synced: false },
      { id: '5', instrument: 'NQ', direction: 'SHORT', outcome: 'WIN', pnl: 480, time: '11:20', synced: false },
      { id: '6', instrument: 'ES', direction: 'LONG', outcome: 'WIN', pnl: 220, time: '13:40', synced: false },
    ],
  },
  '2024-01-04': { pnl: 560, trades: 2, committed: true, emotionBefore: 'neutral', emotionAfter: 'satisfied', tradeDetails: [
    { id: '7', instrument: 'ES', direction: 'LONG', outcome: 'WIN', pnl: 340, time: '10:02', synced: true },
    { id: '8', instrument: 'MES', direction: 'SHORT', outcome: 'WIN', pnl: 220, time: '11:55', synced: true },
  ]},
  '2024-01-07': { pnl: -180, trades: 1, committed: true, emotionBefore: 'neutral', emotionAfter: 'neutral', tradeDetails: [
    { id: '9', instrument: 'NQ', direction: 'SHORT', outcome: 'LOSS', pnl: -180, time: '09:48', synced: true },
  ]},
  '2024-01-08': { pnl: 920, trades: 2, committed: true, tradeDetails: [
    { id: '10', instrument: 'ES', direction: 'LONG', outcome: 'WIN', pnl: 620, time: '10:10', synced: false },
    { id: '11', instrument: 'ES', direction: 'LONG', outcome: 'WIN', pnl: 300, time: '13:22', synced: false },
  ]},
  '2024-01-09': { pnl: 430, trades: 1, tradeDetails: [
    { id: '12', instrument: 'MNQ', direction: 'LONG', outcome: 'WIN', pnl: 430, time: '11:05', synced: true },
  ]},
  '2024-01-10': { pnl: -450, trades: 2, tradeDetails: [
    { id: '13', instrument: 'ES', direction: 'SHORT', outcome: 'LOSS', pnl: -250, time: '09:55', synced: true },
    { id: '14', instrument: 'NQ', direction: 'SHORT', outcome: 'LOSS', pnl: -200, time: '14:30', synced: true },
  ]},
  '2024-01-11': { pnl: 1100, trades: 3, committed: true, tradeDetails: [
    { id: '15', instrument: 'ES', direction: 'LONG', outcome: 'WIN', pnl: 480, time: '09:38', synced: false },
    { id: '16', instrument: 'NQ', direction: 'LONG', outcome: 'WIN', pnl: 390, time: '10:50', synced: false },
    { id: '17', instrument: 'ES', direction: 'LONG', outcome: 'WIN', pnl: 230, time: '13:15', synced: false },
  ]},
  '2024-01-14': { pnl: 660, trades: 2, tradeDetails: [
    { id: '18', instrument: 'ES', direction: 'LONG', outcome: 'WIN', pnl: 440, time: '10:20', synced: true },
    { id: '19', instrument: 'MNQ', direction: 'SHORT', outcome: 'WIN', pnl: 220, time: '12:05', synced: true },
  ]},
  '2024-01-15': { pnl: -230, trades: 1, tradeDetails: [
    { id: '20', instrument: 'NQ', direction: 'LONG', outcome: 'LOSS', pnl: -230, time: '14:45', synced: true },
  ]},
  '2024-01-16': { pnl: 780, trades: 2, committed: true, tradeDetails: [
    { id: '21', instrument: 'ES', direction: 'LONG', outcome: 'WIN', pnl: 500, time: '09:42', synced: false },
    { id: '22', instrument: 'MES', direction: 'LONG', outcome: 'WIN', pnl: 280, time: '11:30', synced: false },
  ]},
  '2024-01-17': { pnl: 1350, trades: 3, committed: true, emotionBefore: 'confident', emotionDuring: 'focused', emotionAfter: 'satisfied', tradeDetails: [
    { id: '23', instrument: 'ES', direction: 'LONG', outcome: 'WIN', pnl: 600, time: '09:35', synced: true },
    { id: '24', instrument: 'NQ', direction: 'SHORT', outcome: 'WIN', pnl: 450, time: '11:10', synced: true },
    { id: '25', instrument: 'ES', direction: 'LONG', outcome: 'WIN', pnl: 300, time: '14:00', synced: true },
  ]},
  '2024-01-18': { pnl: -120, trades: 1, tradeDetails: [
    { id: '26', instrument: 'MNQ', direction: 'SHORT', outcome: 'LOSS', pnl: -120, time: '13:50', synced: true },
  ]},
}

// ─── Emotion Emoji Map ────────────────────────────────────────────────────────

const emotionEmoji: Record<string, string> = {
  confident: '💪',
  focused:   '🎯',
  calm:      '😌',
  neutral:   '😐',
  anxious:   '😰',
  fearful:   '😨',
  excited:   '🤩',
  frustrated:'😤',
  satisfied: '😊',
}

// ─── Trade Row ────────────────────────────────────────────────────────────────

function TradeRow({ trade }: { trade: TradeDetail }) {
  const [expanded, setExpanded] = useState(false)
  const isWin = trade.outcome === 'WIN'

  return (
    <div className={cn(
      'rounded-xl border transition-all',
      isWin ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isWin ? 'bg-emerald-500/20' : 'bg-red-500/20'
        )}>
          {isWin
            ? <TrendingUp className="w-4 h-4 text-emerald-400" />
            : <TrendingDown className="w-4 h-4 text-red-400" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{trade.instrument}</span>
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded font-medium',
              trade.direction === 'LONG' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
            )}>
              {trade.direction}
            </span>
            {trade.synced
              ? <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 flex items-center gap-1"><BadgeCheck className="w-3 h-3" />Synced</span>
              : <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-gray-400 flex items-center gap-1"><PenLine className="w-3 h-3" />Manual</span>
            }
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{trade.time}</div>
        </div>
        <div className="text-right flex-shrink-0 flex items-center gap-2">
          <span className={cn('text-sm font-black', isWin ? 'text-emerald-400' : 'text-red-400')}>
            {trade.pnl > 0 ? '+' : ''}{formatCurrency(trade.pnl)}
          </span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-gray-500" />
            : <ChevronDown className="w-4 h-4 text-gray-500" />
          }
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-white/5 pt-3 space-y-2">
          {trade.notes && (
            <p className="text-xs text-gray-400 leading-relaxed">{trade.notes}</p>
          )}
          {(trade.emotionBefore || trade.emotionDuring || trade.emotionAfter) && (
            <div className="flex gap-3 text-xs text-gray-500">
              {trade.emotionBefore && (
                <span>Before: {emotionEmoji[trade.emotionBefore] ?? ''} {trade.emotionBefore}</span>
              )}
              {trade.emotionDuring && (
                <span>During: {emotionEmoji[trade.emotionDuring] ?? ''} {trade.emotionDuring}</span>
              )}
              {trade.emotionAfter && (
                <span>After: {emotionEmoji[trade.emotionAfter] ?? ''} {trade.emotionAfter}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Day Detail Panel ─────────────────────────────────────────────────────────

function DayDetailPanel({ dateKey, data, onClose }: { dateKey: string; data: DayData | null; onClose: () => void }) {
  const date = new Date(dateKey + 'T12:00:00')
  const longDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const trades = data?.tradeDetails ?? []
  const wins = trades.filter(t => t.outcome === 'WIN')
  const losses = trades.filter(t => t.outcome === 'LOSS')
  const largestWin = wins.length > 0 ? Math.max(...wins.map(t => t.pnl)) : null
  const largestLoss = losses.length > 0 ? Math.min(...losses.map(t => t.pnl)) : null
  const winRate = trades.length > 0 ? Math.round((wins.length / trades.length) * 100) : null
  const net = data?.pnl ?? 0
  const isGreen = net > 0
  const isRed = net < 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0f0f0f] border-l border-white/10 z-50 flex flex-col shadow-2xl animate-slide-in-right overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-white/8 flex-shrink-0">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Day View</p>
            <h2 className="text-lg font-black text-white leading-tight">{longDate}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-all text-gray-400 hover:text-white mt-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* P&L Summary */}
          <div className={cn(
            'rounded-2xl p-4 border',
            isGreen ? 'bg-emerald-500/10 border-emerald-500/20'
            : isRed  ? 'bg-red-500/10 border-red-500/20'
            :          'bg-white/5 border-white/10'
          )}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Net P&L</span>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                isGreen ? 'bg-emerald-500/20 text-emerald-400'
                : isRed  ? 'bg-red-500/20 text-red-400'
                :          'bg-white/10 text-gray-400'
              )}>
                {isGreen ? 'Green Day' : isRed ? 'Red Day' : 'No Trades'}
              </span>
            </div>
            <div className={cn(
              'text-3xl font-black',
              isGreen ? 'text-emerald-400' : isRed ? 'text-red-400' : 'text-gray-500'
            )}>
              {data ? (net > 0 ? '+' : '') + formatCurrency(net) : '—'}
            </div>
            {data && (
              <div className="text-xs text-gray-500 mt-1">{data.trades} trade{data.trades !== 1 ? 's' : ''}</div>
            )}
          </div>

          {/* Day Analytics */}
          {trades.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Win Rate', value: `${winRate}%`, color: 'text-amber-400' },
                { label: 'Total Trades', value: trades.length, color: 'text-white' },
                { label: 'Largest Win', value: largestWin !== null ? `+${formatCurrency(largestWin)}` : '—', color: 'text-emerald-400' },
                { label: 'Largest Loss', value: largestLoss !== null ? formatCurrency(largestLoss) : '—', color: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className="bg-white/5 rounded-xl p-3 border border-white/8">
                  <div className="text-xs text-gray-500 mb-1">{s.label}</div>
                  <div className={cn('text-lg font-black', s.color)}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Trades Section */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Trades</h3>
            {trades.length > 0 ? (
              <div className="space-y-2">
                {trades.map(trade => <TradeRow key={trade.id} trade={trade} />)}
              </div>
            ) : (
              <div className="rounded-xl border border-white/8 bg-white/3 p-6 text-center">
                <div className="text-2xl mb-2">😌</div>
                <p className="text-sm font-medium text-gray-400">No trades recorded</p>
                <p className="text-xs text-gray-600 mt-1">Rest days are part of the process.</p>
              </div>
            )}
          </div>

          {/* Notes & Emotions */}
          {(data?.notes || data?.emotionBefore || data?.committed !== undefined) && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Notes & Mindset</h3>
              <div className="bg-white/5 rounded-xl p-4 border border-white/8 space-y-3">
                {data?.notes && (
                  <p className="text-sm text-gray-300 leading-relaxed">{data.notes}</p>
                )}
                {(data?.emotionBefore || data?.emotionDuring || data?.emotionAfter) && (
                  <div className="flex flex-wrap gap-3">
                    {data.emotionBefore && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span>{emotionEmoji[data.emotionBefore] ?? ''}</span>
                        <span className="text-gray-600">Before:</span>
                        <span className="capitalize">{data.emotionBefore}</span>
                      </div>
                    )}
                    {data.emotionDuring && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span>{emotionEmoji[data.emotionDuring] ?? ''}</span>
                        <span className="text-gray-600">During:</span>
                        <span className="capitalize">{data.emotionDuring}</span>
                      </div>
                    )}
                    {data.emotionAfter && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span>{emotionEmoji[data.emotionAfter] ?? ''}</span>
                        <span className="text-gray-600">After:</span>
                        <span className="capitalize">{data.emotionAfter}</span>
                      </div>
                    )}
                  </div>
                )}
                {data?.committed !== undefined && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className={cn(
                      'w-4 h-4 rounded flex items-center justify-center',
                      data.committed ? 'bg-emerald-500/30 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    )}>
                      {data.committed ? '✓' : '✗'}
                    </div>
                    <span className={data.committed ? 'text-emerald-400' : 'text-red-400'}>
                      {data.committed ? 'Committed to plan' : 'Did not stick to plan'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer: Add Trade */}
        <div className="p-5 border-t border-white/8 flex-shrink-0">
          <Link
            href={`/trades/new?date=${dateKey}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Trade for This Day
          </Link>
        </div>
      </div>
    </>
  )
}

// ─── Calendar Page ────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1))
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  // Stats for the visible month
  const monthKeys = Object.keys(mockDayData).filter(k => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
  const monthEntries = monthKeys.map(k => mockDayData[k])
  const totalPnl = monthEntries.reduce((s, d) => s + d.pnl, 0)
  const greenDays = monthEntries.filter(d => d.pnl > 0).length
  const redDays = monthEntries.filter(d => d.pnl < 0).length
  const winRate = greenDays + redDays > 0 ? ((greenDays / (greenDays + redDays)) * 100).toFixed(0) : '0'

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return { day: d, key, data: mockDayData[key] as DayData | undefined }
  })

  const selectedData = selectedKey ? (mockDayData[selectedKey] ?? null) : null

  return (
    <>
      <div className="p-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Trading Calendar</h1>
            <p className="text-gray-500 mt-1">Click any day to see details</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-3 h-3 rounded-sm bg-emerald-500/40 border border-emerald-500/60" />
              Green day
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-3 h-3 rounded-sm bg-red-500/40 border border-red-500/60" />
              Red day
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Monthly P&L', value: formatCurrency(totalPnl), color: totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400' },
            { label: 'Green Days', value: greenDays, color: 'text-emerald-400' },
            { label: 'Red Days', value: redDays, color: 'text-red-400' },
            { label: 'Win Rate', value: `${winRate}%`, color: 'text-amber-400' },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</div>
              <div className={cn('text-2xl font-black', s.color)}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="glass rounded-2xl p-6">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1))}
              className="p-2 rounded-xl hover:bg-white/10 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <h2 className="text-lg font-bold text-white">{monthName}</h2>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1))}
              className="p-2 rounded-xl hover:bg-white/10 transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map(({ day, key, data }) => {
              const isToday = key === new Date().toISOString().split('T')[0]
              const isSelected = key === selectedKey
              return (
                <button
                  key={key}
                  onClick={() => setSelectedKey(isSelected ? null : key)}
                  className={cn(
                    'aspect-square rounded-xl p-1 flex flex-col items-center justify-center transition-all hover:scale-105 focus:outline-none',
                    data
                      ? data.pnl > 0
                        ? 'bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/60'
                        : 'bg-red-500/20 border border-red-500/30 hover:border-red-500/60'
                      : 'bg-white/3 border border-transparent hover:border-white/10',
                    isToday && 'ring-2 ring-amber-500',
                    isSelected && 'ring-2 ring-amber-400 scale-105 brightness-125'
                  )}
                >
                  <span className={cn(
                    'text-sm font-semibold',
                    data ? (data.pnl > 0 ? 'text-emerald-400' : 'text-red-400') : 'text-gray-600'
                  )}>
                    {day}
                  </span>
                  {data && (
                    <span className={cn(
                      'text-xs font-bold mt-0.5',
                      data.pnl > 0 ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {data.pnl > 0 ? '+' : ''}{Math.abs(data.pnl) > 999 ? `${(data.pnl / 1000).toFixed(1)}k` : data.pnl}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Day Detail Panel */}
      {selectedKey && (
        <DayDetailPanel
          dateKey={selectedKey}
          data={selectedData}
          onClose={() => setSelectedKey(null)}
        />
      )}
    </>
  )
}

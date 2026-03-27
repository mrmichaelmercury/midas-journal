'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Plus, TrendingUp, TrendingDown, Brain, Smile, Meh, Frown } from 'lucide-react'
import Link from 'next/link'
import { cn, formatCurrency } from '@/lib/utils'

type TradeEntry = {
  instrument: string
  direction: 'LONG' | 'SHORT'
  pnl: number
  strategy: string
  emotion: 'good' | 'neutral' | 'bad'
  note: string
}

type DayData = {
  pnl: number
  trades: number
  entries?: TradeEntry[]
}

const mockDayData: Record<string, DayData> = {
  '2024-01-01': {
    pnl: 840, trades: 2,
    entries: [
      { instrument: 'NQ', direction: 'LONG', pnl: 620, strategy: 'Crazy Horse ORB', emotion: 'good', note: 'Clean breakout, held full target. Felt focused and patient.' },
      { instrument: 'MNQ', direction: 'LONG', pnl: 220, strategy: 'Crazy Horse ORB', emotion: 'good', note: 'Scaled in on pullback nicely.' },
    ],
  },
  '2024-01-02': {
    pnl: -320, trades: 1,
    entries: [
      { instrument: 'ES', direction: 'SHORT', pnl: -320, strategy: 'Crazy Horse ORB', emotion: 'bad', note: 'Faded a strong trend. Revenge trade after missing the long. Need to be more patient.' },
    ],
  },
  '2024-01-03': {
    pnl: 1240, trades: 3,
    entries: [
      { instrument: 'NQ', direction: 'LONG', pnl: 740, strategy: 'Crazy Horse ORB', emotion: 'good', note: 'Best entry of the week. Waited for the pullback and nailed the reclaim.' },
      { instrument: 'NQ', direction: 'LONG', pnl: 310, strategy: 'Crazy Horse ORB', emotion: 'good', note: 'Continuation after lunch reset.' },
      { instrument: 'ES', direction: 'SHORT', pnl: 190, strategy: 'Crazy Horse ORB', emotion: 'neutral', note: 'Small scalp. Could have held longer.' },
    ],
  },
  '2024-01-04': { pnl: 560, trades: 2,
    entries: [
      { instrument: 'NQ', direction: 'LONG', pnl: 430, strategy: 'Crazy Horse ORB', emotion: 'good', note: 'Good conviction trade.' },
      { instrument: 'MNQ', direction: 'LONG', pnl: 130, strategy: 'Crazy Horse ORB', emotion: 'neutral', note: 'Smaller size, still profitable.' },
    ],
  },
  '2024-01-07': { pnl: -180, trades: 1,
    entries: [
      { instrument: 'ES', direction: 'LONG', pnl: -180, strategy: 'Crazy Horse ORB', emotion: 'neutral', note: 'Stopped out cleanly. Respected the stop. No issues.' },
    ],
  },
  '2024-01-08': { pnl: 920, trades: 2,
    entries: [
      { instrument: 'NQ', direction: 'LONG', pnl: 620, strategy: 'Crazy Horse ORB', emotion: 'good', note: 'Great patience waiting for the setup.' },
      { instrument: 'NQ', direction: 'SHORT', pnl: 300, strategy: 'Crazy Horse ORB', emotion: 'good', note: 'Quick reversal fade worked well.' },
    ],
  },
  '2024-01-09': { pnl: 430, trades: 1,
    entries: [
      { instrument: 'ES', direction: 'LONG', pnl: 430, strategy: 'Crazy Horse ORB', emotion: 'neutral', note: 'Solid trade, execution could be cleaner.' },
    ],
  },
  '2024-01-10': { pnl: -450, trades: 2,
    entries: [
      { instrument: 'NQ', direction: 'LONG', pnl: -280, strategy: 'Crazy Horse ORB', emotion: 'bad', note: 'Entered too early, no confirmation. Emotional after yesterday.' },
      { instrument: 'NQ', direction: 'LONG', pnl: -170, strategy: 'Crazy Horse ORB', emotion: 'bad', note: 'Should have stopped after first loss.' },
    ],
  },
  '2024-01-11': { pnl: 1100, trades: 3,
    entries: [
      { instrument: 'NQ', direction: 'LONG', pnl: 540, strategy: 'Crazy Horse ORB', emotion: 'good', note: 'Bounced back well after Thursday.' },
      { instrument: 'ES', direction: 'SHORT', pnl: 360, strategy: 'Crazy Horse ORB', emotion: 'good', note: 'Perfect ORB short. Textbook.' },
      { instrument: 'MNQ', direction: 'LONG', pnl: 200, strategy: 'Crazy Horse ORB', emotion: 'good', note: 'Momentum continuation.' },
    ],
  },
  '2024-01-14': { pnl: 660, trades: 2, entries: [
    { instrument: 'NQ', direction: 'LONG', pnl: 460, strategy: 'Crazy Horse ORB', emotion: 'good', note: 'Strong open.' },
    { instrument: 'ES', direction: 'LONG', pnl: 200, strategy: 'Crazy Horse ORB', emotion: 'neutral', note: 'Decent follow-through.' },
  ] },
  '2024-01-15': { pnl: -230, trades: 1, entries: [
    { instrument: 'NQ', direction: 'SHORT', pnl: -230, strategy: 'Crazy Horse ORB', emotion: 'neutral', note: 'Fade attempt failed. Market too strong.' },
  ] },
  '2024-01-16': { pnl: 780, trades: 2, entries: [
    { instrument: 'NQ', direction: 'LONG', pnl: 580, strategy: 'Crazy Horse ORB', emotion: 'good', note: 'Held for full target.' },
    { instrument: 'ES', direction: 'LONG', pnl: 200, strategy: 'Crazy Horse ORB', emotion: 'good', note: 'Clean add-on.' },
  ] },
  '2024-01-17': { pnl: 1350, trades: 3, entries: [
    { instrument: 'NQ', direction: 'LONG', pnl: 720, strategy: 'Crazy Horse ORB', emotion: 'good', note: 'Best day of the month. Everything clicked.' },
    { instrument: 'NQ', direction: 'LONG', pnl: 430, strategy: 'Crazy Horse ORB', emotion: 'good', note: 'Second entry on continuation.' },
    { instrument: 'MNQ', direction: 'LONG', pnl: 200, strategy: 'Crazy Horse ORB', emotion: 'good', note: 'Third entry, smaller size.' },
  ] },
  '2024-01-18': { pnl: -120, trades: 1, entries: [
    { instrument: 'ES', direction: 'LONG', pnl: -120, strategy: 'Crazy Horse ORB', emotion: 'neutral', note: 'Small stop, no big deal. Setup just didn\'t work today.' },
  ] },
}

const emotionIcon = {
  good: { icon: Smile, color: 'text-emerald-400' },
  neutral: { icon: Meh, color: 'text-amber-400' },
  bad: { icon: Frown, color: 'text-red-400' },
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1))
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const totalPnl = Object.values(mockDayData).reduce((s, d) => s + d.pnl, 0)
  const greenDays = Object.values(mockDayData).filter((d) => d.pnl > 0).length
  const redDays = Object.values(mockDayData).filter((d) => d.pnl < 0).length

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return { day: d, key, data: mockDayData[key] }
  })

  const selectedData = selectedKey ? mockDayData[selectedKey] : null
  const selectedDateLabel = selectedKey
    ? new Date(selectedKey + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : ''

  function openDay(key: string) {
    setSelectedKey(key)
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
    setTimeout(() => setSelectedKey(null), 300)
  }

  return (
    <div className="p-8 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Trading Calendar</h1>
          <p className="text-gray-500 mt-1">Your daily P&amp;L at a glance — click any day for details</p>
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
          { label: 'Monthly P&L', value: formatCurrency(totalPnl), color: 'text-emerald-400' },
          { label: 'Green Days', value: greenDays, color: 'text-emerald-400' },
          { label: 'Red Days', value: redDays, color: 'text-red-400' },
          { label: 'Win Rate', value: `${((greenDays / (greenDays + redDays)) * 100).toFixed(0)}%`, color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</div>
            <div className={cn('text-2xl font-black', s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-2 rounded-xl hover:bg-white/10 transition-all">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <h2 className="text-lg font-bold text-white">{monthName}</h2>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-2 rounded-xl hover:bg-white/10 transition-all">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map(({ day, key, data }) => {
            const isToday = key === new Date().toISOString().split('T')[0]
            const isSelected = key === selectedKey
            return (
              <button
                key={key}
                onClick={() => openDay(key)}
                className={cn(
                  'aspect-square rounded-xl p-1 flex flex-col items-center justify-center transition-all hover:scale-105 focus:outline-none',
                  data
                    ? data.pnl > 0
                      ? 'bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/60'
                      : 'bg-red-500/20 border border-red-500/30 hover:border-red-500/60'
                    : 'bg-white/3 border border-transparent hover:border-white/10',
                  isToday && 'ring-2 ring-amber-500',
                  isSelected && 'ring-2 ring-amber-400 scale-105'
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
                    {data.pnl > 0 ? '+' : ''}{Math.abs(data.pnl) > 999 ? `${(data.pnl/1000).toFixed(1)}k` : data.pnl}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Slide-over backdrop */}
      {panelOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closePanel}
        />
      )}

      {/* Slide-over panel */}
      <div className={cn(
        'fixed top-0 right-0 h-full w-full max-w-md bg-[#111111] border-l border-white/10 z-50 flex flex-col transition-transform duration-300 ease-in-out',
        panelOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Panel header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-white/5">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Day Detail</p>
            <h3 className="font-black text-white text-lg leading-tight">{selectedDateLabel}</h3>
            {selectedData && (
              <div className={cn(
                'text-2xl font-black mt-1',
                selectedData.pnl > 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {selectedData.pnl > 0 ? '+' : ''}{formatCurrency(selectedData.pnl)}
              </div>
            )}
          </div>
          <button
            onClick={closePanel}
            className="p-2 rounded-xl hover:bg-white/10 transition-all text-gray-400 hover:text-white mt-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {selectedData ? (
            <>
              {/* Summary row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Trades</p>
                  <p className="text-xl font-black text-white">{selectedData.trades}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Result</p>
                  <p className={cn('text-xl font-black', selectedData.pnl > 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {selectedData.pnl > 0 ? 'Win' : 'Loss'} Day
                  </p>
                </div>
              </div>

              {/* Trade entries */}
              {selectedData.entries && selectedData.entries.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trades</h4>
                  {selectedData.entries.map((trade, i) => {
                    const Emotion = emotionIcon[trade.emotion]
                    return (
                      <div key={i} className="bg-white/5 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                              trade.direction === 'LONG' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
                            )}>
                              {trade.direction === 'LONG' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            </div>
                            <div>
                              <span className="text-sm font-bold text-white">{trade.instrument}</span>
                              <span className="text-xs text-gray-500 ml-1.5">{trade.direction}</span>
                            </div>
                          </div>
                          <span className={cn('text-sm font-black', trade.pnl > 0 ? 'text-emerald-400' : 'text-red-400')}>
                            {trade.pnl > 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Brain className="w-3 h-3" />
                          {trade.strategy}
                        </div>
                        {trade.note && (
                          <p className="text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-2">
                            &ldquo;{trade.note}&rdquo;
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 text-xs">
                          <Emotion.icon className={cn('w-3.5 h-3.5', Emotion.color)} />
                          <span className={cn('capitalize', Emotion.color)}>{trade.emotion === 'good' ? 'Felt great' : trade.emotion === 'neutral' ? 'Neutral' : 'Struggled'}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-500 text-sm mb-1">No trades logged for this day</p>
              <p className="text-gray-600 text-xs">Click the button below to log a trade</p>
            </div>
          )}
        </div>

        {/* Panel footer */}
        <div className="px-6 py-4 border-t border-white/5">
          <Link
            href="/trades/new"
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Trade
          </Link>
        </div>
      </div>
    </div>
  )
}
